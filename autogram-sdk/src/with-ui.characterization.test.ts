/**
 * @jest-environment jsdom
 */
/**
 * Characterization tests: pin what `CombinedClient.sign` sends to the
 * desktop and mobile channels and what it returns, so internal refactors of
 * the signing flow cannot silently change the public behaviour. Calls of the
 * removed legacy positional form go through its documented migration
 * (`fromLegacySignArgs` + `toLegacySignedObject`) and must still produce
 * the same wire requests and results.
 */
import { TextDecoder, TextEncoder } from "util";
Object.assign(globalThis, { TextEncoder, TextDecoder });
// jsdom does not implement modal dialogs
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.open = true;
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.open = false;
};

import type {
  AutogramDesktopIntegrationInterface,
  ServerInfo,
  SignResponseBody,
} from "./autogram-api/lib/apiClient";
import type {
  AutogramVMobileIntegrationInterfaceStateful,
  SignedDocument,
} from "./avm-api/lib/apiClient";
import { AutogramError, UserCancelledSigningException } from "./errors";
import { SigningMethod, toLegacySignedObject } from "./types";
import { fromLegacySignArgs } from "./sign-request";
import type {
  LegacyAutogramDocument,
  LegacySignatureParameters,
} from "./autogram-api/lib/apiClient";
import { Base64 } from "js-base64";
import type { CombinedClient } from "./with-ui";

// QR rendering is irrelevant here and the package does not resolve under jsdom
jest.mock("@bwip-js/generic", () => ({ toSVG: () => "<svg></svg>" }), {
  virtual: true,
});

// with-ui registers custom elements at import time, after the polyfills above
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createAutogramClient } =
  require("./with-ui") as typeof import("./with-ui");

