/**
 * @module with-ui
 * This module is special because it usees custom elements
 * and when you try registering them outside of content script you will get an error
 */

import type {
  AutogramDocument as DesktopAutogramDocument,
  SignatureParameters,
  DesktopSigningStateConsumer,
} from "./autogram-api/index";
import type {
  DocumentToSign,
  SignedDocumentResult,
  SignedObject,
} from "./types";
import { toLegacySignedObject, toPayloadMimeType } from "./types";

import type { AutogramVMobileIntegrationInterfaceStateful } from "./avm-api/index";
import { AvmSimpleChannel } from "./channel-avm";
import { Base64 } from "js-base64";
import { AutogramRoot } from "./injected-ui/main";
import type { AutogramDesktopIntegrationInterface } from "./autogram-api/index";
import { AutogramDesktopSimpleChannel } from "./channel-desktop";
import type { DesktopSignOptions } from "./desktop-client";
import { SigningFlow, SigningState } from "./flow";
import { createLogger } from "./log";
import { AutogramError } from "./errors";
import packageJson from "../package.json";
import { AvmRegistrationInfo } from "./avm-api/lib/apiClient";

export type { SignedObject } from "./types";
// We have to leave this in because otherwise the custom elements are not registered
export { AutogramRoot } from "./injected-ui/main";

const log = createLogger("ag-sdk.CombinedClient");

interface CombinedClientOptions extends AvmRegistrationInfo {
  enableNotifications?: boolean;
  pairingEnabled?: boolean;
}

const DEFAULT_OPTIONS: CombinedClientOptions = {
  enableNotifications: true,
  platform: "unknown",
  displayName: "",
  pairingEnabled: false,
};

/**
 * Options for {@link createAutogramClient}.
 */
export interface AutogramClientOptions {
  /**
   * Autogram v Mobile channel. Provide one to route AVM calls through a
   * different execution context (e.g. an extension background worker);
   * defaults to direct HTTPS calls to the AVM service.
   */
  mobileChannel?: AutogramVMobileIntegrationInterfaceStateful;
  /**
   * Autogram desktop channel; defaults to direct HTTP calls to the local
   * desktop app.
   */
  desktopChannel?: AutogramDesktopIntegrationInterface;
  /** Called when the client resets its signing state. */
  onResetSignRequest?: () => void;
  /** Send push notifications to paired mobile devices. Default `true`. */
  enableNotifications?: boolean;
  /** Platform reported when registering the AVM integration. */
  platform?: string;
  /** Display name reported when registering the AVM integration. */
  displayName?: string;
  /** Whether pairing is enabled for mobile notifications. Default `true`. */
  pairingEnabled?: boolean;
}

/** Options of the unified {@link CombinedClient.sign} form. */
export interface ClientSignOptions {
  /** Cancels the signing step. */
  signal?: AbortSignal;
  /** Desktop launch/signing progress updates. */
  onState?: DesktopSigningStateConsumer;
}

/**
 * Creates the signing client with the built-in dialog UI.
 * Preferred over the positional {@link CombinedClient.init}.
 */
export async function createAutogramClient(
  options: AutogramClientOptions = {}
): Promise<CombinedClient> {
  return CombinedClient.init(
    options.mobileChannel ?? new AvmSimpleChannel(),
    options.desktopChannel ?? new AutogramDesktopSimpleChannel(),
    options.onResetSignRequest,
    {
      enableNotifications: options.enableNotifications ?? true,
      platform: options.platform ?? "unknown",
      displayName: options.displayName ?? "",
      pairingEnabled: options.pairingEnabled ?? false,
    }
  );
}

/**
 * CombinedClient combines desktop and mobile signing methods with UI to choose between them
 *
 * The signing logic itself lives in the headless {@link SigningFlow};
 * this class implements its delegate by driving the Lit dialog
 * (`<autogram-root>`), and keeps the public API stable.
 *
 * @class CombinedClient
 * @module with-ui
 */
export class CombinedClient {
  private signatureIndex = 1;
  private signerIdentificationListeners: (() => void)[];
  private flow: SigningFlow;
  /** whether the desktop screen was already opened for the current sign() */
  private desktopScreenActive = false;

  private constructor(
    private ui: AutogramRoot,
    private clientMobileIntegration: AutogramVMobileIntegrationInterfaceStateful = new AvmSimpleChannel(),
    clientDesktopIntegration: AutogramDesktopIntegrationInterface = new AutogramDesktopSimpleChannel(),
    private resetSignRequestCallback: (() => void) | undefined = undefined,
    options: CombinedClientOptions = DEFAULT_OPTIONS
  ) {
    this.flow = new SigningFlow(
      clientDesktopIntegration,
      this.clientMobileIntegration,
      {
        chooseMethod: () => this.ui.startSigning(),
        onState: (state, abortController) =>
          this.handleFlowState(state, abortController),
        confirmRestorePoint: () => this.ui.maybeRestoreRestorePoint(),
      },
      { platform: options.platform, displayName: options.displayName }
    );

    this.clientMobileIntegration.init();
    this.ui.onRetryMobileNotification = this.retryMobileNotification.bind(this);
    this.ui.pairingEnabled = options.pairingEnabled ?? false;

    this.resetSignRequest();

    log.debug("CombinedClient constructor end");
  }

