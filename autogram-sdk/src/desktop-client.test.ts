import { DesktopClient } from "./desktop-client";
import { AutogramError, UserCancelledSigningException } from "./errors";
import { fromLegacySignArgs } from "./sign-request";
import type {
  AutogramDesktopIntegrationInterface,
  DesktopSigningState,
  ServerInfo,
  SignResponseBody,
} from "./autogram-api/lib/apiClient";

const LEGACY_RESPONSE: SignResponseBody = {
  content: "bGVnYWN5",
  signedBy: "CN=Legacy",
  issuedBy: "CN=CA",
};
const V1_RESPONSE: SignResponseBody = {
  content: "djE=",
  mimeType: "application/vnd.etsi.asic-e+zip",
  filename: "documents.asice",
  signedBy: "CN=V1",
  issuedBy: "CN=CA",
};

function fakeDesktop(
  version: string,
  overrides: Partial<AutogramDesktopIntegrationInterface> = {}
): AutogramDesktopIntegrationInterface & { calls: Array<[string, unknown[]]> } {
  const info: ServerInfo = { status: "READY", version };
  const calls: Array<[string, unknown[]]> = [];
  const record =
    <T>(name: string, result: T) =>
    (...args: unknown[]) => {
      calls.push([name, args]);
      return Promise.resolve(result);
    };
  return {
    calls,
    getLaunchURL: record("getLaunchURL", "autogram://listen"),
    info: record("info", info),
    waitForStatus: record("waitForStatus", info),
    signLegacy: record("signLegacy", LEGACY_RESPONSE),
    signV1: record("signV1", V1_RESPONSE),
    startBatch: record("startBatch", { batchId: "b" }),
    endBatch: record("endBatch", { status: "FINISHED" as const }),
    ...overrides,
  };
}

const callNames = (desktop: { calls: Array<[string, unknown[]]> }) =>
  desktop.calls.map(([name]) => name);
const callArgs = (desktop: { calls: Array<[string, unknown[]]> }, name: string) =>
  desktop.calls.find(([n]) => n === name)?.[1];

const XML = { content: "<a/>", mimeType: "application/xml", filename: "a.xml" };
const PDF = { content: "JVBERg==", mimeType: "application/pdf", encoding: "base64" as const, filename: "b.pdf" };
// wire shape of PDF
const PDF_WIRE = { content: "JVBERg==", mimeType: "application/pdf;base64", filename: "b.pdf" };

describe("DesktopClient.sign with Autogram >= 2.8.0", () => {
  test("signs multiple documents into one container via /api/v1/sign", async () => {
    const desktop = fakeDesktop("2.8.0");
    const result = await new DesktopClient(desktop).sign(
      [XML, PDF],
      { form: "XAdES", container: "ASiC_E" },
      { presentation: { visualizationWidth: "lg" } }
    );

    expect(result).toEqual({
      content: "djE=",
      mimeType: "application/vnd.etsi.asic-e+zip",
      encoding: "base64",
      filename: "documents.asice",
      signatures: [{ signedBy: "CN=V1", issuedBy: "CN=CA" }],
    });
    expect(callNames(desktop)).not.toContain("signLegacy");
    expect(callArgs(desktop, "signV1")?.[0]).toEqual({
      documents: [XML, PDF_WIRE],
      parameters: { form: "XAdES", container: "ASiC_E" },
      presentation: { visualizationWidth: "lg" },
    });
  });

  test("migrated legacy input goes to /api/v1/sign", async () => {
    const desktop = fakeDesktop("2.9.1");
    const { documents, parameters, presentation } = fromLegacySignArgs(
      { content: "x", filename: "x.pdf" },
      { level: "PAdES_BASELINE_B", visualizationWidth: "md" },
      "application/pdf;base64"
    );
    await new DesktopClient(desktop).sign(documents, parameters, { presentation });

    expect(callArgs(desktop, "signV1")?.[0]).toEqual({
      documents: [{ content: "x", filename: "x.pdf", mimeType: "application/pdf;base64" }],
      parameters: { form: "PAdES", profile: "BASELINE_B" },
      presentation: { visualizationWidth: "md" },
    });
  });

  test("passes batchId for a single document", async () => {
    const desktop = fakeDesktop("2.8.0");
    await new DesktopClient(desktop).sign(XML, undefined, { batchId: "batch-1" });
    expect(callArgs(desktop, "signV1")?.[0]).toMatchObject({ batchId: "batch-1" });
  });

  test("rejects batchId with multiple documents before contacting the app", async () => {
    const desktop = fakeDesktop("2.8.0");
    await expect(
      new DesktopClient(desktop).sign([XML, PDF], undefined, { batchId: "batch-1" })
    ).rejects.toBeInstanceOf(AutogramError);
    expect(callNames(desktop)).toEqual([]);
  });

  test("treats dev builds as current", async () => {
    const desktop = fakeDesktop("dev");
    await new DesktopClient(desktop).sign([XML, PDF]);
    expect(callNames(desktop)).toContain("signV1");
  });
});

