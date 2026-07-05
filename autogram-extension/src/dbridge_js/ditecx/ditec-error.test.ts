import {
  UserCancelledSigningException,
  AutogramAppNotInstalledException,
  AutogramSdkException,
} from "autogram-sdk";
import { DitecErrorCodes, toDitecError } from "./types";

describe("toDitecError", () => {
  test("user cancellation maps to ERROR_CANCELLED", () => {
    const error = toDitecError(new UserCancelledSigningException());
    expect(error.code).toBe(DitecErrorCodes.ERROR_CANCELLED);
    expect(error.message).toBeTruthy();
  });

  test("app not installed maps to ERROR_NOT_INSTALLED", () => {
    const error = toDitecError(new AutogramAppNotInstalledException());
    expect(error.code).toBe(DitecErrorCodes.ERROR_NOT_INSTALLED);
    expect(error.message).toBeTruthy();
  });

  test("SDK exception maps to ERROR_GENERAL with its message", () => {
    const error = toDitecError(new AutogramSdkException("something failed"));
    expect(error.code).toBe(DitecErrorCodes.ERROR_GENERAL);
    expect(error.message).toBe("something failed");
  });

  test("non-Error values map to ERROR_GENERAL and are stringified", () => {
    const error = toDitecError("boom");
    expect(error.code).toBe(DitecErrorCodes.ERROR_GENERAL);
    expect(error.message).toBe("boom");
  });

  test("errors serialized over the message bridge (plain objects) keep their code", () => {
    // The extension bridge serializes errors to plain { name, message } objects;
    // mapping must not depend on the prototype chain.
    const error = toDitecError({
      name: "UserCancelledSigningException",
      message: "User cancelled signing",
    });
    expect(error.code).toBe(DitecErrorCodes.ERROR_CANCELLED);
    expect(error.message).toBe("User cancelled signing");
  });

  test("serialized AutogramError codes are recognized", () => {
    const error = toDitecError({
      name: "AutogramError",
      code: "user-cancelled",
      message: "User cancelled signing",
    });
    expect(error.code).toBe(DitecErrorCodes.ERROR_CANCELLED);
  });
});
