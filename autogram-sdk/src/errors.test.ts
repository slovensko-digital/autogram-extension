import {
  AutogramError,
  AutogramSdkException,
  UserCancelledSigningException,
  AutogramAppNotInstalledException,
} from "./errors";

describe("AutogramError codes", () => {
  test("legacy classes carry the expected codes", () => {
    expect(new UserCancelledSigningException().code).toBe("user-cancelled");
    expect(new AutogramAppNotInstalledException().code).toBe(
      "app-not-installed"
    );
    expect(new AutogramSdkException("x").code).toBe("unknown");
    expect(new AutogramSdkException("x", "timeout").code).toBe("timeout");
  });

  test("legacy classes remain instances of AutogramError and Error", () => {
    const e = new UserCancelledSigningException();
    expect(e).toBeInstanceOf(AutogramError);
    expect(e).toBeInstanceOf(Error);
    expect(e.name).toBe("UserCancelledSigningException");
  });
});

describe("AutogramError.is", () => {
  test("matches real instances, optionally by code", () => {
    const e = new UserCancelledSigningException();
    expect(AutogramError.is(e)).toBe(true);
    expect(AutogramError.is(e, "user-cancelled")).toBe(true);
    expect(AutogramError.is(e, "timeout")).toBe(false);
  });

  test("matches serialized plain objects by code", () => {
    const serialized = { name: "AutogramError", code: "timeout", message: "t" };
    expect(AutogramError.is(serialized)).toBe(true);
    expect(AutogramError.is(serialized, "timeout")).toBe(true);
    expect(AutogramError.is(serialized, "user-cancelled")).toBe(false);
  });

  test("matches legacy error names without code", () => {
    const legacy = { name: "UserCancelledSigningException", message: "c" };
    expect(AutogramError.is(legacy, "user-cancelled")).toBe(true);
  });

  test("matches legacy bridge envelopes ({ error: { name } })", () => {
    const envelope = {
      message: "User cancelled signing",
      error: { name: "UserCancelledSigningException" },
    };
    expect(AutogramError.is(envelope, "user-cancelled")).toBe(true);
  });

  test("rejects unrelated values", () => {
    expect(AutogramError.is(new Error("plain"))).toBe(false);
    expect(AutogramError.is("boom")).toBe(false);
    expect(AutogramError.is(null)).toBe(false);
    expect(AutogramError.is({ code: "not-a-real-code" })).toBe(false);
  });
});

describe("AutogramError serialization round trip", () => {
  test("toJSON produces a plain serializable object", () => {
    const e = new AutogramSdkException("Časový limit vypršal", "timeout");
    expect(JSON.parse(JSON.stringify(e.toJSON()))).toEqual({
      name: "AutogramSdkException",
      code: "timeout",
      message: "Časový limit vypršal",
    });
  });

  test("fromJSON rehydrates known codes to concrete classes", () => {
    const cancelled = AutogramError.fromJSON(
      new UserCancelledSigningException().toJSON()
    );
    expect(cancelled).toBeInstanceOf(UserCancelledSigningException);

    const notInstalled = AutogramError.fromJSON(
      new AutogramAppNotInstalledException().toJSON()
    );
    expect(notInstalled).toBeInstanceOf(AutogramAppNotInstalledException);
  });

  test("fromJSON keeps code and message for other codes", () => {
    const e = AutogramError.fromJSON({
      name: "AutogramSdkException",
      code: "timeout",
      message: "Časový limit vypršal",
    });
    expect(e).toBeInstanceOf(AutogramError);
    expect(e.code).toBe("timeout");
    expect(e.message).toBe("Časový limit vypršal");
  });

  test("fromJSON handles legacy bridge envelopes", () => {
    // Shape produced by older background workers:
    // { message, name, cause, error: { name } }
    const e = AutogramError.fromJSON({
      message: "User cancelled signing",
      name: "Error",
      error: { name: "UserCancelledSigningException" },
    });
    expect(e).toBeInstanceOf(UserCancelledSigningException);
    expect(e.code).toBe("user-cancelled");
  });

  test("fromJSON maps unrecognized data to code 'unknown'", () => {
    const e = AutogramError.fromJSON({ message: "weird failure" });
    expect(e.code).toBe("unknown");
    expect(e.message).toBe("weird failure");
  });
});
