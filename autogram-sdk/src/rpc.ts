/**
 * @module rpc
 * Typed request/response layer for bridging SDK calls across execution
 * contexts (browser-extension injected script ↔ content script ↔
 * background worker).
 *
 * A service is defined **once** as a method table — name, zod args schema,
 * zod result schema, timeout policy — and both sides are generated from it:
 * {@link createRpcClient} produces a typed async proxy, and
 * {@link createRpcHandler} produces a validating dispatcher. This keeps the
 * wire format in a single place instead of hand-written (and drifting)
 * copies on each side of the bridge.
 *
 * Frames are plain JSON-safe objects by construction (schemas only admit
 * serializable shapes), so transports can move them with `postMessage`,
 * `CustomEvent` or `runtime.Port` without per-method serialization
 * concerns. Errors cross the boundary as {@link SerializedAutogramError}
 * and are rehydrated with {@link AutogramError.fromJSON}.
 *
 * Cancellation is generic: every request id can be aborted with an abort
 * frame; the handler exposes the abort as `context.signal` to the
 * implementation. Client-side `AbortSignal`s and timeouts both emit abort
 * frames, so long-running calls are cancelled on the far side too.
 */

import { z } from "zod";
import {
  AutogramError,
  SerializedAutogramError,
} from "./errors";
import { createLogger } from "./log";

const log = createLogger("ag-sdk:rpc");

/* ------------------------------------------------------------------ */
/* Frames                                                              */
/* ------------------------------------------------------------------ */

export const ZRpcRequestFrame = z.object({
  id: z.string(),
  service: z.string(),
  method: z.string(),
  payload: z.unknown(),
});
export type RpcRequestFrame = z.infer<typeof ZRpcRequestFrame>;

export const ZRpcAbortFrame = z.object({
  id: z.string(),
  abort: z.literal(true),
});
export type RpcAbortFrame = z.infer<typeof ZRpcAbortFrame>;

/** Frames flowing from the caller side towards the handler side. */
export const ZRpcCallerFrame = z.union([ZRpcAbortFrame, ZRpcRequestFrame]);
export type RpcCallerFrame = z.infer<typeof ZRpcCallerFrame>;

export const ZRpcResponseFrame = z.object({
  id: z.string(),
  ok: z.boolean(),
  /** Method result when `ok`, {@link SerializedAutogramError} otherwise. */
  payload: z.unknown(),
});
export type RpcResponseFrame = z.infer<typeof ZRpcResponseFrame>;

/* ------------------------------------------------------------------ */
/* Service definition                                                  */
/* ------------------------------------------------------------------ */

export interface RpcMethodDef<
  A extends z.ZodTypeAny = z.ZodTypeAny,
  R extends z.ZodTypeAny = z.ZodTypeAny,
