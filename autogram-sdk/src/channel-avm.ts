import { get, set } from "idb-keyval";
import {
  AVMIntegrationDocument,
  AVMDocumentToSign,
  AVMSignedDocument,
} from ".";
import {
  AutogramVMobileIntegrationInterfaceStateful,
  AutogramVMobileIntegration,
} from "./avm-api/lib/apiClient";
import { createLogger } from "./log";
import { SignedObject } from "./with-ui";

const log = createLogger("ag-sdk:AvmSimpleChannel");

export class AvmSimpleChannel
  implements AutogramVMobileIntegrationInterfaceStateful
{
  private apiClient = new AutogramVMobileIntegration({
    get,
    set,
  });

  private documentRef: AVMIntegrationDocument | null;
  private abortController: AbortController | null;

  init(): Promise<void> {
    return Promise.resolve();
  }
  async loadOrRegister(): Promise<void> {
    await this.apiClient.loadOrRegister();
  }
  async getQrCodeUrl(): Promise<string> {
    if (!this.documentRef) {
      throw new Error("Document not found");
    }
    return this.apiClient.getQrCodeUrl(this.documentRef);
  }
  async addDocument(documentToSign: AVMDocumentToSign): Promise<void> {
    this.documentRef = await this.apiClient.addDocument(
      documentToSign as unknown as AVMDocumentToSign
    );
  }
  async waitForSignature(): Promise<AVMSignedDocument> {
    const documentRef = this.documentRef;
    if (!documentRef) {
      throw new Error("Document not found");
    }
    // TODO abort when tab is closed
    this.abortController = new AbortController();

    const timeout = setTimeout(
      () => {
        if (this.abortController) this.abortController.abort("Timeout");
      },
      1000 * 60 * 60 * 2 // 2 hours
    );
    this.abortController.signal.addEventListener("abort", () => {
      clearTimeout(timeout);
    });
    const res = await this.apiClient.waitForSignature(
      documentRef,
      this.abortController
    );
    clearTimeout(timeout);
    log.debug("res", res);
    return res;
  }

  async abortWaitForSignature(): Promise<void> {
    if (this.abortController) this.abortController.abort("Aborted");
  }
  async reset(): Promise<void> {
    this.documentRef = null;
    this.abortController = null;
  }

  async useRestorePoint(restorePoint: string): Promise<SignedObject | null> {
    const restoreKey = `restorePoint:${restorePoint}`;

    // Try to load the saved document reference
    const savedDocumentRef = await get<AVMIntegrationDocument>(restoreKey);

    if (!savedDocumentRef) {
      // No restore point found, save current state if we have a document
      if (this.documentRef) {
        await set(restoreKey, this.documentRef);
        log.info("Created new restore point", restorePoint);
      }
      return null;
    }

    // Restore point found, check if document is already signed
    try {
      if (!savedDocumentRef.guid || !savedDocumentRef.encryptionKey) {
        log.debug("Invalid saved document reference", savedDocumentRef);
        return null;
      }

      // Check document status without polling
      const documentResult = await this.apiClient.checkDocumentStatus(
        savedDocumentRef
      );

      if (documentResult.status === "signed") {
        // Document is signed, restore state and return true
        this.documentRef = savedDocumentRef;
        log.info("Restore point used - document already signed", restorePoint);
        // Clean up restore point
        await set(restoreKey, undefined);
        return {
          content: documentResult.document.content,
          issuedBy:
            documentResult.document.signers
              ?.map((s) => s.issuedBy || "")
              .join(", ") || "",
          signedBy:
            documentResult.document.signers
              ?.map((s) => s.signedBy || "")
              .join(", ") || "",
        };
      } else {
        // TODO: does this make sense?
        // Document not signed yet, restore state for continued signing
        this.documentRef = savedDocumentRef;
        log.info("Restore point used - document pending", restorePoint);
        return null;
      }
    } catch (error) {
      log.error("Error checking restore point", error);
      return null;
    }
  }
}
