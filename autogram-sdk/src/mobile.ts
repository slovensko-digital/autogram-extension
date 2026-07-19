/**
 * @module mobile
 * Explicit, serializable signature requests for Autogram v Mobile (AVM).
 *
 * The AVM server is per-document stateless: each document has its own GUID
 * and encryption key (that pair is what the QR code encodes) and is deleted
 * 24 hours after creation. "Scan once, sign many" exists only through the
 * optional device pairing — the first QR code can embed an integration JWT
 * which pairs the device, and subsequent documents reach the phone via push
 * notifications ({@link SignatureRequest.notifyDevices}).
 *
 * {@link SignatureRequest.token} is a plain JSON-serializable object.
 * Persist it (IndexedDB, sessionStorage, …) and call
 * {@link MobileClient.resumeRequest} to continue a signing session after a
 * page reload or worker restart — this is the primitive behind restore
 * points ({@link RestorePointStore}).
 */

import type {
  AutogramVMobileIntegration,
  AvmIntegrationDocument,
  AvmRegistrationInfo,
  DBInterface,
  DocumentToSign,
  GetDocumentResult,
  GetIntegrationDevicesResponseBody,
  SignedDocument,
} from "./avm-api/lib/apiClient";
import type { z } from "zod";
import { AutogramError } from "./errors";
import type { SignedObject } from "./types";
import { createLogger } from "./log";

const log = createLogger("ag-sdk:mobile");

/**
 * Serializable reference to a document uploaded for signing.
 * Same shape as {@link AvmIntegrationDocument} — existing persisted
 * document references keep working as tokens.
 */
export type RequestToken = AvmIntegrationDocument;

/** A mobile device paired with this integration. */
export type PairedDevice = z.infer<
  typeof GetIntegrationDevicesResponseBody
>[number];

export type SignatureRequestStatus =
  | { state: "pending" }
  | { state: "signed"; document: SignedDocument }
  /** Document not found on the server (never existed or auto-deleted after 24 h). */
  | { state: "expired" };

/**
 * Minimal backend contract needed by {@link MobileClient} and
 * {@link SignatureRequest}. {@link AutogramVMobileIntegration} satisfies it
 * structurally; tests can substitute a fake.
 */
export interface MobileIntegrationBackend {
  loadOrRegister(regInfo: AvmRegistrationInfo): Promise<void>;
  addDocument(documentToSign: DocumentToSign): Promise<AvmIntegrationDocument>;
  getQrCodeUrl(
    doc: AvmIntegrationDocument,
    enableIntegration?: boolean
  ): Promise<string>;
  getPairingQrCodeUrl(): Promise<string>;
  sendNotification(doc: AvmIntegrationDocument): Promise<void>;
  checkDocumentStatus(doc: AvmIntegrationDocument): Promise<GetDocumentResult>;
  waitForSignature(
    doc: AvmIntegrationDocument,
    abortController: AbortController
  ): Promise<SignedDocument>;
  getDevices(): Promise<PairedDevice[]>;
}

/**
 * One document uploaded to the AVM server, waiting to be signed on a
 * mobile device.
 *
 * Created by {@link MobileClient.requestSignature} or resumed from a
 * persisted {@link RequestToken} via {@link MobileClient.resumeRequest}.
 */
export class SignatureRequest {
  constructor(
    private backend: MobileIntegrationBackend,
    /** Plain serializable reference — persist it to resume this request later. */
    readonly token: RequestToken
  ) {}

  /**
   * URL to present to the user as a QR code (or link on mobile).
   *
   * @param options.pairDevice embed an integration JWT so scanning the code
   * also pairs the device with this integration, enabling push
   * notifications for future requests. Default `false`.
   */
  qrCodeUrl(options?: { pairDevice?: boolean }): Promise<string> {
    return this.backend.getQrCodeUrl(this.token, options?.pairDevice ?? false);
  }

  /**
   * Prompt already-paired devices to sign via push notification.
   * Delivery failures are logged, not thrown — always offer the QR code
   * as fallback.
   */
  notifyDevices(): Promise<void> {
    return this.backend.sendNotification(this.token);
  }

  /** Current state of the request on the server (single check, no polling). */
  async status(): Promise<SignatureRequestStatus> {
    const result = await this.backend.checkDocumentStatus(this.token);
    switch (result.status) {
      case "pending":
        return { state: "pending" };
      case "signed":
        return { state: "signed", document: result.document };
      case "not found":
        return { state: "expired" };
    }
  }

  /**
   * Polls until the document is signed on a mobile device.
   *
   * @throws AutogramError with code `aborted` when `options.signal` fires.
   */
  async waitForSignature(options?: {
    signal?: AbortSignal;
  }): Promise<SignedDocument> {
    const signal = options?.signal;
    if (signal?.aborted) {
      throw new AutogramError("aborted", "Waiting for signature aborted");
    }
    const abortController = new AbortController();
    const onAbort = () => abortController.abort(signal?.reason);
    signal?.addEventListener("abort", onAbort, { once: true });
    try {
      return await this.backend.waitForSignature(this.token, abortController);
    } catch (e) {
      if (abortController.signal.aborted) {
        throw new AutogramError("aborted", "Waiting for signature aborted", {
          cause: e,
        });
      }
      throw e;
    } finally {
      signal?.removeEventListener("abort", onAbort);
    }
  }
}

