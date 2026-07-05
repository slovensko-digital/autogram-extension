import {
  SigningFlow,
  SigningFlowDelegate,
  SigningState,
} from "./flow";
import { SigningMethod } from "./types";
import { AutogramError, UserCancelledSigningException } from "./errors";
import type {
  AutogramDesktopIntegrationInterface,
  ServerInfo,
  SignResponseBody,
} from "./autogram-api/lib/apiClient";
import type {
  AutogramVMobileIntegrationInterfaceStateful,
  SignedDocument,
} from "./avm-api/lib/apiClient";

const DESKTOP_RESPONSE: SignResponseBody = {
  content: "c2lnbmVk",
  signedBy: "CN=John Smith",
  issuedBy: "CN=SVK eID ACA2",
};

const MOBILE_SIGNED: SignedDocument = {
  filename: "doc.asice",
  mimeType: "application/vnd.etsi.asic-e+zip",
  content: "bW9iaWxl",
  signers: [
    { signedBy: "CN=First", issuedBy: "CN=Issuer1" },
    { signedBy: "CN=Last", issuedBy: "CN=Issuer2" },
  ],
};

const READY: ServerInfo = { status: "READY", version: "1.0.0" };

function fakeDesktop(): AutogramDesktopIntegrationInterface {
  return {
    getLaunchURL: async () => "autogram://listen",
    info: async () => READY,
    waitForStatus: async () => READY,
    sign: async () => DESKTOP_RESPONSE,
    startBatch: async () => ({ batchId: "b" }),
    endBatch: async () => ({ status: "FINISHED" }),
  };
}

function fakeMobile(
  overrides: Partial<AutogramVMobileIntegrationInterfaceStateful> = {}
): AutogramVMobileIntegrationInterfaceStateful & {
  calls: Array<[string, unknown[]]>;
} {
  const calls: Array<[string, unknown[]]> = [];
  const record =
    <T>(name: string, result: T) =>
    (...args: unknown[]) => {
      calls.push([name, args]);
      return Promise.resolve(result);
    };
  return {
    calls,
    init: record("init", undefined),
    loadOrRegister: record("loadOrRegister", undefined),
    getQrCodeUrl: record("getQrCodeUrl", "https://avm/qr"),
    getPairingQrCodeUrl: record("getPairingQrCodeUrl", "https://avm/pair"),
    addDocument: record("addDocument", undefined),
    sendNotification: record("sendNotification", undefined),
    waitForSignature: record("waitForSignature", MOBILE_SIGNED),
    reset: record("reset", undefined),
    useRestorePoint: record("useRestorePoint", null),
    ...overrides,
  };
}

function fakeDelegate(
  method: SigningMethod | Promise<SigningMethod> = SigningMethod.reader,
  confirmRestore = true
): SigningFlowDelegate & { states: SigningState[] } {
  const states: SigningState[] = [];
  return {
    states,
    chooseMethod: () => Promise.resolve(method),
    onState: (state) => {
      states.push(state);
    },
    confirmRestorePoint: () => Promise.resolve(confirmRestore),
  };
}

const OPTIONS = { platform: "test-platform", displayName: "Test" };
const DOCUMENT = { content: "<xml/>", filename: "doc.xml" };
const PARAMS = { level: "XAdES_BASELINE_B", container: "ASiC_E" } as const;

describe("SigningFlow desktop path", () => {
  test("signs and reports desktop states ending in done", async () => {
    const delegate = fakeDelegate(SigningMethod.reader);
    const desktopStates: string[] = [];
    const flow = new SigningFlow(fakeDesktop(), fakeMobile(), delegate, OPTIONS);

    const result = await flow.sign(DOCUMENT, PARAMS, "application/xml", {
      onDesktopStateChange: (s) => desktopStates.push(s.type),
    });

    expect(result).toEqual(DESKTOP_RESPONSE);
    expect(delegate.states[0]).toEqual({
      type: "desktop",
      state: { type: "checkingApp" },
    });
    expect(delegate.states.at(-1)).toEqual({ type: "done" });
    expect(
      delegate.states.some(
        (s) => s.type === "desktop" && s.state.type === "waitingForSignature"
      )
    ).toBe(true);
    // external consumer sees the same desktop states
    expect(desktopStates).toContain("waitingForSignature");
  });
});

