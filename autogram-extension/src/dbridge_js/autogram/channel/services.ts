/**
 * Single source of truth for the injected-script ↔ background-worker RPC
 * surface: method names, argument schemas, result schemas, and timeout
 * policy. Both the caller proxies (`web.ts`) and the background dispatch
 * (`background-worker.ts`) are generated from these tables, so the wire
 * format cannot drift between the two sides. Payload schemas come from
 * the SDK, where they are type-checked against the generated API types.
 */

import { z } from "zod";
import {
  defineRpcService,
  AVMGetDocumentsResponse,
  ZAVMDocumentToSign,
  ZAVMPairedDevices,
  ZDesktopBatchEndResponseBody,
  ZDesktopBatchStartResponseBody,
  ZDesktopLegacyAutogramDocument,
  ZDesktopLegacySignatureParameters,
  ZDesktopServerInfo,
  ZDesktopSignRequestBody,
  ZDesktopSignResponseBody,
  ZSignedObject,
} from "autogram-sdk";

/* ------------------------------------------------------------------ */
/* Shared result schemas                                               */
/* ------------------------------------------------------------------ */

const ZUrl = z.string();

/* ------------------------------------------------------------------ */
/* AVM (Autogram v Mobile) service                                     */
/* ------------------------------------------------------------------ */

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
    args: z.object({ documentToSign: ZAVMDocumentToSign }),
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
  getPairedDevices: {
    args: z.null(),
    result: ZAVMPairedDevices,
    timeoutMs: 10_000,
    timeoutMessage: "Časový limit načítania spárovaných zariadení vypršal",
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

export const autogramService = defineRpcService("autogram", {
  getLaunchURL: {
    args: z.object({ command: z.literal("listen").optional() }),
    result: ZUrl,
  },
  info: {
    args: z.null(),
    result: ZDesktopServerInfo,
    timeoutMs: 10_000,
    timeoutMessage: "Časový limit načítania informácií o serveri vypršal",
  },
  waitForStatus: {
    args: z.object({
      status: z.literal("READY").optional(),
      timeout: z.number().optional(),
      delay: z.number().optional(),
    }),
    result: ZDesktopServerInfo,
    timeoutMs: (args: { timeout?: number }) =>
      args.timeout !== undefined ? (args.timeout + 1) * 1000 : null,
    timeoutMessage: "Časový limit čakania na stav servera vypršal",
  },
  signLegacy: {
    args: z.object({
      document: ZDesktopLegacyAutogramDocument,
      signatureParameters: ZDesktopLegacySignatureParameters.optional(),
      payloadMimeType: z.string().optional(),
      batchId: z.string().optional(),
    }),
    result: ZDesktopSignResponseBody,
    // long-running: resolves when the user signs in the desktop app
  },
  signV1: {
    args: z.object({ body: ZDesktopSignRequestBody }),
    result: ZDesktopSignResponseBody,
    // long-running: resolves when the user signs in the desktop app
  },
  startBatch: {
    args: z.object({ totalNumberOfDocuments: z.number() }),
    result: ZDesktopBatchStartResponseBody,
  },
  endBatch: {
    args: z.object({ batchId: z.string() }),
    result: ZDesktopBatchEndResponseBody,
  },
});
