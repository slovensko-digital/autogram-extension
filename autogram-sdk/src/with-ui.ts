/**
 * @module with-ui
 * This module is special because it usees custom elements
 * and when you try registering them outside of content script you will get an error
 */

import type {
  AutogramDocument as DesktopAutogramDocument,
  SignResponseBody as DesktopSignResponseBody,
  SignatureParameters,
  SignV1Document,
  SignV1SignatureParameters,
} from "./autogram-api/index";

import type { AutogramVMobileIntegrationInterfaceStateful } from "./avm-api/index";
import { AvmSimpleChannel } from "./channel-avm";
import { Base64 } from "js-base64";
import { AutogramRoot } from "./injected-ui/main";
import { SigningMethod } from "./injected-ui/types";
import type {
  AutogramDesktopIntegrationInterface,
  DesktopSigningStateConsumer,
} from "./autogram-api/index";
import { AutogramDesktopSimpleChannel } from "./channel-desktop";
import { DesktopClient, type DesktopSignOptions } from "./desktop-client";
import { createLogger } from "./log";
import {
  AutogramAppNotInstalledException,
  AutogramAppVersionTooLowException,
  AutogramSdkException,
  MultiDocumentSigningOnMobileException,
  UserCancelledSigningException,
} from "./errors";
import {
  normalizeSignArgs,
  signRequestToLegacy,
  type SignRequest,
} from "./sign-request";
import { isMobileDevice } from "./utils";
import packageJson from "../package.json";

// mimeType is always returned by the desktop app, but not by AVM
export type SignedObject = Omit<DesktopSignResponseBody, "mimeType"> & {
  mimeType?: string;
};