describe("SigningFlow mobile path", () => {
  test("uploads, shows QR, waits, flattens last signer, resets channel", async () => {
    const delegate = fakeDelegate(SigningMethod.mobile);
    const mobile = fakeMobile();
    const flow = new SigningFlow(fakeDesktop(), mobile, delegate, OPTIONS);

    const result = await flow.sign(DOCUMENT, PARAMS, "application/xml");

    expect(result).toEqual({
      content: "bW9iaWxl",
      signedBy: "CN=Last",
      issuedBy: "CN=Issuer2",
    });

    expect(delegate.states).toEqual([
      { type: "mobile", state: "preparing" },
      {
        type: "mobile",
        state: "qr-ready",
        signingUrl: "https://avm/qr",
        pairingUrl: "https://avm/pair",
      },
      { type: "done" },
    ]);

    const callNames = mobile.calls.map(([name]) => name);
    expect(callNames).toContain("loadOrRegister");
    expect(callNames).toContain("reset");

    const [, loadOrRegisterArgs] = mobile.calls.find(
      ([name]) => name === "loadOrRegister"
    )!;
    expect(loadOrRegisterArgs[0]).toEqual({
      platform: "test-platform",
      displayName: "Test",
    });

    const [, addDocumentArgs] = mobile.calls.find(
      ([name]) => name === "addDocument"
    )!;
    // container name is translated for the AVM API
    expect(addDocumentArgs[0]).toMatchObject({
      document: DOCUMENT,
      parameters: { container: "ASiC-E" },
      payloadMimeType: "application/xml",
    });
  });

  test("falls back to the default signer identification", async () => {
    const delegate = fakeDelegate(SigningMethod.mobile);
    const mobile = fakeMobile({
      waitForSignature: async () => ({ ...MOBILE_SIGNED, signers: undefined }),
    });
    const flow = new SigningFlow(fakeDesktop(), mobile, delegate, OPTIONS);

    const result = await flow.sign(DOCUMENT, PARAMS, "application/xml");
    expect(result.signedBy).toBe("Používateľ Autogramu");
    expect(result.issuedBy).toBe("(neznámy)");
  });
});

describe("SigningFlow mobile-on-mobile path", () => {
  test("reports the signing URL instead of opening it (no window access)", async () => {
    const delegate = fakeDelegate(SigningMethod.mobileOnMobile);
    const flow = new SigningFlow(fakeDesktop(), fakeMobile(), delegate, OPTIONS);

    const result = await flow.sign(DOCUMENT, PARAMS, "application/xml");

    expect(result.content).toBe("bW9iaWxl");
    expect(delegate.states).toEqual([
      { type: "mobile", state: "preparing" },
      {
        type: "mobile-on-mobile",
        state: "url-ready",
        signingUrl: "https://avm/qr",
      },
      { type: "done" },
    ]);
  });
});

describe("SigningFlow cancellation", () => {
  test("propagates user cancellation from the method chooser", async () => {
    const delegate = fakeDelegate(
      Promise.reject(new UserCancelledSigningException())
    );
    const flow = new SigningFlow(fakeDesktop(), fakeMobile(), delegate, OPTIONS);

    const pending = flow.sign(DOCUMENT, PARAMS, "application/xml");
    await expect(pending).rejects.toMatchObject({ code: "user-cancelled" });
    await pending.catch((e) => expect(AutogramError.is(e, "user-cancelled")).toBe(true));
    expect(delegate.states).toEqual([]);
  });
});

describe("SigningFlow.useRestorePoint", () => {
  const RESTORED = { content: "x", signedBy: "s", issuedBy: "i" };

  test("returns the restored object when the user confirms", async () => {
    const delegate = fakeDelegate(SigningMethod.mobile, true);
    const mobile = fakeMobile({ useRestorePoint: async () => RESTORED });
    const flow = new SigningFlow(fakeDesktop(), mobile, delegate, OPTIONS);
    await expect(flow.useRestorePoint("rp")).resolves.toEqual(RESTORED);
  });

  test("returns null when the user declines", async () => {
    const delegate = fakeDelegate(SigningMethod.mobile, false);
    const mobile = fakeMobile({ useRestorePoint: async () => RESTORED });
    const flow = new SigningFlow(fakeDesktop(), mobile, delegate, OPTIONS);
    await expect(flow.useRestorePoint("rp")).resolves.toBeNull();
  });

  test("returns null without confirmation when there is nothing to restore", async () => {
    const confirmRestorePoint = jest.fn(async () => true);
    const delegate = {
      ...fakeDelegate(SigningMethod.mobile),
      confirmRestorePoint,
    };
    const flow = new SigningFlow(fakeDesktop(), fakeMobile(), delegate, OPTIONS);
    await expect(flow.useRestorePoint("rp")).resolves.toBeNull();
    expect(confirmRestorePoint).not.toHaveBeenCalled();
  });
});
