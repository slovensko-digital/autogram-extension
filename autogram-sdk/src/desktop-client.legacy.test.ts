/**
 * Characterization tests: pin what `DesktopClient` sends to the desktop
 * channel for legacy-shaped input (migrated with `fromLegacySignArgs`, the
 * documented replacement of the removed legacy call shape) and which
 * states/errors it reports. The fake app reports a pre-2.8.0 version so the
 * legacy `/sign` endpoint stays the expected route.
 */
import { DesktopClient, type DesktopSignOptions } from "./desktop-client";
import { fromLegacySignArgs } from "./sign-request";
import { toLegacySignedObject } from "./types";
import { AutogramError, UserCancelledSigningException } from "./errors";
import type {
  AutogramDesktopIntegrationInterface,
  LegacyAutogramDocument,
  LegacySignatureParameters,
  ServerInfo,
  SignResponseBody,
} from "./autogram-api/lib/apiClient";

const READY: ServerInfo = { status: "READY", version: "2.7.6" };
const RESPONSE: SignResponseBody = {
  content: "c2lnbmVk",
  signedBy: "CN=John Smith",
  issuedBy: "CN=SVK eID ACA2",
};

type Calls = Array<[string, unknown[]]>;

function fakeDesktop(
  overrides: Partial<
    Record<
      keyof AutogramDesktopIntegrationInterface,
      (...args: never[]) => Promise<unknown>
    >
  > = {}
): AutogramDesktopIntegrationInterface & { calls: Calls } {
  const calls: Calls = [];
  const impl: Record<string, (...args: never[]) => Promise<unknown>> = {
    getLaunchURL: async () => "autogram://listen?x",
    info: async () => READY,
    waitForStatus: async () => READY,
    signLegacy: async () => RESPONSE,
    startBatch: async () => ({ batchId: "b1" }),
    endBatch: async () => ({ status: "FINISHED" }),
    ...overrides,
  };
  const fake: Record<string, unknown> = { calls };
  for (const [name, fn] of Object.entries(impl)) {
    fake[name] = (...args: never[]) => {
      calls.push([name, args]);
      return fn(...args);
    };
  }
  return fake as unknown as AutogramDesktopIntegrationInterface & {
    calls: Calls;
  };
}

/** The removed `sign(document, parameters, payloadMimeType, options)` call, migrated. */
function signLegacy(
  client: DesktopClient,
  document: LegacyAutogramDocument,
  parameters?: LegacySignatureParameters,
  payloadMimeType?: string,
  options?: DesktopSignOptions
) {
  const migrated = fromLegacySignArgs(document, parameters, payloadMimeType);
  return client
    .sign(migrated.documents, migrated.parameters, {
      ...options,
      presentation: migrated.presentation,
    })
    .then(toLegacySignedObject);
}

const argsOf = (calls: Calls, name: string) =>
  calls.find(([n]) => n === name)?.[1];

describe("DesktopClient.sign (legacy call shape, Autogram < 2.8.0)", () => {
  test("passes document, parameters, mime type, batchId and abort controller to the channel", async () => {
    const desktop = fakeDesktop();
    const abortController = new AbortController();
    const states: string[] = [];

    const result = await signLegacy(
      new DesktopClient(desktop),
      { content: "JVBERg==", filename: "a.pdf" },
      { level: "PAdES_BASELINE_B", checkPDFACompliance: true },
      "application/pdf;base64",
      {
        abortController,
        batchId: "b1",
        onStateChange: (s) => states.push(s.type),
      }
    );

    expect(result).toEqual(RESPONSE);
    expect(argsOf(desktop.calls, "signLegacy")).toEqual([
      { content: "JVBERg==", filename: "a.pdf" },
      { level: "PAdES_BASELINE_B", checkPDFACompliance: true },
      "application/pdf;base64",
      "b1",
      abortController,
    ]);
    expect(states).toEqual(["checkingApp", "waitingForSignature"]);
  });

  test("keeps the full legacy parameter set intact", async () => {
    const desktop = fakeDesktop();
    const parameters = {
      level: "XAdES_BASELINE_B" as const,
      container: "ASiC_E" as const,
      autoLoadEform: true,
      identifier: "http://data.gov.sk/doc/eform/App.GeneralAgenda/1.9",
      containerXmlns:
        "http://data.gov.sk/def/container/xmldatacontainer+xml/1.1" as const,
      embedUsedSchemas: false,
      schema: "<xs:schema/>",
      transformation: "<xsl:stylesheet/>",
      transformationMediaDestinationTypeDescription: "HTML" as const,
      fsFormId: "792_772",
      visualizationWidth: "lg" as const,
    };
    await signLegacy(
      new DesktopClient(desktop),
      { content: "<a/>" },
      parameters,
      "application/xml"
    );

    const [document, sentParameters, payloadMimeType] = argsOf(
      desktop.calls,
      "signLegacy"
    )!;
    expect(document).toEqual({ content: "<a/>" });
    expect(sentParameters).toEqual(parameters);
    expect(payloadMimeType).toBe("application/xml");
  });

  test("accepts onDesktopStateChange as an alias", async () => {
    const states: string[] = [];
    await signLegacy(
      new DesktopClient(fakeDesktop()),
      { content: "<a/>" },
      undefined,
      undefined,
      {
        onDesktopStateChange: (s) => states.push(s.type),
      }
    );
    expect(states).toEqual(["checkingApp", "waitingForSignature"]);
  });

  test("reports user cancellation", async () => {
    const desktop = fakeDesktop({
      signLegacy: async () => Promise.reject(new UserCancelledSigningException()),
    });
    const states: string[] = [];
    const error = await signLegacy(
      new DesktopClient(desktop),
      { content: "<a/>" },
      undefined,
      "application/xml",
      { onStateChange: (s) => states.push(s.type) }
    ).catch((e) => e);
    expect(AutogramError.is(error, "user-cancelled")).toBe(true);
    expect(states.at(-1)).toBe("signingCancelled");
  });

  test("reports other failures as an error state and rethrows them", async () => {
    const failure = new Error("boom");
    const desktop = fakeDesktop({ signLegacy: async () => Promise.reject(failure) });
    const states: unknown[] = [];
    await expect(
      signLegacy(
        new DesktopClient(desktop),
        { content: "<a/>" },
        undefined,
        "application/xml",
        {
          onStateChange: (s) => states.push(s),
        }
      )
    ).rejects.toBe(failure);
    expect(states.at(-1)).toEqual({ type: "error", message: "boom" });
  });
});

