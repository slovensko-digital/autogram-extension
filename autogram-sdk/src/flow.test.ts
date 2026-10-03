import { SigningFlow, SigningFlowDelegate, SigningState } from "./flow";
import { SigningMethod } from "./types";
import { AutogramError, UserCancelledSigningException } from "./errors";
import { fromLegacySignArgs, toSignRequest } from "./sign-request";
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

const DESKTOP_V1_RESPONSE: SignResponseBody = {
  content: "djE=",
  mimeType: "application/vnd.etsi.asic-e+zip",
  filename: "documents.asice",
  signedBy: "CN=John Smith",
  issuedBy: "CN=SVK eID ACA2",
};

function fakeDesktop(
  info: ServerInfo = READY,
  overrides: Partial<AutogramDesktopIntegrationInterface> = {}
): AutogramDesktopIntegrationInterface {
  return {
    getLaunchURL: async () => "autogram://listen",
    info: async () => info,
    waitForStatus: async () => info,
    signLegacy: async () => DESKTOP_RESPONSE,
    signV1: async () => DESKTOP_V1_RESPONSE,
    startBatch: async () => ({ batchId: "b" }),
    endBatch: async () => ({ status: "FINISHED" }),
    ...overrides,
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
const LEGACY = fromLegacySignArgs(DOCUMENT, PARAMS, "application/xml");
const REQUEST = toSignRequest(LEGACY.documents, LEGACY.parameters);

describe("SigningFlow desktop path", () => {
  test("signs and reports desktop states ending in done", async () => {
    const delegate = fakeDelegate(SigningMethod.reader);
    const desktopStates: string[] = [];
    const flow = new SigningFlow(
      fakeDesktop(),
      fakeMobile(),
      delegate,
      OPTIONS
    );

    const result = await flow.sign(REQUEST, {
      onDesktopStateChange: (s) => desktopStates.push(s.type),
    });

    // container is set, so the artifact is an ASiC-E container
    expect(result).toEqual({
      content: "c2lnbmVk",
      mimeType: "application/vnd.etsi.asic-e+zip",
      encoding: "base64",
      signatures: [{ signedBy: "CN=John Smith", issuedBy: "CN=SVK eID ACA2" }],
    });
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
  test("uploads, shows QR, waits, keeps all signers, resets channel", async () => {
    const delegate = fakeDelegate(SigningMethod.mobile);
    const mobile = fakeMobile();
    const flow = new SigningFlow(fakeDesktop(), mobile, delegate, OPTIONS);

    const result = await flow.sign(REQUEST);

    // the unified result keeps every signer and the real MIME type
    expect(result).toEqual({
      content: "bW9iaWxl",
      mimeType: "application/vnd.etsi.asic-e+zip",
      encoding: "base64",
      filename: "doc.asice",
      signatures: [
        { signedBy: "CN=First", issuedBy: "CN=Issuer1" },
        { signedBy: "CN=Last", issuedBy: "CN=Issuer2" },
      ],
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

  test("returns no signatures when the AVM document has none", async () => {
    const delegate = fakeDelegate(SigningMethod.mobile);
    const mobile = fakeMobile({
      waitForSignature: async () => ({ ...MOBILE_SIGNED, signers: undefined }),
    });
    const flow = new SigningFlow(fakeDesktop(), mobile, delegate, OPTIONS);

    const result = await flow.sign(REQUEST);
    // the legacy fallback identification is applied by toLegacySignedObject,
    // not by the flow — the raw result carries no signatures
    expect(result.signatures).toEqual([]);
  });
});

describe("SigningFlow mobile-on-mobile path", () => {
  test("reports the signing URL instead of opening it (no window access)", async () => {
    const delegate = fakeDelegate(SigningMethod.mobileOnMobile);
    const flow = new SigningFlow(
      fakeDesktop(),
      fakeMobile(),
      delegate,
      OPTIONS
    );

    const result = await flow.sign(REQUEST);

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
    const flow = new SigningFlow(
      fakeDesktop(),
      fakeMobile(),
      delegate,
      OPTIONS
    );

    const pending = flow.sign(REQUEST);
    await expect(pending).rejects.toMatchObject({ code: "user-cancelled" });
    await pending.catch((e) =>
      expect(AutogramError.is(e, "user-cancelled")).toBe(true)
    );
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
    const flow = new SigningFlow(
      fakeDesktop(),
      fakeMobile(),
      delegate,
      OPTIONS
    );
    await expect(flow.useRestorePoint("rp")).resolves.toBeNull();
    expect(confirmRestorePoint).not.toHaveBeenCalled();
  });
});

describe("SigningFlow multiple documents", () => {
  const MULTI = {
    documents: [
      { content: "<a/>", mimeType: "application/xml", filename: "a.xml" },
      {
        content: "JVBERg==",
        mimeType: "application/pdf;base64",
        filename: "b.pdf",
      },
    ],
    parameters: { form: "XAdES", container: "ASiC_E" },
  } as const;
  const V2_8: ServerInfo = { status: "READY", version: "2.8.0" };

  test("skips the method chooser and signs on desktop via /api/v1/sign", async () => {
    const chooseMethod = jest.fn(async () => SigningMethod.mobile);
    const delegate = { ...fakeDelegate(), chooseMethod };
    const signV1 = jest.fn(async () => DESKTOP_V1_RESPONSE);
    const flow = new SigningFlow(
      fakeDesktop(V2_8, { signV1 }),
      fakeMobile(),
      delegate,
      OPTIONS
    );

    const result = await flow.sign({
      documents: [...MULTI.documents],
      parameters: MULTI.parameters,
    });

    expect(chooseMethod).not.toHaveBeenCalled();
    expect(signV1).toHaveBeenCalledTimes(1);
    expect(signV1.mock.calls[0]).toEqual([
      { documents: MULTI.documents, parameters: MULTI.parameters },
      expect.any(AbortController),
    ]);
    // the desktop app reports the real MIME type and filename
    expect(result).toEqual({
      content: "djE=",
      mimeType: "application/vnd.etsi.asic-e+zip",
      encoding: "base64",
      filename: "documents.asice",
      signatures: [{ signedBy: "CN=John Smith", issuedBy: "CN=SVK eID ACA2" }],
    });
    expect(delegate.states[0]).toEqual({
      type: "desktop",
      state: { type: "checkingApp" },
    });
    expect(delegate.states.at(-1)).toEqual({ type: "done" });
  });

  test("is not supported on mobile devices", async () => {
    const delegate = fakeDelegate();
    const flow = new SigningFlow(fakeDesktop(V2_8), fakeMobile(), delegate, {
      ...OPTIONS,
      isMobileDevice: () => true,
    });

    await expect(
      flow.sign({
        documents: [...MULTI.documents],
        parameters: MULTI.parameters,
      })
    ).rejects.toMatchObject({ code: "not-supported" });
    expect(delegate.states).toEqual([]);
  });

  test("asks for an Autogram update when the app is too old", async () => {
    const delegate = fakeDelegate();
    const flow = new SigningFlow(
      fakeDesktop(READY),
      fakeMobile(),
      delegate,
      OPTIONS
    );

    await expect(
      flow.sign({
        documents: [...MULTI.documents],
        parameters: MULTI.parameters,
      })
    ).rejects.toMatchObject({ code: "app-version-too-low" });
    expect(delegate.states).toContainEqual({
      type: "desktop",
      state: {
        type: "appVersionTooLow",
        requiredVersion: "2.8.0",
        detectedVersion: "1.0.0",
      },
    });
  });

  test("rejects an empty document list", async () => {
    const flow = new SigningFlow(
      fakeDesktop(),
      fakeMobile(),
      fakeDelegate(),
      OPTIONS
    );
    await expect(flow.sign({ documents: [] })).rejects.toBeInstanceOf(
      AutogramError
    );
  });
});

describe("SigningFlow mobile path with v1 parameters", () => {
  test("sends the legacy shape to AVM and drops form-less levels it does not know", async () => {
    const mobile = fakeMobile();
    const flow = new SigningFlow(
      fakeDesktop(),
      mobile,
      fakeDelegate(SigningMethod.mobile),
      OPTIONS
    );

    await flow.sign({
      documents: [
        {
          content: "JVBERg==",
          mimeType: "application/pdf;base64",
          filename: "a.pdf",
        },
      ],
      parameters: { profile: "BASELINE_T" },
    });

    const [, addDocumentArgs] = mobile.calls.find(
      ([name]) => name === "addDocument"
    )!;
    expect(addDocumentArgs[0]).toEqual({
      document: { content: "JVBERg==", filename: "a.pdf" },
      parameters: {},
      payloadMimeType: "application/pdf;base64",
    });
  });

  test("refuses v1-only safety checks instead of silently skipping them", async () => {
    const flow = new SigningFlow(
      fakeDesktop(),
      fakeMobile(),
      fakeDelegate(SigningMethod.mobile),
      OPTIONS
    );
    await expect(
      flow.sign({
        documents: [{ content: "x", mimeType: "application/pdf;base64" }],
        parameters: { form: "PAdES", requireQualifiedCertificate: true },
      })
    ).rejects.toMatchObject({ code: "not-supported" });
  });
});