  /**
   * We have to use async factory function because we have to wait for the UI to be created
   *
   * @deprecated Prefer {@link createAutogramClient} (options object).
   */
  public static async init(
    clientMobileIntegration: AutogramVMobileIntegrationInterfaceStateful = new AvmSimpleChannel(),
    clientDesktopIntegration: AutogramDesktopIntegrationInterface = new AutogramDesktopSimpleChannel(),
    resetSignRequestCallback?: () => void,
    options: CombinedClientOptions = {
      enableNotifications: true,
      platform: "unknown",
      displayName: "",
    }
  ): Promise<CombinedClient> {
    log.debug(`init version ${packageJson.version}`);
    async function createUI(): Promise<AutogramRoot> {
      const root: AutogramRoot = document.createElement(
        "autogram-root"
      ) as unknown as AutogramRoot;
      document.body.appendChild(root);

      await new Promise<void>((resolve, reject) => {
        try {
          log.debug("CombinedClient init addEventListener");
          let resolved = false;
          const settle = () => {
            if (!resolved) {
              resolved = true;
              resolve();
            }
          };
          root.addEventListener(
            "load",
            () => {
              log.debug("CombinedClient init load event");
              settle();
            },
            { once: true }
          );
          if (root.isConnected) {
            log.debug("CombinedClient init already connected", { root });
            settle();
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
      resetSignRequestCallback,
      options
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
   * Signs a document (unified form). The result keeps every signer and
   * the MIME type of the signed artifact.
   *
   * @param document document to sign, with its own `mimeType`/`encoding`
   * @param parameters how to sign the document
   */
  public async sign(
    document: DocumentToSign,
    parameters?: SignatureParameters,
    options?: ClientSignOptions
  ): Promise<SignedDocumentResult>;
  /**
   * Signs a document (legacy positional form).
   *
   * @param document document to sign
   * @param signatureParameters how to sign the document
   * @param payloadMimeType mime type of the input document
   * @param decodeBase64 if false the content will be (stay) base64 encoded, if true we will decode it
   * @deprecated Prefer the unified form: `sign(document, parameters?, options?)`
   * with the MIME type on the document.
   */
  public async sign(
    document: DesktopAutogramDocument,
    signatureParameters: SignatureParameters,
    payloadMimeType: string,
    decodeBase64?: boolean,
    options?: DesktopSignOptions
  ): Promise<SignedObject>;
  public async sign(
    document: DocumentToSign | DesktopAutogramDocument,
    parametersArg?: SignatureParameters,
    mimeTypeOrOptions?: string | ClientSignOptions,
    decodeBase64 = false,
    legacyOptions?: DesktopSignOptions
  ): Promise<SignedDocumentResult | SignedObject> {
    const isLegacyForm = typeof mimeTypeOrOptions === "string";
    try {
      this.desktopScreenActive = false;

      if (isLegacyForm) {
        const result = await this.flow.sign(
          document as DesktopAutogramDocument,
          parametersArg ?? {},
          mimeTypeOrOptions,
          { onDesktopStateChange: legacyOptions?.onDesktopStateChange }
        );
        this.afterSuccessfulSignature();
        const signedObject = toLegacySignedObject(result);
        return {
          ...signedObject,
          content: decodeBase64
            ? Base64.decode(signedObject.content)
            : signedObject.content,
        };
      }

      const unifiedDocument = document as DocumentToSign;
      const options = mimeTypeOrOptions;
      const result = await this.flow.sign(
        {
          content: unifiedDocument.content,
          filename: unifiedDocument.filename,
        },
        parametersArg ?? {},
        toPayloadMimeType(unifiedDocument),
        { onDesktopStateChange: options?.onState, signal: options?.signal }
      );
      this.afterSuccessfulSignature();
      return result;
    } catch (e) {
      if (AutogramError.is(e, "user-cancelled")) {
        log.info("User cancelled request");
        this.ui.signingCancelled();
        throw e;
      } else if (AutogramError.is(e, "aborted")) {
        // deliberate abort (user closed the dialog, timeout) — no error dialog
        log.info("Signing aborted");
        throw e;
      } else if (AutogramError.is(e, "app-not-installed")) {
        log.error("Autogram app not installed", e);
        throw e;
      } else if (AutogramError.is(e)) {
        this.ui.showError(e.message);
      }
      log.error("Signing failed", e);
      throw e;
    }
  }

  public async useRestorePoint(
    restorePoint: string
  ): Promise<SignedObject | null> {
    return this.flow.useRestorePoint(restorePoint);
  }

  /**
   * Maps flow progress onto the Lit dialog.
   */
  private handleFlowState(
    state: SigningState,
    abortController: AbortController
  ) {
    log.debug("flow state", state);
    switch (state.type) {
      case "desktop":
        if (!this.desktopScreenActive) {
          this.desktopScreenActive = true;
          this.ui.desktopSigning(abortController);
        }
        this.ui.updateDesktopSigningState(state.state);
        break;
      case "mobile":
        if (state.state === "qr-ready") {
          this.ui.showQRCode(state.signingUrl, state.pairingUrl, abortController, this.ui.pairingEnabled);
        }
        // "preparing" has no dedicated screen today
        break;
      case "mobile-on-mobile":
        this.ui.openMobileOnMobile(state.signingUrl, abortController);
        window.open(state.signingUrl, "_blank", "noopener");
        break;
      case "done":
        this.desktopScreenActive = false;
        this.ui.hide();
        this.ui.reset();
        break;
    }
  }

  /** Runs the signer-identification listeners and bumps the counter. */
  private afterSuccessfulSignature() {
    this.signerIdentificationListeners.forEach((cb) => cb());
    this.signerIdentificationListeners = [];
    this.signatureIndex++;
  }

  private async retryMobileNotification(): Promise<void> {
    try {
      await this.clientMobileIntegration.sendNotification();
    } catch (error) {
      log.warn("Retrying mobile notification failed", error);
    }
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