export type CombinedSignOptions = DesktopSignOptions & {
  /** If true the signed content is base64-decoded, otherwise it stays base64 encoded (default false). */
  decodeBase64?: boolean;
};
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
  private desktopClient: DesktopClient;

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
    this.desktopClient = new DesktopClient(this.clientDesktopIntegration);

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
    log.debug(`init version ${packageJson.version}`);
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
   * Signs one or more documents, letting the user choose between the desktop app and
   * Autogram v mobile. Multiple documents (signed together into a single ASiC_E container)
   * can only be signed with the desktop app, so the method choice is skipped for them.
   *
   * Autogram >= 2.8.0 is used via `POST /api/v1/sign`; older versions fall back to the legacy
   * `POST /sign` endpoint for a single document and throw {@link AutogramAppVersionTooLowException}
   * for multiple documents.
   */
  public sign(
    documents: SignV1Document | SignV1Document[],
    parameters?: SignV1SignatureParameters,
    options?: CombinedSignOptions
  ): Promise<SignedObject>;
  /**
   * @deprecated Legacy call shape of the `/sign` endpoint; converted internally. Prefer the `documents` overload.
   * @param document document to sign
   * @param signatureParameters how to sign the document
   * @param payloadMimeType mime type of the input document
   * @param decodeBase64 if false the content will be (stay) base64 encoded, if true we will decode it
   */
  public sign(
    document: DesktopAutogramDocument,
    signatureParameters: SignatureParameters,
    payloadMimeType: string,
    decodeBase64?: boolean,
    options?: DesktopSignOptions
  ): Promise<SignedObject>;
  public async sign(
    first: SignV1Document | SignV1Document[] | DesktopAutogramDocument,
    second?: SignV1SignatureParameters | SignatureParameters,
    third?: string | CombinedSignOptions,
    fourth?: boolean | DesktopSignOptions,
    fifth?: DesktopSignOptions
  ): Promise<SignedObject> {
    let request: SignRequest;
    let options: CombinedSignOptions | undefined;
    let decodeBase64: boolean;
    if (typeof third === "string") {
      // legacy shape: (document, parameters, payloadMimeType, decodeBase64?, options?)
      ({ request } = normalizeSignArgs(first, second, third));
      decodeBase64 = typeof fourth === "boolean" ? fourth : false;
      options = fifth;
    } else {
      ({ request, options } = normalizeSignArgs(first, second, third));
      decodeBase64 = options?.decodeBase64 ?? false;
    }

    try {
      const signedObject = await this.signBasedOnUserChoice(
        request,
        options?.onDesktopStateChange ?? options?.onStateChange
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
      } else if (e instanceof AutogramAppNotInstalledException) {
        log.error("Autogram app not installed", e);
        throw e;
      } else if (e instanceof AutogramAppVersionTooLowException) {
        // the reader screen already shows the appVersionTooLow state
        log.error("Autogram app version too low", e);
        throw e;
      } else if (e instanceof AutogramSdkException) {
        this.ui.showError(e.message);
      }
      log.error("Signing failed", e);
      throw e;
    }
  }

  private async signBasedOnUserChoice(
    request: SignRequest,
    onDesktopStateChange?: DesktopSigningStateConsumer
  ) {
    const multiDocument = request.documents.length > 1;
    if (multiDocument && isMobileDevice()) {
      // the error screen is shown by the caller via ui.showError()
      this.ui.show();
      throw new MultiDocumentSigningOnMobileException();
    }

    let signingMethod: SigningMethod;
    if (multiDocument) {
      log.info("Multiple documents can only be signed with the desktop app, skipping method choice");
      signingMethod = SigningMethod.reader;
    } else {
      signingMethod = await this.ui.startSigning();
      log.debug("User chose signing method", signingMethod);
    }

    const abortController = new AbortController();
    if (signingMethod === SigningMethod.reader) {
      const stateConsumer: DesktopSigningStateConsumer = (state) => {
        this.ui.updateDesktopSigningState(state);
        onDesktopStateChange?.(state);
      };

      this.ui.desktopSigning(abortController);
      if (multiDocument) this.ui.show(); // startSigning() was skipped, so nothing has shown the dialog yet
      return this.getSignatureDesktop(request, abortController, stateConsumer);
    } else if (signingMethod === SigningMethod.mobile) {
      return this.getSignatureMobile(request, abortController);
    } else if (signingMethod === SigningMethod.mobileOnMobile) {
      return this.getSignatureMobileOnMobile(request, abortController);
    } else {
      log.debug("Invalid signing method");
      throw new Error("Invalid signing method");
    }
  }

  public async useRestorePoint(
    restorePoint: string
  ): Promise<SignedObject | null> {
    log.debug("useRestorePoint", restorePoint);

    let restored =
      await this.clientMobileIntegration.useRestorePoint(restorePoint);

    if (restored !== null) {
      if (await this.ui.maybeRestoreRestorePoint()) {
        return restored;
      }
    }
    return null;
  }

  private async getSignatureDesktop(
    request: SignRequest,
    abortController: AbortController,
    onStateChange?: DesktopSigningStateConsumer
  ): Promise<SignedObject> {
    log.info("getSignatureDesktop");
    const signedObject = await this.desktopClient.sign(
      request.documents,
      request.parameters,
      {
        abortController,
        onStateChange,
        presentation: request.presentation,
      }
    );

    this.signerIdentificationListeners.forEach((cb) => cb());
    this.signerIdentificationListeners = [];
    this.signatureIndex++;

    this.ui.hide();
    this.ui.reset();

    return signedObject;
  }

  private async getSignatureMobile(
    request: SignRequest,
    abortController: AbortController
  ): Promise<SignedObject> {
    try {
      const url = await this.getSignatureMobileAvmUrl(request);
      // TODO when the user closes the UI we should abort the signing ??
      this.ui.showQRCode(url, abortController);

      return await this.getSignatureMobileSignDocument(abortController);
    } catch (e) {
      log.error("getSignatureMobile failed", e);
      throw e;
    }
  }

  private async getSignatureMobileOnMobile(
    request: SignRequest,
    abortController: AbortController
  ): Promise<SignedObject> {
    try {
      const url = await this.getSignatureMobileAvmUrl(request);

      this.ui.openMobileOnMobile(url, abortController);
      window.open(url, "_blank", "noopener");

      return await this.getSignatureMobileSignDocument(abortController);
    } catch (e) {
      log.error("getSignatureMobileOnMobile failed", e);
      throw e;
    }
  }

  private async getSignatureMobileAvmUrl(
    request: SignRequest
    // TODO add abortController here?
  ) {
    // AVM only knows the legacy single-document shape
    const { document, parameters: params, payloadMimeType } = signRequestToLegacy(request);
    const container =
      params.container == null
        ? null
        : params.container == "ASiC_E"
          ? "ASiC-E"
          : "ASiC-S";
    // AVM does not support the form-less BASELINE_B / BASELINE_T levels accepted by the desktop app
    let level = params.level;
    if (level === "BASELINE_B" || level === "BASELINE_T") {
      log.warn(`Signature level ${level} is not supported by AVM, using AVM default`);
      level = undefined;
    }

    await this.clientMobileIntegration.loadOrRegister();
    await this.clientMobileIntegration.addDocument({
      document: document,
      parameters: {
        ...params,
        container: container ?? undefined,
        level,
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
    const signedObject =
      await this.clientMobileIntegration.waitForSignature(abortController);
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
