/**
 * @module with-ui
 * This module is special because it usees custom elements
 * and when you try registering them outside of content script you will get an error
 */

import {
  SignatureParameters as DesktopSignatureParameters,
  AutogramDocument as DesktopAutogramDocument,
  SignResponseBody as DesktopSignResponseBody,
  SignatureParameters,
} from "./autogram-api/index";

import { AutogramVMobileIntegrationInterfaceStateful } from "./avm-api/index";
import { AvmSimpleChannel } from "./channel-avm";
import { Base64 } from "js-base64";
import { AutogramRoot } from "./injected-ui/main";
import { SigningMethod } from "./injected-ui/types";
import { AutogramDesktopIntegrationInterface } from "./autogram-api/lib/apiClient";
import { AutogramDesktopSimpleChannel } from "./channel-desktop";
import { createLogger } from "./log";
import { AutogramSdkException, UserCancelledSigningException } from "./errors";

export type SignedObject = DesktopSignResponseBody;
// We have to leave this in because otherwise the custom elements are not registered
export { AutogramRoot } from "./injected-ui/main";

const log = createLogger("ag-sdk.CombinedClient");

/**
 * CombinedClient combines desktop and mobile signing methods with UI to choose between them
 *
 * @class CombinedClient
 * @module with-ui
 * @param avmChannel - implementing Autogram V Mobile interface. It can be used to bind SDK to service worker.
 * @param desktopChannel - implementing Autogram Desktop interface. It can be used to bind SDK to service worker.
 * @param resetSignRequestCallback - Callback to reset sign request
 */
export class CombinedClient {
  private signatureIndex = 1;
  private signerIdentificationListeners: (() => void)[];

  /**
   * @param avmChannel - Autogram V Mobile Integration channel
   * @param resetSignRequestCallback - Callback to reset sign request
   */
  private constructor(
    private ui: AutogramRoot,
    private clientMobileIntegration: AutogramVMobileIntegrationInterfaceStateful = new AvmSimpleChannel(),
    private clientDesktopIntegration: AutogramDesktopIntegrationInterface = new AutogramDesktopSimpleChannel(),
    private resetSignRequestCallback: (() => void) | undefined = undefined
  ) {
    // this.ui = ui;

    // this.clientDesktopIntegration = clientDesktopIntegration;

    // this.clientMobileIntegration = avmChannel;
    this.clientMobileIntegration.init();

    // this.resetSignRequestCallback = resetSignRequestCallback;

    this.resetSignRequest();

    log.debug("CombinedClient constructor end");
  }

  /**
   * We have to use async factory function because we have to wait for the UI to be created
   *
   */
  public static async init(
    clientMobileIntegration: AutogramVMobileIntegrationInterfaceStateful = new AvmSimpleChannel(),
    clientDesktopIntegration: AutogramDesktopIntegrationInterface = new AutogramDesktopSimpleChannel(),
    resetSignRequestCallback?: () => void
  ): Promise<CombinedClient> {
    // TODO: WIP
    log.debug("init");
    async function createUI(): Promise<AutogramRoot> {
      const root: AutogramRoot = document.createElement(
        "autogram-root"
      ) as unknown as AutogramRoot;
      document.body.appendChild(root);

      await new Promise<void>((resolve, reject) => {
        try {
          log.debug("CombinedClient init addEventListener");
          const resolved = false;
          const listener = root.addEventListener(
            "load",
            () => {
              log.debug("CombinedClient init load event");
              if (!resolved) {
                resolve();
              }
            },
            { once: true }
          );
          if (root.isConnected) {
            log.debug("CombinedClient init already connected", { root });
            resolve();
          }
        } catch (e) {
          log.error("CombinedClient init createUI failed", e);
          reject(e);
        }
      });

      log.debug({ root: root, ss: root.startSigning });

      return root as AutogramRoot;
    }

    log.debug("CombinedClient init createUI");
    const ui = await createUI();

    log.debug("CombinedClient init new CombinedClient");
    return new CombinedClient(
      ui,
      clientMobileIntegration,
      clientDesktopIntegration,
      resetSignRequestCallback
    );
  }

