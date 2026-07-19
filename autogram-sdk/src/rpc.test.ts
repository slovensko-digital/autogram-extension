import { z } from "zod";
import {
  createRpcClient,
  createRpcHandler,
  defineRpcService,
  RpcClientTransport,
  RpcHandler,
  RpcImpl,
  RpcResponseFrame,
} from "./rpc";
import { AutogramError, UserCancelledSigningException } from "./errors";

const testService = defineRpcService("test", {
  echo: {
    args: z.object({ value: z.string() }),
    result: z.string(),
  },
  fail: {
    args: z.null(),
    result: z.null(),
  },
  slow: {
    args: z.null(),
    result: z.string(),
    // no timeout — long-running
  },
  quick: {
    args: z.null(),
    result: z.string(),
    timeoutMs: 20,
    timeoutMessage: "Časový limit vypršal",
  },
  dynamicTimeout: {
    args: z.object({ timeout: z.number() }),
    result: z.string(),
    timeoutMs: (args: { timeout: number }) => args.timeout,
  },
});

/**
 * In-memory transport pair: what the client sends is (JSON round-tripped,
 * like postMessage) handed to the handler; the handler's response frames
 * flow back the same way.
 */
function connect(handler: RpcHandler, senderId = "tab-1"): RpcClientTransport {
  const responseListeners: Array<(frame: RpcResponseFrame) => void> = [];
  return {
    send(frame) {
      const wireFrame = JSON.parse(JSON.stringify(frame));
      void handler.handle(wireFrame, senderId).then((response) => {
        if (response) {
          const wireResponse = JSON.parse(JSON.stringify(response));
          responseListeners.forEach((cb) => cb(wireResponse));
        }
      });
    },
    onResponse(callback) {
      responseListeners.push(callback);
    },
  };
}

function makeImpl(
  overrides: Partial<RpcImpl<typeof testService.methods>> = {}
): RpcImpl<typeof testService.methods> {
  return {
    echo: async (args) => `echo:${args.value}`,
    fail: async () => {
      throw new UserCancelledSigningException();
    },
    slow: () => new Promise(() => {}), // never resolves
    quick: () => new Promise(() => {}),
    dynamicTimeout: () => new Promise(() => {}),
    ...overrides,
  };
}

describe("rpc round trip", () => {
  test("calls a method and returns the parsed result", async () => {
    const handler = createRpcHandler(testService, makeImpl());
    const client = createRpcClient(testService, connect(handler));
    await expect(client.echo({ value: "hi" })).resolves.toBe("echo:hi");
  });

  test("rehydrates errors thrown by the implementation", async () => {
    const handler = createRpcHandler(testService, makeImpl());
    const client = createRpcClient(testService, connect(handler));
    const pending = client.fail(null);
    await expect(pending).rejects.toBeInstanceOf(UserCancelledSigningException);
    await expect(pending).rejects.toMatchObject({ code: "user-cancelled" });
  });

  test("rejects invalid arguments with protocol-error before reaching the impl", async () => {
    const echo = jest.fn();
    const handler = createRpcHandler(
      testService,
      makeImpl({ echo: echo as never })
    );
    const client = createRpcClient(testService, connect(handler));
    await expect(
      client.echo({ value: 42 as unknown as string })
    ).rejects.toMatchObject({ code: "protocol-error" });
    expect(echo).not.toHaveBeenCalled();
  });

  test("rejects unknown methods with protocol-error", async () => {
    const handler = createRpcHandler(testService, makeImpl());
    const response = await handler.handle(
      { id: "x", service: "test", method: "nope", payload: null },
      "tab-1"
    );
    expect(response).toMatchObject({
      id: "x",
      ok: false,
      payload: { code: "protocol-error" },
    });
  });
});