/**
 * Client for signing documents with the Autogram mobile app.
 *
 * Long-lived state (integration key pair, GUID, device pairings) belongs to
 * the integration; each document is an independent {@link SignatureRequest}.
 */
export class MobileClient {
  constructor(private backend: MobileIntegrationBackend) {}

  /** Load the persisted integration or register a new one. Idempotent. */
  register(info: AvmRegistrationInfo): Promise<void> {
    return this.backend.loadOrRegister(info);
  }

  /**
   * Mobile devices paired with this integration. When non-empty,
   * {@link SignatureRequest.notifyDevices} can reach the user without a
   * QR scan.
   */
  pairedDevices(): Promise<PairedDevice[]> {
    return this.backend.getDevices();
  }

  /** URL of a QR code that pairs a device without signing anything. */
  pairingQrCodeUrl(): Promise<string> {
    return this.backend.getPairingQrCodeUrl();
  }

  /**
   * Upload a document for signing.
   *
   * @param options.notifyDevices send a push notification to paired devices
   * right away (default `true`).
   */
  async requestSignature(
    documentToSign: DocumentToSign,
    options?: { notifyDevices?: boolean }
  ): Promise<SignatureRequest> {
    const token = await this.backend.addDocument(documentToSign);
    const request = new SignatureRequest(this.backend, token);
    if (options?.notifyDevices ?? true) {
      await request.notifyDevices();
    }
    return request;
  }

  /**
   * Recreate a {@link SignatureRequest} from a persisted token.
   * Returns `null` when the token is missing or structurally invalid; an
   * expired document surfaces later as `status().state === "expired"`.
   */
  resumeRequest(
    token: RequestToken | null | undefined
  ): SignatureRequest | null {
    if (!token || !token.guid || !token.encryptionKey) {
      log.debug("resumeRequest: invalid token", token);
      return null;
    }
    return new SignatureRequest(this.backend, token);
  }
}

/** Flattens an AVM signed document to the unified {@link SignedObject}. */
export function toSignedObject(document: SignedDocument): SignedObject {
  return {
    content: document.content,
    signedBy:
      document.signers?.map((s) => s.signedBy || "").join(", ") || "",
    issuedBy:
      document.signers?.map((s) => s.issuedBy || "").join(", ") || "",
  };
}

export type RestorePointResult =
  /** No usable restore point; the current token (if any) was saved under the key. */
  | { outcome: "none" }
  /** Document was signed while the page was away. Restore point cleaned up. */
  | { outcome: "signed"; token: RequestToken; signedObject: SignedObject }
  /** In-progress request restored; continue waiting for the signature. */
  | { outcome: "pending"; token: RequestToken };

/**
 * Persistence of {@link RequestToken}s keyed by a caller-chosen restore
 * point identifier (e.g. a hash of document + page URL), so a signing
 * session survives page reloads.
 *
 * Use case: the user starts signing and switches to the Autogram mobile
 * app; the OS suspends the browser and the page reloads on return. With a
 * restore point, the page detects the document was already signed and
 * completes without user interaction.
 */
export class RestorePointStore {
  /**
   * @param keyPrefix storage key prefix — keep the historical prefix of the
   * call site so previously persisted restore points remain readable.
   */
  constructor(
    private db: DBInterface,
    private client: MobileClient,
    private keyPrefix = "restorePoint:"
  ) {}

  /**
   * Look up `restorePoint`; if absent, persist `currentToken` under it
   * (creating the restore point for a future reload) and report `none`.
   * If present, check the server: `signed` returns the signed object and
   * removes the restore point, `pending` returns the token so the caller
   * can resume waiting.
   */
  async use(
    restorePoint: string,
    currentToken: RequestToken | null
  ): Promise<RestorePointResult> {
    const key = this.keyPrefix + restorePoint;
    const stored = await this.loadToken(key);

    if (!stored) {
      if (currentToken) {
        await this.db.set(key, currentToken);
        log.info("Created new restore point", restorePoint);
      }
      return { outcome: "none" };
    }

    const request = this.client.resumeRequest(stored);
    if (!request) {
      return { outcome: "none" };
    }

    try {
      const status = await request.status();
      if (status.state === "signed") {
        log.info("Restore point used - document already signed", restorePoint);
        await this.db.set(key, undefined);
        return {
          outcome: "signed",
          token: stored,
          signedObject: toSignedObject(status.document),
        };
      }
      if (status.state === "pending") {
        log.info("Restore point used - document pending", restorePoint);
        return { outcome: "pending", token: stored };
      }
      log.info("Restore point expired", restorePoint);
      return { outcome: "none" };
    } catch (error) {
      log.error("Error checking restore point", error);
      return { outcome: "none" };
    }
  }

  private async loadToken(key: string): Promise<RequestToken | null> {
    const value = await this.db.get(key);
    if (!value) {
      return null;
    }
    // Legacy format (extension background worker < 0.3): the restore point
    // stored a pointer to the db key holding the document reference.
    if (typeof value === "string") {
      const dereferenced = await this.db.get<RequestToken>(value);
      return dereferenced ?? null;
    }
    return value as RequestToken;
  }
}
