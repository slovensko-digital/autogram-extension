/**
 * @jest-environment jsdom
 */
/**
 * Characterization tests of the public API surface: every runtime export
 * that exists today must keep existing (additions are fine), and the public
 * types must keep accepting what integrators pass today. The type checks
 * are compile-time — ts-jest fails the suite on type errors.
 */
import { TextDecoder, TextEncoder } from "util";
Object.assign(globalThis, { TextEncoder, TextDecoder });
jest.mock("@bwip-js/generic", () => ({ toSVG: () => "" }), { virtual: true });

import type {
  AutogramDesktopIntegrationInterface,
  DesktopAutogramDocument,
  DesktopClient,
  DesktopLegacyAutogramDocument,
  DesktopLegacySignatureParameters,
  DesktopSignatureParameters,
  DesktopSignOptions,
  DesktopSignResponseBody,
  DesktopSigningState,
  DocumentToSign,
  SignedDocumentResult,
  SignedObject,
} from "./index";
import type { ClientSignOptions, CombinedClient } from "./index-all";
import { fromLegacySignArgs, toLegacySignedObject } from "./index";

/* eslint-disable @typescript-eslint/no-require-imports */
const exportsOf = (path: string) => Object.keys(require(path)).sort();

describe("runtime exports", () => {
  const INDEX = [
    "AVMGetDocumentsResponse",
    "AutogramAppNotInstalledException",
    "AutogramError",
    "AutogramSdkException",
    "AutogramVMobileClientApiClient",
    "AutogramVMobileIntegration",
    "AutogramVMobileSimulation",
    "DesktopClient",
    "MobileClient",
    "RestorePointStore",
    "SignatureRequest",
    "SigningMethod",
    "UserCancelledSigningException",
    "ZRpcAbortFrame",
    "ZRpcCallerFrame",
    "ZRpcRequestFrame",
    "ZRpcResponseFrame",
    "createDeviceJwt",
    "createRpcClient",
    "createRpcHandler",
    "defineRpcService",
    "desktopApiClient",
    "fromAvmSignedDocument",
    "fromDesktopResponse",
    "randomUUID",
    "serializeRpcError",
    "toLegacySignedObject",
    "toPayloadMimeType",
    "toSignedObject",
  ];

  test("autogram-sdk", () => {
    expect(exportsOf("./index")).toEqual(expect.arrayContaining(INDEX));
  });

  test("autogram-sdk script-tag bundle (index-all)", () => {
    expect(exportsOf("./index-all")).toEqual(
      expect.arrayContaining([...INDEX, "CombinedClient", "createAutogramClient"])
    );
  });

  test("autogram-sdk/with-ui", () => {
    expect(exportsOf("./with-ui")).toEqual(
      expect.arrayContaining(["AutogramRoot", "CombinedClient", "createAutogramClient"])
    );
  });

  test("autogram-sdk/autogram-api", () => {
    expect(exportsOf("./autogram-api/index")).toEqual(expect.arrayContaining(["apiClient"]));
  });

  test("autogram-sdk/avm-api", () => {
    expect(exportsOf("./avm-api/index")).toEqual(
      expect.arrayContaining([
        "AutogramVMobileClientApiClient",
        "AutogramVMobileIntegration",
        "AutogramVMobileSimulation",
        "GetDocumentsResponse",
        "createDeviceJwt",
        "randomUUID",
      ])
    );
  });
});

/** Compile-time assertion that `value` is assignable to `T`. */
function expectType<T>(value: T): T {
  return value;
}

