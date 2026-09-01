/**
 * Single source of truth for the injected-script ↔ background-worker RPC
 * surface: method names, argument schemas, result schemas, and timeout
 * policy. Both the caller proxies (`web.ts`) and the background dispatch
 * (`background-worker.ts`) are generated from these tables, so the wire
 * format cannot drift between the two sides.
 */

import { z } from "zod";
import { defineRpcService, AVMGetDocumentsResponse } from "autogram-sdk";

/* ------------------------------------------------------------------ */
/* Shared result schemas                                               */
/* ------------------------------------------------------------------ */

const ZUrl = z.string();

const ZSignedObject = z.object({
  content: z.string(),
  signedBy: z.string().default(""),
  issuedBy: z.string().default(""),
});

const ZServerInfo = z.object({
  status: z.literal("READY").optional(),
  version: z.string().optional(),
});

/* ------------------------------------------------------------------ */
/* AVM (Autogram v Mobile) service                                     */
/* ------------------------------------------------------------------ */

/**
 * AVM document to sign (wire shape of the AVM `POST /documents` body).
 */
const ZDocumentToSign = z.object({
  document: z.object({
    content: z.string(),
    filename: z.string().optional(),
  }),
  parameters: z
    .object({
      checkPDFACompliance: z.boolean().optional().nullable(),
      autoLoadEform: z.boolean().optional().nullable(),
      level: z.string().optional().nullable(),
      container: z.string().optional().nullable(),
      containerXmlns: z.string().optional().nullable(),
      embedUsedSchemas: z.boolean().optional().nullable(),
      identifier: z.string().optional().nullable(),
      packaging: z.string().optional().nullable(),
      digestAlgorithm: z.string().optional().nullable(),
      en319132: z.boolean().optional().nullable(),
      infoCanonicalization: z.string().optional().nullable(),
      propertiesCanonicalization: z.string().optional().nullable(),
      keyInfoCanonicalization: z.string().optional().nullable(),
      schema: z.string().optional().nullable(),
      schemaIdentifier: z.string().optional().nullable(),
      transformation: z.string().optional().nullable(),
      transformationIdentifier: z.string().optional().nullable(),
      transformationLanguage: z.string().optional().nullable(),
      transformationMediaDestinationTypeDescription: z
        .string()
        .optional()
        .nullable(),
      transformationTargetEnvironment: z.string().optional().nullable(),
    })
    .optional(),
  payloadMimeType: z.string().optional(),
});

export const avmService = defineRpcService("avm", {
  loadOrRegister: {
    args: z.null(),
    result: z.null(),
    timeoutMs: 10_000,
    timeoutMessage: "Časový limit registrácie rozšírenia vypršal",
  },
  getQrCodeUrl: {
    args: z.null(),
    result: ZUrl,
    timeoutMs: 10_000,
    timeoutMessage: "Časový limit vytvorenia QR kódu vypršal",
  },
  getPairingQrCodeUrl: {
    args: z.null(),
    result: ZUrl,
    timeoutMs: 10_000,
    timeoutMessage: "Časový limit vytvorenia párovacieho QR kódu vypršal",
  },
  addDocument: {
    args: z.object({ documentToSign: ZDocumentToSign }),
    result: z.null(),
    timeoutMs: 10_000,
    timeoutMessage: "Časový limit pridania dokumentu vypršal",
  },
  sendNotification: {
    args: z.null(),
    result: z.null(),
    timeoutMs: 10_000,
    timeoutMessage: "Časový limit odoslania upozornenia do mobilu vypršal",
  },
  waitForSignature: {
    args: z.null(),
    result: AVMGetDocumentsResponse,
    // long-running: resolves when the user signs on the mobile device
  },
  reset: {
    args: z.null(),
    result: z.null(),
    timeoutMs: 10_000,
    timeoutMessage: "Časový limit na reset vypršal",
  },
  useRestorePoint: {
    args: z.object({ restorePoint: z.string() }),
    result: ZSignedObject.nullable(),
    timeoutMs: 2_000,
    timeoutMessage: "Časový limit na zapamätané podpisovanie vypršal",
  },
});

/* ------------------------------------------------------------------ */
/* Autogram desktop service                                            */
/* ------------------------------------------------------------------ */

