import { get, set } from "idb-keyval";
import { AVMDocumentToSign, AVMSignedDocument } from ".";
import {
  AutogramVMobileIntegrationInterfaceStateful,
  AutogramVMobileIntegration,
  AvmRegistrationInfo,
} from "./avm-api/lib/apiClient";
import { MobileClient, RestorePointStore, SignatureRequest } from "./mobile";
import { createLogger } from "./log";
import { SignedObject } from "./types";

const log = createLogger("ag-sdk:AvmSimpleChannel");

const WAIT_FOR_SIGNATURE_TIMEOUT_MS = 1000 * 60 * 60 * 2; // 2 hours

/**
 * Default direct implementation of {@link AutogramVMobileIntegrationInterfaceStateful}
 * that communicates with the Autogram v Mobile (AVM) cloud service.
 *
 * Thin stateful adapter over {@link MobileClient}: it tracks "the current
 * signature request" between the interface's step-wise calls
 * (`addDocument` → `getQrCodeUrl` → `waitForSignature` → `reset`).
 *
 * {@link useRestorePoint} provides cross-page-reload continuity via
 * {@link RestorePointStore}: the request token is persisted in IndexedDB so
 * an in-progress signing session can be recovered after navigation.
 *
 * This class is the default channel used by `CombinedClient`. The
 * browser extension replaces it with `AvmChannelWeb`, which routes
 * calls through the content-script ↔ injected-script message bridge
 * instead of talking to the AVM API directly.
 */
export class AvmSimpleChannel
  implements AutogramVMobileIntegrationInterfaceStateful
{
  private client = new MobileClient(
    new AutogramVMobileIntegration({ get, set })
  );
  private restorePoints = new RestorePointStore(
    { get, set },
    this.client,
    "restorePoint:"
  );

  private request: SignatureRequest | null = null;
  private abortController: AbortController | null = null;

  init(): Promise<void> {
    return Promise.resolve();
  }
  async loadOrRegister(regInfo: AvmRegistrationInfo): Promise<void> {
    await this.client.register(regInfo);
  }
  async getQrCodeUrl(): Promise<string> {
    return this.currentRequest().qrCodeUrl();
  }
  async getPairingQrCodeUrl(): Promise<string> {
    return this.client.pairingQrCodeUrl();
  }
  async addDocument(documentToSign: AVMDocumentToSign): Promise<void> {
    this.request = await this.client.requestSignature(documentToSign);
  }
  async sendNotification(): Promise<void> {
    await this.currentRequest().notifyDevices();
  }
  async waitForSignature(): Promise<AVMSignedDocument> {
    const request = this.currentRequest();
    // TODO abort when tab is closed
    this.abortController = new AbortController();

    const timeout = setTimeout(() => {
      this.abortController?.abort("Timeout");
    }, WAIT_FOR_SIGNATURE_TIMEOUT_MS);

    try {
      const res = await request.waitForSignature({
        signal: this.abortController.signal,
      });
      log.debug("res", res);
      return res;
    } finally {
      clearTimeout(timeout);
    }
  }

  async abortWaitForSignature(): Promise<void> {
    this.abortController?.abort("Aborted");
  }
  async reset(): Promise<void> {
    this.request = null;
    this.abortController = null;
  }

  async useRestorePoint(restorePoint: string): Promise<SignedObject | null> {
    const result = await this.restorePoints.use(
      restorePoint,
      this.request?.token ?? null
    );
    if (result.outcome === "none") {
      return null;
    }
    this.request = this.client.resumeRequest(result.token);
    return result.outcome === "signed" ? result.signedObject : null;
  }

  private currentRequest(): SignatureRequest {
    if (!this.request) {
      throw new Error("Document not found");
    }
    return this.request;
  }
}