describe("public types (compile-time)", () => {
  test("legacy desktop document and parameters (renamed in 0.7.0) accept the same shapes", () => {
    expectType<DesktopLegacyAutogramDocument>({ content: "x" });
    expectType<DesktopLegacyAutogramDocument>({ content: "x", filename: "a.xml" });

    expectType<DesktopLegacySignatureParameters>({});
    expectType<DesktopLegacySignatureParameters>({
      level: "XAdES_BASELINE_B",
      container: "ASiC_E",
      packaging: "ENVELOPED",
      digestAlgorithm: "SHA256",
      en319132: false,
      infoCanonicalization: "INCLUSIVE",
      propertiesCanonicalization: "INCLUSIVE",
      keyInfoCanonicalization: "INCLUSIVE",
      checkPDFACompliance: true,
      autoLoadEform: false,
      identifier: "id",
      containerXmlns: "http://data.gov.sk/def/container/xmldatacontainer+xml/1.1",
      embedUsedSchemas: false,
      schema: "<xs:schema/>",
      schemaIdentifier: "s",
      transformation: "<xsl:stylesheet/>",
      transformationIdentifier: "t",
      transformationLanguage: "sk",
      transformationMediaDestinationTypeDescription: "XHTML",
      transformationTargetEnvironment: "env",
      fsFormId: "792_772",
      visualizationWidth: "lg",
    });
    expectType<DesktopLegacySignatureParameters["level"]>("PAdES_BASELINE_B");
    expectType<DesktopLegacySignatureParameters["level"]>("CAdES_BASELINE_B");
  });

  test("desktop document, parameters and response", () => {
    expectType<DesktopAutogramDocument>({ content: "x", mimeType: "application/pdf;base64" });
    expectType<DesktopSignatureParameters>({});
    expectType<DesktopSignatureParameters>({
      form: "PAdES",
      profile: "BASELINE_T",
      container: "ASiC_E",
      requireQualifiedCertificate: true,
      checkPDFEmbeddedAttachments: true,
    });

    // responses of Autogram < 2.8.0 carry no mimeType/filename
    const response = expectType<DesktopSignResponseBody>({
      content: "c",
      signedBy: "s",
      issuedBy: "i",
    });
    expectType<SignedObject>(response);
  });

  test("desktop signing states", () => {
    const states: DesktopSigningState[] = [
      { type: "checkingApp" },
      { type: "launchingApp" },
      { type: "appMayNotBeInstalled" },
      { type: "waitingForSignature" },
      { type: "appNotInstalled" },
      { type: "signingCancelled" },
      { type: "error", message: "m" },
    ];
    expect(states).toHaveLength(7);
  });

  test("a custom desktop channel implementing today's methods is still accepted", () => {
    const channel = {
      getLaunchURL: async () => "autogram://listen",
      info: async () => ({ status: "READY" as const, version: "2.7.6" }),
      waitForStatus: async () => ({ status: "READY" as const }),
      signLegacy: async () => ({ content: "c", signedBy: "s", issuedBy: "i" }),
      startBatch: async () => ({ batchId: "b" }),
      endBatch: async () => ({ status: "FINISHED" as const }),
    };
    expectType<AutogramDesktopIntegrationInterface>(channel);
  });

  test("DesktopClient.sign", () => {
    const call = (client: DesktopClient, options: DesktopSignOptions) => [
      expectType<Promise<SignedDocumentResult>>(
        client.sign({ content: "x", mimeType: "application/xml" }, { form: "XAdES" }, options)
      ),
      expectType<Promise<SignedDocumentResult>>(
        client.sign([
          { content: "x", mimeType: "application/xml" },
          { content: "y", mimeType: "application/pdf", encoding: "base64" },
        ])
      ),
    ];
    expectType<DesktopSignOptions>({
      abortController: new AbortController(),
      batchId: "b",
      onStateChange: () => undefined,
      onDesktopStateChange: () => undefined,
      presentation: { visualizationWidth: "lg" },
    });
    expect(call).toBeDefined();
  });

  test("CombinedClient.sign and the legacy migration path", () => {
    const document: DocumentToSign = {
      content: "x",
      mimeType: "application/pdf",
      encoding: "base64",
      filename: "a.pdf",
    };
    const options: ClientSignOptions = {
      signal: new AbortController().signal,
      onState: () => undefined,
    };
    const unified = (client: CombinedClient) => [
      expectType<Promise<SignedDocumentResult>>(client.sign(document)),
      expectType<Promise<SignedDocumentResult>>(
        client.sign(document, { form: "PAdES" }, options)
      ),
      expectType<Promise<SignedDocumentResult>>(
        client.sign(
          [document, { content: "<a/>", mimeType: "application/xml", xdcParameters: { autoLoadEform: true } }],
          { form: "XAdES", container: "ASiC_E" },
          { presentation: { visualizationWidth: "xl" } }
        )
      ),
    ];
    // legacy input is migrated with fromLegacySignArgs (+ toLegacySignedObject for the old result shape)
    const legacy = async (client: CombinedClient) => {
      const { documents, parameters, presentation } = fromLegacySignArgs(
        { content: "x" },
        { level: "XAdES_BASELINE_B" },
        "application/xml"
      );
      return expectType<SignedObject>(
        toLegacySignedObject(await client.sign(documents, parameters, { presentation }))
      );
    };
    expect([unified, legacy]).toHaveLength(2);
  });
});