describe("rpc cancellation", () => {
  test("client AbortSignal rejects the call and aborts the impl signal", async () => {
    let implSignal: AbortSignal | undefined;
    const handler = createRpcHandler(
      testService,
      makeImpl({
        slow: (_args, context) => {
          implSignal = context.signal;
          return new Promise(() => {});
        },
      })
    );
    const client = createRpcClient(testService, connect(handler));

    const abortController = new AbortController();
    const pending = client.slow(null, { signal: abortController.signal });
    await Promise.resolve(); // let the request frame reach the handler
    abortController.abort();

    await expect(pending).rejects.toMatchObject({ code: "aborted" });
    // abort frame reached the handler and fired the context signal
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(implSignal?.aborted).toBe(true);
  });

  test("already-aborted signal rejects without sending anything", async () => {
    const handler = createRpcHandler(testService, makeImpl());
    const transport = connect(handler);
    const send = jest.spyOn(transport, "send");
    const client = createRpcClient(testService, transport);

    const abortController = new AbortController();
    abortController.abort();
    await expect(
      client.echo({ value: "hi" }, { signal: abortController.signal })
    ).rejects.toMatchObject({ code: "aborted" });
    expect(send).not.toHaveBeenCalled();
  });

  test("abortSender aborts all in-flight requests of one caller", async () => {
    const signals: AbortSignal[] = [];
    const handler = createRpcHandler(
      testService,
      makeImpl({
        slow: (_args, context) => {
          signals.push(context.signal);
          return new Promise(() => {});
        },
      })
    );
    const client = createRpcClient(testService, connect(handler, "tab-7"));
    void client.slow(null);
    void client.slow(null);
    await new Promise((resolve) => setTimeout(resolve, 0));

    handler.abortSender("tab-7");
    expect(signals).toHaveLength(2);
    expect(signals.every((s) => s.aborted)).toBe(true);
  });
});

describe("rpc timeouts", () => {
  test("static timeout rejects with the configured message and code", async () => {
    const handler = createRpcHandler(testService, makeImpl());
    const client = createRpcClient(testService, connect(handler));
    const pending = client.quick(null);
    await expect(pending).rejects.toMatchObject({
      code: "timeout",
      message: "Časový limit vypršal",
    });
  });

  test("dynamic timeout derives from the call arguments", async () => {
    const handler = createRpcHandler(testService, makeImpl());
    const client = createRpcClient(testService, connect(handler));
    await expect(client.dynamicTimeout({ timeout: 10 })).rejects.toMatchObject(
      { code: "timeout" }
    );
  });

  test("timeout also aborts the far side", async () => {
    let implSignal: AbortSignal | undefined;
    const handler = createRpcHandler(
      testService,
      makeImpl({
        quick: (_args, context) => {
          implSignal = context.signal;
          return new Promise(() => {});
        },
      })
    );
    const client = createRpcClient(testService, connect(handler));
    await expect(client.quick(null)).rejects.toMatchObject({
      code: "timeout",
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(implSignal?.aborted).toBe(true);
  });
});

describe("rpc transport sharing", () => {
  test("two clients on one transport ignore each other's responses", async () => {
    const otherService = defineRpcService("other", {
      ping: { args: z.null(), result: z.string() },
    });
    const testHandler = createRpcHandler(testService, makeImpl());
    const otherHandler = createRpcHandler(otherService, {
      ping: async () => "pong",
    });

    // one transport that routes by service name, like the extension bridge
    const responseListeners: Array<(frame: RpcResponseFrame) => void> = [];
    const transport: RpcClientTransport = {
      send(frame) {
        const target =
          "service" in frame && frame.service === "other"
            ? otherHandler
            : testHandler;
        void target.handle(frame, "tab-1").then((response) => {
          if (response) responseListeners.forEach((cb) => cb(response));
        });
      },
      onResponse: (cb) => {
        responseListeners.push(cb);
      },
    };

    const testClient = createRpcClient(testService, transport);
    const otherClient = createRpcClient(otherService, transport);

    await expect(
      Promise.all([testClient.echo({ value: "a" }), otherClient.ping(null)])
    ).resolves.toEqual(["echo:a", "pong"]);
  });

  test("AutogramError codes survive the JSON wire format", async () => {
    const handler = createRpcHandler(
      testService,
      makeImpl({
        fail: async () => {
          throw new AutogramError("app-not-installed", "not installed");
        },
      })
    );
    const client = createRpcClient(testService, connect(handler));
    const pending = client.fail(null);
    await expect(pending).rejects.toMatchObject({ code: "app-not-installed" });
    await expect(pending).rejects.toBeInstanceOf(AutogramError);
  });
});