const READY: ServerInfo = { status: "READY", version: "2.7.6" };
const DESKTOP_RESPONSE: SignResponseBody = {
  content: "aGVsbG8gc2lnbmVk", // "hello signed"
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

type Calls = Array<[string, unknown[]]>;

function recorder<T extends object>(
  impl: Record<string, (...args: never[]) => Promise<unknown>>
): T & { calls: Calls } {
  const calls: Calls = [];
  const fake: Record<string, unknown> = { calls };
  for (const [name, fn] of Object.entries(impl)) {
    fake[name] = (...args: never[]) => {
      calls.push([name, args]);
      return fn(...args);
    };
  }
  return fake as T & { calls: Calls };
}

function fakeDesktop(
  signLegacy: () => Promise<SignResponseBody> = async () => DESKTOP_RESPONSE
) {
  return recorder<AutogramDesktopIntegrationInterface>({
    getLaunchURL: async () => "autogram://listen",
    info: async () => READY,
    waitForStatus: async () => READY,
    signLegacy,
    startBatch: async () => ({ batchId: "b" }),
    endBatch: async () => ({ status: "FINISHED" }),
  });
}

function fakeMobile() {
  return recorder<AutogramVMobileIntegrationInterfaceStateful>({
    init: async () => undefined,
    loadOrRegister: async () => undefined,
    getQrCodeUrl: async () => "https://avm/qr",
    getPairingQrCodeUrl: async () => "https://avm/pair",
    addDocument: async () => undefined,
    sendNotification: async () => undefined,
    waitForSignature: async () => MOBILE_SIGNED,
    reset: async () => undefined,
    useRestorePoint: async () => null,
  });
}

type Root = HTMLElement & {
  choiceResult: {
    resolve(m: SigningMethod): void;
    reject(e: unknown): void;
  } | null;
  errorMessage: string;
};

function root(): Root {
  return document.querySelector("autogram-root") as Root;
}

async function choose(method: SigningMethod) {
  for (let i = 0; i < 100 && !root().choiceResult; i++) {
    await new Promise((r) => setTimeout(r, 0));
  }
  root().choiceResult!.resolve(method);
}

const argsOf = (calls: Calls, name: string) =>
  calls.find(([n]) => n === name)?.[1];

let desktop: ReturnType<typeof fakeDesktop>;
let mobile: ReturnType<typeof fakeMobile>;
let client: CombinedClient;

/** The removed `sign(document, parameters, payloadMimeType, decodeBase64)` call, migrated. */
async function signLegacy(
  document: LegacyAutogramDocument,
  parameters: LegacySignatureParameters,
  payloadMimeType: string,
  decodeBase64 = false
) {
  const migrated = fromLegacySignArgs(document, parameters, payloadMimeType);
  const signed = toLegacySignedObject(
    await client.sign(migrated.documents, migrated.parameters, {
      presentation: migrated.presentation,
    })
  );
  return decodeBase64
    ? { ...signed, content: Base64.decode(signed.content) }
    : signed;
}

afterAll(() => {
  document.body.innerHTML = "";
});

async function setup(desktopChannel = fakeDesktop()) {
  document.body.innerHTML = "";
  desktop = desktopChannel;
  mobile = fakeMobile();
  client = await createAutogramClient({
    desktopChannel: desktop,
    mobileChannel: mobile,
  });
}

describe("CombinedClient.sign with migrated legacy input", () => {
  beforeEach(() => setup());

  test("desktop: passes the call through and returns the legacy SignedObject", async () => {
    const pending = signLegacy(
      { content: "PGEvPg==", filename: "a.xml" },
      { level: "XAdES_BASELINE_B", container: "ASiC_E", autoLoadEform: true },
      "application/xml;base64"
    );
    await choose(SigningMethod.reader);

    await expect(pending).resolves.toEqual(DESKTOP_RESPONSE);
    const [document, parameters, payloadMimeType, batchId, abortController] =
      argsOf(desktop.calls, "signLegacy")!;
    expect(document).toEqual({ content: "PGEvPg==", filename: "a.xml" });
    expect(parameters).toEqual({
      level: "XAdES_BASELINE_B",
      container: "ASiC_E",
      autoLoadEform: true,
    });
    expect(payloadMimeType).toBe("application/xml;base64");
    expect(batchId).toBeUndefined();
    expect(abortController).toBeInstanceOf(AbortController);
    expect(root().style.display).toBe("none");
  });

  test("desktop: decodeBase64 decodes the content", async () => {
    const pending = signLegacy(
      { content: "x" },
      { level: "XAdES_BASELINE_B" },
      "text/plain",
      true
    );
    await choose(SigningMethod.reader);
    await expect(pending).resolves.toEqual({
      ...DESKTOP_RESPONSE,
      content: "hello signed",
    });
  });

  test("mobile: uploads the legacy shape to AVM and returns the last signer", async () => {
    const pending = signLegacy(
      { content: "PGEvPg==", filename: "a.xml" },
      { level: "XAdES_BASELINE_B", container: "ASiC_E" },
      "application/xml;base64"
    );
    await choose(SigningMethod.mobile);

    await expect(pending).resolves.toEqual({
      content: "bW9iaWxl",
      signedBy: "CN=Last",
      issuedBy: "CN=Issuer2",
    });
    expect(argsOf(mobile.calls, "addDocument")?.[0]).toEqual({
      document: { content: "PGEvPg==", filename: "a.xml" },
      parameters: { level: "XAdES_BASELINE_B", container: "ASiC-E" },
      payloadMimeType: "application/xml;base64",
    });
    expect(argsOf(desktop.calls, "signLegacy")).toBeUndefined();
  });

  test("bumps the signature index after a successful signature", async () => {
    const before = client.getSignatureIndex();
    const pending = signLegacy({ content: "x" }, {}, "text/plain");
    await choose(SigningMethod.reader);
    await pending;
    expect(client.getSignatureIndex()).toBe(before + 1);
  });
});

describe("CombinedClient.sign", () => {
  beforeEach(() => setup());

  test("desktop: encodes the wire mime type and returns a SignedDocumentResult", async () => {
    const pending = client.sign(
      {
        content: "JVBERg==",
        mimeType: "application/pdf",
        encoding: "base64",
        filename: "a.pdf",
      },
      { form: "PAdES" } // legacy level "PAdES_BASELINE_B"
    );
    await choose(SigningMethod.reader);

    await expect(pending).resolves.toEqual({
      content: DESKTOP_RESPONSE.content,
      mimeType: "application/pdf",
      encoding: "base64",
      signatures: [{ signedBy: "CN=John Smith", issuedBy: "CN=SVK eID ACA2" }],
    });
    const [document, parameters, payloadMimeType] = argsOf(
      desktop.calls,
      "signLegacy"
    )!;
    expect(document).toEqual({ content: "JVBERg==", filename: "a.pdf" });
    expect(parameters).toEqual({ level: "PAdES_BASELINE_B" });
    expect(payloadMimeType).toBe("application/pdf;base64");
  });

  test("desktop: missing parameters are sent as an empty object", async () => {
    const pending = client.sign({
      content: "<a/>",
      mimeType: "application/xml",
    });
    await choose(SigningMethod.reader);
    await pending;
    const [, parameters, payloadMimeType] = argsOf(
      desktop.calls,
      "signLegacy"
    )!;
    expect(parameters).toEqual({});
    expect(payloadMimeType).toBe("application/xml");
  });

  test("desktop: reports progress through onState", async () => {
    const states: string[] = [];
    const pending = client.sign(
      { content: "<a/>", mimeType: "application/xml" },
      undefined,
      {
        onState: (s) => states.push(s.type),
      }
    );
    await choose(SigningMethod.reader);
    await pending;
    expect(states).toEqual([
      "checkingApp",
      "checkingApp",
      "waitingForSignature",
    ]);
  });

  test("mobile: keeps every signer and the AVM MIME type", async () => {
    const pending = client.sign(
      {
        content: "PGEvPg==",
        mimeType: "application/xml",
        encoding: "base64",
        filename: "a.xml",
      },
      { form: "XAdES", container: "ASiC_E" } // legacy level "XAdES_BASELINE_B"
    );
    await choose(SigningMethod.mobile);

    await expect(pending).resolves.toEqual({
      content: "bW9iaWxl",
      mimeType: "application/vnd.etsi.asic-e+zip",
      encoding: "base64",
      filename: "doc.asice",
      signatures: MOBILE_SIGNED.signers,
    });
    expect(argsOf(mobile.calls, "addDocument")?.[0]).toEqual({
      document: { content: "PGEvPg==", filename: "a.xml" },
      parameters: { level: "XAdES_BASELINE_B", container: "ASiC-E" },
      payloadMimeType: "application/xml;base64",
    });
  });
});

describe("CombinedClient.sign errors", () => {
  test("closing the method chooser rejects with user-cancelled", async () => {
    await setup();
    const pending = client.sign({
      content: "<a/>",
      mimeType: "application/xml",
    });
    for (let i = 0; i < 100 && !root().choiceResult; i++)
      await new Promise((r) => setTimeout(r, 0));
    root().choiceResult!.reject(new UserCancelledSigningException());

    const error = await pending.catch((e) => e);
    expect(AutogramError.is(error, "user-cancelled")).toBe(true);
    expect(argsOf(desktop.calls, "signLegacy")).toBeUndefined();
  });

  test("cancelling in the desktop app rejects with user-cancelled", async () => {
    await setup(
      fakeDesktop(async () =>
        Promise.reject(new UserCancelledSigningException())
      )
    );
    const pending = client.sign({
      content: "<a/>",
      mimeType: "application/xml",
    });
    await choose(SigningMethod.reader);
    const error = await pending.catch((e) => e);
    expect(AutogramError.is(error, "user-cancelled")).toBe(true);
  });

  test("other SDK errors are shown in the error screen and rethrown", async () => {
    await setup(
      fakeDesktop(async () =>
        Promise.reject(
          new AutogramError("server-error", "Signing failed badly")
        )
      )
    );
    const pending = client.sign({
      content: "<a/>",
      mimeType: "application/xml",
    });
    await choose(SigningMethod.reader);
    const error = await pending.catch((e) => e);
    expect(AutogramError.is(error, "server-error")).toBe(true);
    expect(root().errorMessage).toBe("Signing failed badly");
  });
});

describe("CombinedClient phone pairing", () => {
  const PHONE = { deviceId: "d1", platform: "android", displayName: "Pixel" };

  type Screen = HTMLElement & {
    step: unknown;
    pairedDevices: unknown;
    updateComplete: Promise<boolean>;
    shadowRoot: ShadowRoot;
  };
  const screen = (tag: string) =>
    root().shadowRoot!.querySelector(tag) as Screen | null;

  async function until(condition: () => unknown) {
    for (let i = 0; i < 200 && !condition(); i++) {
      await new Promise((r) => setTimeout(r, 1));
    }
    expect(condition()).toBeTruthy();
  }

  /** `deviceLists`: what successive paired-device lookups return */
  async function setupPairing(
    deviceLists: (typeof PHONE)[][],
    waitForSignature: () => Promise<SignedDocument> = async () => MOBILE_SIGNED
  ) {
    document.body.innerHTML = "";
    desktop = fakeDesktop();
    let call = 0;
    mobile = Object.assign(fakeMobile(), {
      getPairedDevices: async () => {
        mobile.calls.push(["getPairedDevices", []]);
        return deviceLists[Math.min(call++, deviceLists.length - 1)];
      },
      waitForSignature: async () => {
        mobile.calls.push(["waitForSignature", []]);
        return waitForSignature();
      },
    });
    client = await createAutogramClient({
      desktopChannel: desktop,
      mobileChannel: mobile,
      pairingEnabled: true,
    });
    // poll fast instead of every 3 s
    (
      client as unknown as { flow: { options: Record<string, number> } }
    ).flow.options.pairingPollIntervalMs = 1;
  }

  const signDocument = () =>
    client.sign({ content: "<a/>", mimeType: "application/xml" });

  test("no paired phone: the dialog stays open on a success page offering pairing", async () => {
    await setupPairing([[]]);
    const pending = signDocument();
    await choose(SigningMethod.mobile);
    await pending;

    expect(root().style.display).toBe("flex");
    const suggestion = screen("autogram-suggest-pairing-screen")!;
    expect(suggestion.step).toBe("success");
    await suggestion.updateComplete;
    const buttons = Array.from(
      suggestion.shadowRoot.querySelectorAll<HTMLButtonElement>(".main button")
    );
    expect(buttons.map((b) => b.textContent!.trim())).toEqual([
      "Spárovať mobil",
      "Teraz nie",
    ]);

    buttons[0].click();
    await suggestion.updateComplete;
    expect(suggestion.step).toBe("pairing");
    expect(suggestion.shadowRoot.querySelector(".qr")).not.toBeNull();
  });

  test("already paired phone: the dialog closes after signing", async () => {
    await setupPairing([[PHONE]]);
    const pending = signDocument();
    await choose(SigningMethod.mobile);
    await pending;

    expect(root().style.display).toBe("none");
    expect(screen("autogram-suggest-pairing-screen")).toBeNull();
  });

  test("pairing during signing confirms it, notifies the phone and keeps the way back", async () => {
    let deliver: () => void = () => {};
    const signed = new Promise<SignedDocument>(
      (resolve) => (deliver = () => resolve(MOBILE_SIGNED))
    );
    await setupPairing([[], [], [PHONE]], () => signed);
    const pending = signDocument();
    await choose(SigningMethod.mobile);
    await until(() => screen("autogram-sign-mobile-screen"));
    const qrScreen = screen("autogram-sign-mobile-screen")!;
    await qrScreen.updateComplete;

    qrScreen.shadowRoot.querySelector<HTMLAnchorElement>(".hint a")!.click();
    expect(qrScreen.step).toBe(1); // pairing step
    await until(() => argsOf(mobile.calls, "sendNotification"));

    await qrScreen.updateComplete;
    expect(qrScreen.step).toBe(1); // still on the pairing step
    expect(qrScreen.pairedDevices).toEqual([PHONE]);
    expect(
      qrScreen.shadowRoot.querySelector(".paired-notice")!.textContent
    ).toContain("Pixel");

    const back =
      qrScreen.shadowRoot.querySelector<HTMLButtonElement>(".main button")!;
    expect(back.textContent!.trim()).toBe("Späť na podpisovanie");
    back.click();
    await qrScreen.updateComplete;
    expect(qrScreen.step).toBe(0); // signing QR, still showing the notice
    expect(qrScreen.shadowRoot.querySelector(".paired-notice")).not.toBeNull();

    // paired meanwhile: no pairing suggestion after the signature
    deliver();
    await pending;
    expect(root().style.display).toBe("none");
  });
});