/**
 * Desktop Autogram document.
 */
const ZAutogramDocument = z.object({
  content: z.string(),
  filename: z.string().optional(),
});

/**
 * Desktop Autogram signature parameters. Mirrors the generated
 * `SignatureParameters` OpenAPI type — keep in sync when regenerating
 * (the previous hand-written copy silently stripped `fsFormId` and
 * required `level`, which the API treats as optional).
 */
const ZSignatureParameters = z.object({
  checkPDFACompliance: z.boolean().optional(),
  autoLoadEform: z.boolean().optional(),
  level: z
    .enum(["XAdES_BASELINE_B", "PAdES_BASELINE_B", "CAdES_BASELINE_B"])
    .optional(),
  container: z.enum(["ASiC_E"]).optional(),
  containerXmlns: z
    .enum(["http://data.gov.sk/def/container/xmldatacontainer+xml/1.1"])
    .optional(),
  embedUsedSchemas: z.boolean().optional(),
  identifier: z.string().optional(),
  packaging: z.enum(["ENVELOPED", "ENVELOPING"]).optional(),
  digestAlgorithm: z.enum(["SHA256", "SHA384", "SHA512"]).optional(),
  en319132: z.boolean().optional(),
  infoCanonicalization: z
    .enum([
      "INCLUSIVE",
      "EXCLUSIVE",
      "INCLUSIVE_WITH_COMMENTS",
      "EXCLUSIVE_WITH_COMMENTS",
      "INCLUSIVE_11",
      "INCLUSIVE_11_WITH_COMMENTS",
    ])
    .optional(),
  propertiesCanonicalization: z
    .enum([
      "INCLUSIVE",
      "EXCLUSIVE",
      "INCLUSIVE_WITH_COMMENTS",
      "EXCLUSIVE_WITH_COMMENTS",
      "INCLUSIVE_11",
      "INCLUSIVE_11_WITH_COMMENTS",
    ])
    .optional(),
  keyInfoCanonicalization: z
    .enum([
      "INCLUSIVE",
      "EXCLUSIVE",
      "INCLUSIVE_WITH_COMMENTS",
      "EXCLUSIVE_WITH_COMMENTS",
      "INCLUSIVE_11",
      "INCLUSIVE_11_WITH_COMMENTS",
    ])
    .optional(),
  schema: z.string().optional(),
  schemaIdentifier: z.string().optional(),
  transformation: z.string().optional(),
  transformationIdentifier: z.string().optional(),
  transformationLanguage: z.string().optional(),
  transformationMediaDestinationTypeDescription: z
    .enum(["XHTML", "HTML", "TXT"])
    .optional(),
  transformationTargetEnvironment: z.string().optional(),
  visualizationWidth: z.enum(["sm", "md", "lg", "xl", "xxl"]).optional(),
  fsFormId: z.string().optional(),
});

export const autogramService = defineRpcService("autogram", {
  getLaunchURL: {
    args: z.object({ command: z.literal("listen").optional() }),
    result: ZUrl,
  },
  info: {
    args: z.null(),
    result: ZServerInfo,
    timeoutMs: 10_000,
    timeoutMessage: "Časový limit načítania informácií o serveri vypršal",
  },
  waitForStatus: {
    args: z.object({
      status: z.literal("READY").optional(),
      timeout: z.number().optional(),
      delay: z.number().optional(),
    }),
    result: ZServerInfo,
    timeoutMs: (args: { timeout?: number }) =>
      args.timeout !== undefined ? (args.timeout + 1) * 1000 : null,
    timeoutMessage: "Časový limit čakania na stav servera vypršal",
  },
  sign: {
    args: z.object({
      document: ZAutogramDocument,
      signatureParameters: ZSignatureParameters.optional(),
      payloadMimeType: z.string().optional(),
      batchId: z.string().optional(),
    }),
    result: ZSignedObject,
    // long-running: resolves when the user signs in the desktop app
  },
  startBatch: {
    args: z.object({ totalNumberOfDocuments: z.number() }),
    result: z.object({ batchId: z.string().optional() }),
  },
  endBatch: {
    args: z.object({ batchId: z.string() }),
    result: z.object({ status: z.enum(["FINISHED", "NOT_FINISHED"]).optional() }),
  },
});