> {
  args: A;
  result: R;
  /**
   * Client-side timeout. `undefined`/`null` = no timeout (long-running
   * calls like waiting for a signature). A function computes the timeout
   * from the call's arguments.
   */
  timeoutMs?: number | null | ((args: z.infer<A>) => number | null);
  /** User-facing message for the timeout error (shown by the UI). */
  timeoutMessage?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RpcMethods = Record<string, RpcMethodDef<any, any>>;

export interface RpcServiceDef<M extends RpcMethods = RpcMethods> {
  name: string;
  methods: M;
}

export function defineRpcService<M extends RpcMethods>(
  name: string,
  methods: M
): RpcServiceDef<M> {
  return { name, methods };
}

/* ------------------------------------------------------------------ */
/* Client                                                              */
/* ------------------------------------------------------------------ */

export type RpcClient<M extends RpcMethods> = {
  [K in keyof M]: (
    args: z.infer<M[K]["args"]>,
    options?: { signal?: AbortSignal }
  ) => Promise<z.infer<M[K]["result"]>>;
};

/**
 * Caller-side transport: delivers caller frames towards the handler and
 * surfaces response frames coming back.
 */
export interface RpcClientTransport {
  send(frame: RpcCallerFrame): void;
  /** Register a response listener. Multiple listeners are allowed (one per client sharing the transport). */
  onResponse(callback: (frame: RpcResponseFrame) => void): void;
}

export function createRpcClient<M extends RpcMethods>(
  service: RpcServiceDef<M>,
  transport: RpcClientTransport,
  options?: { generateId?: () => string }
): RpcClient<M> {
  const generateId =
    options?.generateId ?? (() => globalThis.crypto.randomUUID());
  const pending = new Map<
    string,
    { resolve: (value: unknown) => void; reject: (reason: unknown) => void }
  >();

  transport.onResponse((frame) => {
    const entry = pending.get(frame.id);
    if (!entry) {
      // Response for another client on the same transport, or for a call
      // that already timed out/aborted.
      log.debug(`${service.name}: no pending call for response`, frame.id);
      return;
    }
    pending.delete(frame.id);
    if (frame.ok) {
      entry.resolve(frame.payload);
    } else {
      entry.reject(AutogramError.fromJSON(frame.payload));
    }
  });

  const client = {} as RpcClient<M>;
  for (const methodName of Object.keys(service.methods) as Array<keyof M>) {
    const def = service.methods[methodName];
    client[methodName] = ((args: unknown, callOptions?: { signal?: AbortSignal }) => {
      const id = generateId();
      const signal = callOptions?.signal;

      if (signal?.aborted) {
        return Promise.reject(
          new AutogramError("aborted", `${String(methodName)} aborted`)
        );
      }

      return new Promise((resolve, reject) => {
        let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
        const settle = (fn: (value: never) => void) => (value: never) => {
          if (timeoutHandle !== null) clearTimeout(timeoutHandle);
          signal?.removeEventListener("abort", onAbort);
          pending.delete(id);
          fn(value);
        };
        const resolveOnce = settle((payload) =>
          resolve(def.result.parse(payload))
        );
        const rejectOnce = settle(reject);

        const onAbort = () => {
          transport.send({ id, abort: true });
          rejectOnce(
            new AutogramError(
              "aborted",
              `${String(methodName)} aborted`
            ) as never
          );
        };
        signal?.addEventListener("abort", onAbort, { once: true });

        const timeoutMs =
          typeof def.timeoutMs === "function"
            ? def.timeoutMs(args)
            : (def.timeoutMs ?? null);
        if (timeoutMs !== null) {
          timeoutHandle = setTimeout(() => {
            // cancel the far side too
            transport.send({ id, abort: true });
            rejectOnce(
              new AutogramError(
                "timeout",
                def.timeoutMessage ??
                  `Timeout waiting for ${service.name}.${String(methodName)}`
              ) as never
            );
          }, timeoutMs);
        }

        pending.set(id, { resolve: resolveOnce, reject: rejectOnce });
        transport.send({
          id,
          service: service.name,
          method: String(methodName),
          payload: args ?? null,
        });
      });
    }) as RpcClient<M>[keyof M];
  }
  return client;
}

/* ------------------------------------------------------------------ */
/* Handler                                                             */
/* ------------------------------------------------------------------ */

export interface RpcContext {
  /** Stable identifier of the caller (e.g. extension tab|frame). */
  senderId: string;
  /** The request frame id (useful for resuming long calls after restarts). */
  requestId: string;
  /** Fires when the caller sends an abort frame for this request. */
  signal: AbortSignal;
}

export type RpcImpl<M extends RpcMethods> = {
  [K in keyof M]: (
    args: z.infer<M[K]["args"]>,
    context: RpcContext
  ) => Promise<z.infer<M[K]["result"]>>;
};

export interface RpcHandler {
  serviceName: string;
  /**
   * Processes a caller frame. Returns the response frame to send back, or
   * `null` for frames that produce no response (aborts, foreign aborts).
   */
  handle(
    frame: RpcCallerFrame,
    senderId: string
  ): Promise<RpcResponseFrame | null>;
  /** Aborts all in-flight requests of one caller (e.g. on port disconnect). */
  abortSender(senderId: string, reason?: string): void;
}

/** Serializes any thrown value to a wire-safe error payload. */
export function serializeRpcError(e: unknown): SerializedAutogramError {
  if (e instanceof AutogramError) {
    return e.toJSON();
  }
  if (AutogramError.is(e)) {
    return AutogramError.fromJSON(e).toJSON();
  }
  return {
    name: e instanceof Error ? e.name : "Error",
    code: "unknown",
    message: e instanceof Error ? e.message : String(e),
  };
}

export function createRpcHandler<M extends RpcMethods>(
  service: RpcServiceDef<M>,
  impl: RpcImpl<M>
): RpcHandler {
  const inflight = new Map<
    string,
    { controller: AbortController; senderId: string }
  >();

  const errorResponse = (id: string, e: unknown): RpcResponseFrame => ({
    id,
    ok: false,
    payload: serializeRpcError(e),
  });

  return {
    serviceName: service.name,

    async handle(frame, senderId) {
      if ("abort" in frame) {
        // Abort frames carry no service name; ignore ids we don't hold
        // (they may belong to a sibling service on the same transport).
        inflight.get(frame.id)?.controller.abort("Aborted by caller");
        return null;
      }

      const def = service.methods[frame.method];
      if (!def) {
        return errorResponse(
          frame.id,
          new AutogramError(
            "protocol-error",
            `Unknown method ${service.name}.${frame.method}`
          )
        );
      }

      let args: unknown;
      try {
        args = def.args.parse(frame.payload);
      } catch (e) {
        return errorResponse(
          frame.id,
          new AutogramError(
            "protocol-error",
            `Invalid arguments for ${service.name}.${frame.method}`,
            { cause: e }
          )
        );
      }

      const controller = new AbortController();
      inflight.set(frame.id, { controller, senderId });
      try {
        const result = await impl[frame.method as keyof M](args as never, {
          senderId,
          requestId: frame.id,
          signal: controller.signal,
        });
        return {
          id: frame.id,
          ok: true,
          payload: def.result.parse(result ?? null),
        };
      } catch (e) {
        log.debug(`${service.name}.${frame.method} failed`, e);
        return errorResponse(frame.id, e);
      } finally {
        inflight.delete(frame.id);
      }
    },

    abortSender(senderId, reason = "Caller disconnected") {
      // .forEach instead of for..of: consumers typecheck this file under ES5
      inflight.forEach((entry, id) => {
        if (entry.senderId === senderId) {
          entry.controller.abort(reason);
          inflight.delete(id);
        }
      });
    },
  };
}
