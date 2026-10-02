/**
 * Characterization tests: the injected-script desktop channel and the
 * background handler are both generated from `autogramService`. Pin that a
 * signing call crosses the bridge unchanged in both directions, so schema
 * edits in services.ts cannot silently strip fields.
 */
import { randomUUID } from "crypto";
import {
  createRpcHandler,
  AutogramError,
  UserCancelledSigningException,
  RpcCallerFrame,
  RpcImpl,
  RpcResponseFrame,
} from "autogram-sdk";
import { autogramService } from "./services";
import { AutogramDesktopChannel, WebChannelCaller } from "./web";

// jsdom's crypto lacks randomUUID, which the RPC client uses for request ids
if (typeof globalThis.crypto.randomUUID !== "function") {
  Object.defineProperty(globalThis.crypto, "randomUUID", { value: randomUUID });
}

type Impl = RpcImpl<typeof autogramService.methods>;

function bridge(overrides: Partial<Impl> = {}) {
  const calls: Array<[string, unknown]> = [];
  const impl: Impl = {
    getLaunchURL: async (args) => (calls.push(["getLaunchURL", args]), "autogram://listen"),
    info: async () => ({ status: "READY", version: "2.7.6" }),
    waitForStatus: async (args) => (calls.push(["waitForStatus", args]), { status: "READY" }),
    signLegacy: async (args) => (
      calls.push(["signLegacy", args]), { content: "c2ln", signedBy: "CN=A", issuedBy: "CN=B" }
    ),
    signV1: async (args) => (
      calls.push(["signV1", args]),
      {
        content: "djE=",
        mimeType: "application/vnd.etsi.asic-e+zip",
        filename: "documents.asice",
        signedBy: "CN=A",
        issuedBy: "CN=B",
      }
    ),
    startBatch: async (args) => (calls.push(["startBatch", args]), { batchId: "b1" }),
    endBatch: async (args) => (calls.push(["endBatch", args]), { status: "FINISHED" }),
    ...overrides,
  };
  const handler = createRpcHandler(autogramService, impl);
  const listeners: Array<(frame: RpcResponseFrame) => void> = [];
  const transport = {
    send(frame: RpcCallerFrame) {
      void handler.handle(frame, "tab-1").then((response) => {
        if (response) listeners.forEach((l) => l(response));
      });
    },
    onResponse(callback: (frame: RpcResponseFrame) => void) {
      listeners.push(callback);
    },
  };
  const channel = new AutogramDesktopChannel(transport as unknown as WebChannelCaller);
  return { channel, calls };
}