describe("DesktopClient batches", () => {
  test("startBatch returns the batch id", async () => {
    const desktop = fakeDesktop();
    const states: string[] = [];
    await expect(
      new DesktopClient(desktop).startBatch(2, {
        onStateChange: (s) => states.push(s.type),
      })
    ).resolves.toBe("b1");
    expect(argsOf(desktop.calls, "startBatch")?.[0]).toBe(2);
    expect(states).toEqual(["checkingApp", "waitingForSignature"]);
  });

  test("startBatch without a batch id means the user cancelled", async () => {
    const desktop = fakeDesktop({ startBatch: async () => ({}) });
    const error = await new DesktopClient(desktop)
      .startBatch(2)
      .catch((e) => e);
    expect(AutogramError.is(error, "user-cancelled")).toBe(true);
  });

  test("endBatch passes through", async () => {
    const desktop = fakeDesktop();
    await expect(new DesktopClient(desktop).endBatch("b1")).resolves.toEqual({
      status: "FINISHED",
    });
    expect(argsOf(desktop.calls, "endBatch")?.[0]).toBe("b1");
  });
});

describe("DesktopClient.launch when the app is not running", () => {
  const originalWindow = (globalThis as { window?: unknown }).window;
  let assign: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    assign = jest.fn();
    (globalThis as { window?: unknown }).window = {
      location: { assign },
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
  });
  afterEach(() => {
    jest.useRealTimers();
    (globalThis as { window?: unknown }).window = originalWindow;
  });

  test("opens the launch URL and waits for the app", async () => {
    const desktop = fakeDesktop({
      info: async () => Promise.reject(new Error("offline")),
    });
    const states: string[] = [];
    await signLegacy(
      new DesktopClient(desktop),
      { content: "<a/>" },
      undefined,
      "application/xml",
      {
        onStateChange: (s) => states.push(s.type),
      }
    );
    expect(assign).toHaveBeenCalledWith("autogram://listen?x");
    expect(argsOf(desktop.calls, "waitForStatus")?.slice(0, 3)).toEqual([
      "READY",
      20,
      1,
    ]);
    expect(states).toEqual([
      "checkingApp",
      "launchingApp",
      "waitingForSignature",
    ]);
  });

  test("reports appNotInstalled when the app never becomes ready", async () => {
    const desktop = fakeDesktop({
      info: async () => Promise.reject(new Error("offline")),
      waitForStatus: async () => Promise.reject(new Error("timeout")),
    });
    const states: string[] = [];
    const error = await signLegacy(
      new DesktopClient(desktop),
      { content: "<a/>" },
      undefined,
      "application/xml",
      { onStateChange: (s) => states.push(s.type) }
    ).catch((e) => e);
    expect(AutogramError.is(error, "app-not-installed")).toBe(true);
    expect(states).toEqual(["checkingApp", "launchingApp", "appNotInstalled"]);
    expect(argsOf(desktop.calls, "signLegacy")).toBeUndefined();
  });
});