  public setResetSignRequestCallback(callback: () => void) {
    if (this.resetSignRequestCallback !== undefined) {
      log.warn("resetSignRequestCallback already set");
    }
    if (typeof callback !== "function") {
      throw new Error("callback is not a function");
    }
    this.resetSignRequestCallback = callback;
  }

  /**
   *
   * @param document document to sign
   * @param signatureParameters how to sign the document
   * @param payloadMimeType mime type of the input document
   * @param decodeBase64 if false the content will be (stay) base64 encoded, if true we will decode it
   * @returns
   */
  public async sign(
    document: DesktopAutogramDocument,
    signatureParameters: SignatureParameters,
    payloadMimeType: string,
    decodeBase64 = false
  ) {
    try {
      const signedObject = await this.signBasedOnUserChoice(
        document,
        signatureParameters,
        payloadMimeType
      );
      return {
        ...signedObject,
        content: decodeBase64
          ? Base64.decode(signedObject.content)
          : signedObject.content,
      };
    } catch (e) {
      if (e instanceof UserCancelledSigningException) {
        log.info("User cancelled request");
        this.ui.signingCancelled();
        throw e;
      } else if (e instanceof AutogramSdkException) {
        this.ui.showError(e.message);
      }
      log.error("Signing failed", e);
      throw e;
    }
  }

  private async signBasedOnUserChoice(
    document: DesktopAutogramDocument,
    signatureParameters: SignatureParameters,
    payloadMimeType: string
  ) {
    // TODO: remove
    log.debug("sign", this.ui);
    const signingMethod = await this.ui.startSigning();

    log.debug("User chose signing method", signingMethod);

    const abortController = new AbortController();
    if (signingMethod === SigningMethod.reader) {
      this.ui.desktopSigning(abortController);
      await this.launchDesktop(abortController);
      return this.getSignatureDesktop(
        document,
        signatureParameters,
        payloadMimeType,
        abortController
      );
    } else if (signingMethod === SigningMethod.mobile) {
      return this.getSignatureMobile(
        document,
        signatureParameters,
        payloadMimeType,
        abortController
      );
    } else if (signingMethod === SigningMethod.mobileOnMobile) {
      return this.getSignatureMobileOnMobile(
        document,
        signatureParameters,
        payloadMimeType,
        abortController
      );
    } else {
      log.debug("Invalid signing method");
      throw new Error("Invalid signing method");
    }
  }

  public async useRestorePoint(
    restorePoint: string
  ): Promise<SignedObject | null> {
    log.debug("useRestorePoint", restorePoint);

    let restored = await this.clientMobileIntegration.useRestorePoint(
      restorePoint
    );

    if (restored !== null) {
      if (await this.ui.maybeRestoreRestorePoint()) {
        return restored;
      }
    }
    return null;
  }

  private async launchDesktop(abortController?: AbortController) {
    try {
      const info = await this.clientDesktopIntegration.info();
      if (info.status != "READY") throw new Error("Wait for server");
      log.info(`Autogram ${info.version} is ready`);
    } catch (e) {
      log.error("launchDesktop failed, getting info failed", e);
      const url = await this.clientDesktopIntegration.getLaunchURL();
      log.info(`Opening "${url}"`);
      window.location.assign(url);
      try {
        const info = await this.clientDesktopIntegration.waitForStatus(
          "READY",
          100,
          5,
          abortController
        );
        log.info(`Autogram ${info.version} is ready`);
      } catch (e) {
        log.error("launchDesktop failed, waiting for Autogram failed", e);
        throw new AutogramSdkException("Nepodarilo sa spustiť Autogram.");
      }
    }
  }