describe("desktop RPC bridge", () => {
  test("sign forwards the full legacy request and returns the response", async () => {
    const { channel, calls } = bridge();
    const signatureParameters = {
      level: "XAdES_BASELINE_B" as const,
      container: "ASiC_E" as const,
      autoLoadEform: true,
      identifier: "http://data.gov.sk/doc/eform/App.GeneralAgenda/1.9",
      containerXmlns: "http://data.gov.sk/def/container/xmldatacontainer+xml/1.1" as const,
      embedUsedSchemas: false,
      schema: "<xs:schema/>",
      schemaIdentifier: "s",
      transformation: "<xsl:stylesheet/>",
      transformationIdentifier: "t",
      transformationLanguage: "sk",
      transformationMediaDestinationTypeDescription: "HTML" as const,
      transformationTargetEnvironment: "env",
      packaging: "ENVELOPING" as const,
      digestAlgorithm: "SHA256" as const,
      en319132: false,
      infoCanonicalization: "INCLUSIVE" as const,
      propertiesCanonicalization: "INCLUSIVE" as const,
      keyInfoCanonicalization: "INCLUSIVE" as const,
      checkPDFACompliance: true,
      fsFormId: "792_772",
      visualizationWidth: "lg" as const,
    };

    const result = await channel.signLegacy(
      { content: "PGEvPg==", filename: "a.xml" },
      signatureParameters,
      "application/xml;base64",
      "batch-1"
    );

    expect(result).toEqual({ content: "c2ln", signedBy: "CN=A", issuedBy: "CN=B" });
    expect(calls).toEqual([
      [
        "signLegacy",
        {
          document: { content: "PGEvPg==", filename: "a.xml" },
          signatureParameters,
          payloadMimeType: "application/xml;base64",
          batchId: "batch-1",
        },
      ],
    ]);
  });

  test.each(["PAdES_BASELINE_B", "CAdES_BASELINE_B"] as const)(
    "sign accepts level %s",
    async (level) => {
      const { channel, calls } = bridge();
      await channel.signLegacy({ content: "x" }, { level }, "application/pdf;base64");
      expect(calls[0][1]).toMatchObject({ signatureParameters: { level } });
    }
  );

  test("sign without parameters", async () => {
    const { channel, calls } = bridge();
    await channel.signLegacy({ content: "x" });
    expect(calls[0][1]).toEqual({ document: { content: "x" } });
  });

  test("sign fills missing signer identification with empty strings", async () => {
    const { channel } = bridge({
      signLegacy: async () => ({ content: "c" }) as never,
    });
    await expect(channel.signLegacy({ content: "x" })).resolves.toEqual({
      content: "c",
      signedBy: "",
      issuedBy: "",
    });
  });

  test("user cancellation crosses the bridge as user-cancelled", async () => {
    const { channel } = bridge({
      signLegacy: async () => Promise.reject(new UserCancelledSigningException()),
    });
    const error = await channel.signLegacy({ content: "x" }).catch((e) => e);
    expect(AutogramError.is(error, "user-cancelled")).toBe(true);
  });

  test("info, waitForStatus, launch URL and batches", async () => {
    const { channel, calls } = bridge();
    await expect(channel.info()).resolves.toEqual({ status: "READY", version: "2.7.6" });
    await expect(channel.waitForStatus("READY", 20, 1)).resolves.toEqual({ status: "READY" });
    await expect(channel.getLaunchURL("listen")).resolves.toBe("autogram://listen");
    await expect(channel.startBatch(3)).resolves.toEqual({ batchId: "b1" });
    await expect(channel.endBatch("b1")).resolves.toEqual({ status: "FINISHED" });
    expect(calls).toEqual([
      ["waitForStatus", { status: "READY", timeout: 20, delay: 1 }],
      ["getLaunchURL", { command: "listen" }],
      ["startBatch", { totalNumberOfDocuments: 3 }],
      ["endBatch", { batchId: "b1" }],
    ]);
  });
});

describe("desktop RPC bridge: /api/v1/sign", () => {
  test("signV1 forwards multiple documents and returns MIME type and filename", async () => {
    const { channel, calls } = bridge();
    const body = {
      documents: [
        {
          content: "<a/>",
          mimeType: "application/xml",
          filename: "a.xml",
          xdcParameters: { autoLoadEform: true },
        },
        { content: "JVBERg==", mimeType: "application/pdf;base64", filename: "b.pdf" },
      ],
      parameters: { form: "XAdES" as const, container: "ASiC_E" as const, requireQualifiedCertificate: true },
      presentation: { visualizationWidth: "lg" as const },
    };

    await expect(channel.signV1(body)).resolves.toEqual({
      content: "djE=",
      mimeType: "application/vnd.etsi.asic-e+zip",
      filename: "documents.asice",
      signedBy: "CN=A",
      issuedBy: "CN=B",
    });
    expect(calls).toEqual([["signV1", { body }]]);
  });

  test("legacy sign keeps mimeType/filename returned by Autogram >= 2.8.0", async () => {
    const { channel } = bridge({
      signLegacy: async () => ({
        content: "c",
        mimeType: "application/pdf",
        filename: "a.pdf",
        signedBy: "s",
        issuedBy: "i",
      }),
    });
    await expect(channel.signLegacy({ content: "x" })).resolves.toMatchObject({
      mimeType: "application/pdf",
      filename: "a.pdf",
    });
  });

  test.each(["XAdES_BASELINE_T", "BASELINE_B", "BASELINE_T"] as const)(
    "legacy sign accepts level %s",
    async (level) => {
      const { channel, calls } = bridge();
      await channel.signLegacy({ content: "x" }, { level });
      expect(calls[0][1]).toMatchObject({ signatureParameters: { level } });
    }
  );
});