describe("DesktopClient.sign with Autogram < 2.8.0", () => {
  test("falls back to the legacy /sign for a single document", async () => {
    const desktop = fakeDesktop("2.7.6");
    const result = await new DesktopClient(desktop).sign(
      { ...XML, xdcParameters: { autoLoadEform: true } },
      { form: "XAdES", container: "ASiC_E" },
      { batchId: "batch-1" }
    );

    expect(result).toEqual({
      content: "bGVnYWN5",
      // Autogram < 2.8.0 reports no MIME type – inferred from the parameters
      mimeType: "application/vnd.etsi.asic-e+zip",
      encoding: "base64",
      signatures: [{ signedBy: "CN=Legacy", issuedBy: "CN=CA" }],
    });
    expect(callNames(desktop)).not.toContain("signV1");
    const [document, parameters, payloadMimeType, batchId] = callArgs(desktop, "signLegacy")!;
    expect(document).toEqual({ content: "<a/>", filename: "a.xml" });
    expect(parameters).toEqual({ level: "XAdES_BASELINE_B", container: "ASiC_E", autoLoadEform: true });
    expect(payloadMimeType).toBe("application/xml");
    expect(batchId).toBe("batch-1");
  });

  test("reports appVersionTooLow for multiple documents", async () => {
    const desktop = fakeDesktop("2.7.6");
    const states: DesktopSigningState[] = [];
    await expect(
      new DesktopClient(desktop).sign([XML, PDF], undefined, {
        onStateChange: (s) => states.push(s),
      })
    ).rejects.toMatchObject({ code: "app-version-too-low" });

    expect(states).toContainEqual({
      type: "appVersionTooLow",
      requiredVersion: "2.8.0",
      detectedVersion: "2.7.6",
    });
    expect(states.map((s) => s.type)).not.toContain("waitingForSignature");
    expect(callNames(desktop)).not.toContain("signLegacy");
  });

  test("reports appVersionTooLow for v1-only safety checks", async () => {
    const desktop = fakeDesktop("2.7.6");
    await expect(
      new DesktopClient(desktop).sign(PDF, { form: "PAdES", requireQualifiedCertificate: true })
    ).rejects.toMatchObject({ code: "app-version-too-low" });
    expect(callNames(desktop)).not.toContain("signLegacy");
  });
});

describe("DesktopClient.sign errors", () => {
  test("reports user cancellation", async () => {
    const desktop = fakeDesktop("2.8.0", {
      signV1: () => Promise.reject(new UserCancelledSigningException()),
    });
    const states: string[] = [];
    await expect(
      new DesktopClient(desktop).sign(XML, undefined, { onStateChange: (s) => states.push(s.type) })
    ).rejects.toMatchObject({ code: "user-cancelled" });
    expect(states.at(-1)).toBe("signingCancelled");
  });
});

describe("DesktopClient.launch", () => {
  test("returns the server info", async () => {
    await expect(new DesktopClient(fakeDesktop("2.8.0")).launch()).resolves.toEqual({
      status: "READY",
      version: "2.8.0",
    });
  });

  test("enforces minimumAppVersion", async () => {
    const states: string[] = [];
    await expect(
      new DesktopClient(fakeDesktop("2.7.6")).launch(undefined, (s) => states.push(s.type), {
        minimumAppVersion: "2.8.0",
      })
    ).rejects.toMatchObject({ code: "app-version-too-low" });
    expect(states).toContain("appVersionTooLow");

    await expect(
      new DesktopClient(fakeDesktop("dev")).launch(undefined, undefined, { minimumAppVersion: "2.8.0" })
    ).resolves.toMatchObject({ version: "dev" });
  });
});

describe("DesktopClient.sign with a channel written before Autogram 2.8.0", () => {
  test("uses the legacy endpoint for one document even when the app is new", async () => {
    const desktop = fakeDesktop("2.8.0");
    delete (desktop as Partial<typeof desktop>).signV1;
    await new DesktopClient(desktop).sign(XML);
    expect(callNames(desktop)).toContain("signLegacy");
  });

  test("rejects multiple documents as not-supported", async () => {
    const desktop = fakeDesktop("2.8.0");
    delete (desktop as Partial<typeof desktop>).signV1;
    await expect(new DesktopClient(desktop).sign([XML, PDF])).rejects.toMatchObject({
      code: "not-supported",
    });
    expect(callNames(desktop)).not.toContain("signLegacy");
  });
});