  private async getSignatureDesktop(
    document: DesktopAutogramDocument,
    signatureParameters: DesktopSignatureParameters,
    payloadMimeType: string,
    abortController: AbortController
  ): Promise<SignedObject> {
    log.info("getSignatureDesktop");
    return this.clientDesktopIntegration
      .sign(document, signatureParameters, payloadMimeType, abortController)
      .then((signedObject) => {
        // TODO("restart SignRequest?");

        this.signerIdentificationListeners.forEach((cb) => cb());
        this.signerIdentificationListeners = [];
        this.signatureIndex++;

        this.ui.hide();
        this.ui.reset();

        return signedObject;
      })
      .catch((reason) => {
        if (reason instanceof UserCancelledSigningException) {
          log.info("User cancelled request");
          this.ui.signingCancelled();
          throw reason;
        } else {
          log.error("getSignatureDesktop failed", reason);
          throw reason;
        }
      });
  }

  private async getSignatureMobile(
    document: DesktopAutogramDocument,
    signatureParameters: DesktopSignatureParameters,
    payloadMimeType: string,
    abortController: AbortController
  ): Promise<SignedObject> {
    try {
      const url = await this.getSignatureMobileAvmUrl(
        signatureParameters,
        document,
        payloadMimeType
      );
      // TODO when the user closes the UI we should abort the signing ??
      this.ui.showQRCode(url, abortController);

      return await this.getSignatureMobileSignDocument(abortController);
    } catch (e) {
      log.error("getSignatureMobile failed", e);
      throw e;
    }
  }

  private async getSignatureMobileOnMobile(
    document: DesktopAutogramDocument,
    signatureParameters: DesktopSignatureParameters,
    payloadMimeType: string,
    abortController: AbortController
  ): Promise<SignedObject> {
    try {
      const url = await this.getSignatureMobileAvmUrl(
        signatureParameters,
        document,
        payloadMimeType
      );

      this.ui.openMobileOnMobile(url, abortController);
      window.open(url, "_blank", "noopener");

      return await this.getSignatureMobileSignDocument(abortController);
    } catch (e) {
      log.error("getSignatureMobileOnMobile failed", e);
      throw e;
    }
  }

  private async getSignatureMobileAvmUrl(
    signatureParameters: SignatureParameters,
    document: { filename?: string; content: string },
    payloadMimeType: string
    // TODO add abortController here?
  ) {
    const params = signatureParameters;
    const container =
      params.container == null
        ? null
        : params.container == "ASiC_E"
        ? "ASiC-E"
        : "ASiC-S";

    await this.clientMobileIntegration.loadOrRegister();
    await this.clientMobileIntegration.addDocument({
      document: document,
      parameters: {
        ...params,
        container: container ?? undefined,
      },
      payloadMimeType: payloadMimeType,
    });
    const url = await this.clientMobileIntegration.getQrCodeUrl();
    log.debug({ url });
    return url;
  }

  private async getSignatureMobileSignDocument(
    abortController?: AbortController
  ) {
    const signedObject = await this.clientMobileIntegration.waitForSignature(
      abortController
    );
    log.debug({ signedObject });
    if (signedObject === null || signedObject === undefined) {
      throw new Error("Signing cancelled");
    }

    // const signedObject2 = {
    //   content: signedObject.content,
    //   signedBy:
    //     signedObject.signers?.at(-1)?.signedBy ?? "Používateľ Autogramu",
    //   issuedBy: signedObject.signers?.at(-1)?.issuedBy ?? "(neznámy)",
    // };
    this.signerIdentificationListeners.forEach((cb) => cb());
    this.signerIdentificationListeners = [];
    this.signatureIndex++;

    this.ui.hide();

    this.clientMobileIntegration.reset();
    this.ui.reset();
    return {
      content: signedObject.content,
      signedBy:
        signedObject.signers?.at(-1)?.signedBy ?? "Používateľ Autogramu",
      issuedBy: signedObject.signers?.at(-1)?.issuedBy ?? "(neznámy)",
    };
  }

  /**
   * reset sign request, so callbacks and signature index are reset
   */
  public resetSignRequest() {
    this.signerIdentificationListeners = [];
    if (this.resetSignRequestCallback) {
      this.resetSignRequestCallback();
    } // from outside - this.signRequest = new SignRequest();
  }

  /**
   *
   * @returns signature index (incremented after each signature)
   */
  public getSignatureIndex() {
    return this.signatureIndex;
  }
}
