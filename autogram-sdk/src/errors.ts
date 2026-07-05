/**
 * @module errors
 * Error types used across the SDK.
 *
 * All SDK errors carry a machine-readable {@link AutogramErrorCode} and can
 * be serialized/rehydrated with {@link AutogramError.toJSON} and
 * {@link AutogramError.fromJSON}. This matters because errors routinely
 * cross execution contexts (extension message bridge, `postMessage`,
 * worker boundaries) where prototype chains are lost — use
 * {@link AutogramError.is} instead of `instanceof` to classify errors.
 */

/**
 * Machine-readable error codes carried by {@link AutogramError}.
 *
 * - `user-cancelled` — the user actively cancelled the signing flow
 * - `aborted` — the operation was aborted programmatically (AbortSignal, page close)
 * - `timeout` — an operation did not finish in time
 * - `app-not-installed` — the Autogram desktop app could not be launched
 * - `connection-failed` — a network request to a signing backend failed
 * - `protocol-error` — an unexpected response shape or bridge failure
 * - `server-error` — a signing backend reported an error
 * - `unknown` — anything that cannot be classified more precisely
 */
export type AutogramErrorCode =
  | "user-cancelled"
  | "aborted"
  | "timeout"
  | "app-not-installed"
  | "connection-failed"
  | "protocol-error"
  | "server-error"
  | "unknown";

const AUTOGRAM_ERROR_CODES: readonly AutogramErrorCode[] = [
  "user-cancelled",
  "aborted",
  "timeout",
  "app-not-installed",
  "connection-failed",
  "protocol-error",
  "server-error",
  "unknown",
];

/**
 * Error class names used by SDK versions that did not carry `code`,
 * and by errors serialized before rehydration was introduced.
 */
const LEGACY_NAME_TO_CODE: Readonly<Record<string, AutogramErrorCode>> = {
  UserCancelledSigningException: "user-cancelled",
  AutogramAppNotInstalledException: "app-not-installed",
  AutogramTimeoutError: "timeout",
  AutogramSdkException: "unknown",
};

/** Plain-object form of an {@link AutogramError}, safe to `postMessage`. */
export interface SerializedAutogramError {
  name: string;
  code: AutogramErrorCode;
  message: string;
}

/**
 * Base class of all SDK errors.
 *
 * Prefer {@link AutogramError.is} over `instanceof`: it also recognizes
 * errors that crossed a serialization boundary (plain `{ name, code,
 * message }` objects) and errors from older SDK versions identified only
 * by their class name.
 */
export class AutogramError extends Error {
  readonly code: AutogramErrorCode;

  constructor(
    code: AutogramErrorCode,
    message: string,
    options?: { cause?: unknown }
  ) {
    super(message);
    this.name = "AutogramError";
    this.code = code;
    if (options && "cause" in options) {
      (this as { cause?: unknown }).cause = options.cause;
    }
  }

  /** Plain-object form that survives `postMessage`/`JSON.stringify`. */
  toJSON(): SerializedAutogramError {
    return { name: this.name, code: this.code, message: this.message };
  }

  /**
   * Rehydrates an error that crossed a serialization boundary.
   *
   * Accepts {@link SerializedAutogramError}, legacy bridge envelopes
   * (`{ name, message, error: {...} }`) and anything else (mapped to
   * `unknown`). Known codes are rehydrated to their concrete classes so
   * `instanceof` checks keep working within one bundle.
   */
  static fromJSON(data: unknown): AutogramError {
    const code = resolveCode(data) ?? "unknown";
    switch (code) {
      case "user-cancelled":
        return new UserCancelledSigningException();
      case "app-not-installed":
        return new AutogramAppNotInstalledException();
      default:
        return new AutogramError(code, extractMessage(data), { cause: data });
    }
  }

  /**
   * Classifies an error, optionally against a specific code.
   *
   * Unlike `instanceof`, this also matches plain serialized error objects
   * and legacy error class names, so it is safe to use on errors received
   * from another execution context.
   */
  static is(e: unknown, code?: AutogramErrorCode): e is AutogramError {
    const resolved = resolveCode(e);
    if (resolved === null) {
      return false;
    }
    return code === undefined || resolved === code;
  }
}

/**
 * Generic SDK failure.
 *
 * @deprecated Prefer throwing/classifying {@link AutogramError} with a
 * specific code. Kept for backwards compatibility.
 */
export class AutogramSdkException extends AutogramError {
  constructor(message: string, code: AutogramErrorCode = "unknown") {
    super(code, message);
    this.name = "AutogramSdkException";
  }
}

/** The user actively cancelled the signing flow. Code: `user-cancelled`. */
export class UserCancelledSigningException extends AutogramError {
  constructor() {
    super("user-cancelled", "User cancelled signing");
    this.name = "UserCancelledSigningException";
  }
}

/**
 * The Autogram desktop app could not be launched (most likely it is not
 * installed). Code: `app-not-installed`.
 */
export class AutogramAppNotInstalledException extends AutogramSdkException {
  constructor() {
    super(
      "Autogram nie je nainštalovaný. Stiahnite si ho na autogram.slovensko.digital",
      "app-not-installed"
    );
    this.name = "AutogramAppNotInstalledException";
  }
}

function isAutogramErrorCode(value: unknown): value is AutogramErrorCode {
  return (
    typeof value === "string" &&
    (AUTOGRAM_ERROR_CODES as readonly string[]).includes(value)
  );
}

function resolveCode(e: unknown): AutogramErrorCode | null {
  if (typeof e !== "object" || e === null) {
    return null;
  }
  const candidate = e as { code?: unknown; name?: unknown; error?: unknown };
  if (isAutogramErrorCode(candidate.code)) {
    return candidate.code;
  }
  if (
    typeof candidate.name === "string" &&
    candidate.name in LEGACY_NAME_TO_CODE
  ) {
    return LEGACY_NAME_TO_CODE[candidate.name];
  }
  // Legacy bridge envelope: { message, name, cause, error: {...} }
  if (
    typeof candidate.error === "object" &&
    candidate.error !== null &&
    candidate.error !== e
  ) {
    return resolveCode(candidate.error);
  }
  return null;
}

function extractMessage(e: unknown): string {
  if (typeof e === "object" && e !== null) {
    const candidate = e as { message?: unknown };
    if (typeof candidate.message === "string" && candidate.message.length > 0) {
      return candidate.message;
    }
    try {
      return JSON.stringify(e);
    } catch {
      return String(e);
    }
  }
  return String(e);
}
