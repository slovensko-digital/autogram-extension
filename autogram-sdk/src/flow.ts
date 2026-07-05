/**
 * @module flow
 * Headless signing flow controller: chooses between desktop and mobile
 * signing, drives the chosen path, and reports progress through a
 * delegate. Contains no DOM or custom-element code, so it is fully
 * unit-testable; the Lit dialog (`with-ui.ts`) is just one delegate
 * implementation.
 */

import type {
  AutogramDesktopIntegrationInterface,
  AutogramDocument,
  SignatureParameters,
  DesktopSigningState,
  DesktopSigningStateConsumer,
} from "./autogram-api/index";
import type { AutogramVMobileIntegrationInterfaceStateful } from "./avm-api/index";
import { DesktopClient } from "./desktop-client";
import { SigningMethod } from "./types";
import type { SignedObject } from "./types";
import { createLogger } from "./log";

const log = createLogger("ag-sdk:flow");

/**
 * Progress of a signing flow.
 *
 * @internal Not a stable public API yet — shape may change until the
 * phase-5/6 redesign settles (see docs/API-PROPOSAL.md).
 */
export type SigningState =
  | { type: "desktop"; state: DesktopSigningState }
  | { type: "mobile"; state: "preparing" }
  | {
      type: "mobile";
      state: "qr-ready";
      signingUrl: string;
      pairingUrl: string;
    }
  | { type: "mobile-on-mobile"; state: "url-ready"; signingUrl: string }
  | { type: "done" };

/**
 * What the flow needs from a UI.
 *
 * @internal Not a stable public API yet (see {@link SigningState}).
 */
export interface SigningFlowDelegate {
  /**
   * Show the method chooser and resolve the user's choice; reject with a
   * `user-cancelled` error when dismissed. Implementations may resolve
   * immediately (e.g. `mobileOnMobile` on mobile devices).
   */
  chooseMethod(): Promise<SigningMethod>;
  /**
   * Receive a progress update. `abortController` cancels the current
   * signing step — wire it to close buttons.
   */
  onState(state: SigningState, abortController: AbortController): void;
  /** Ask the user to confirm restoring a previous signing session. */
  confirmRestorePoint(): Promise<boolean>;
}

export interface SigningFlowOptions {
  /** Platform reported when registering the AVM integration. */
  platform: string;
  /** Display name reported when registering the AVM integration. */
  displayName?: string;
}

export interface SigningFlowSignOptions {
  onDesktopStateChange?: DesktopSigningStateConsumer;
}

/**
 * @internal Not a stable public API yet (see {@link SigningState}).
 */
export class SigningFlow {
  private desktopClient: DesktopClient;

  constructor(
    desktop: AutogramDesktopIntegrationInterface,
    private mobile: AutogramVMobileIntegrationInterfaceStateful,
    private delegate: SigningFlowDelegate,
    private options: SigningFlowOptions
  ) {
    this.desktopClient = new DesktopClient(desktop);
  }

  /**
   * Runs one signing ceremony: method choice, then the chosen path.
   * Resolves with the signed object; rejects with `AutogramError`s
   * (`user-cancelled`, `aborted`, `app-not-installed`, …).
   */
  async sign(
    document: AutogramDocument,
    signatureParameters: SignatureParameters,
    payloadMimeType: string,
    options?: SigningFlowSignOptions
  ): Promise<SignedObject> {
    const signingMethod = await this.delegate.chooseMethod();
    log.debug("User chose signing method", signingMethod);

    const abortController = new AbortController();
    switch (signingMethod) {
      case SigningMethod.reader:
        return this.signDesktop(
          document,
          signatureParameters,
          payloadMimeType,
          abortController,
          options?.onDesktopStateChange
        );
      case SigningMethod.mobile:
        return this.signMobile(
          document,
          signatureParameters,
          payloadMimeType,
          abortController
        );
      case SigningMethod.mobileOnMobile:
        return this.signMobileOnMobile(
          document,
          signatureParameters,
          payloadMimeType,
          abortController
        );
      default:
        log.debug("Invalid signing method");
        throw new Error("Invalid signing method");
    }
  }

  /**
   * Checks a restore point for a signature completed while the page was
   * away; asks the delegate for confirmation before using it.
   */
  async useRestorePoint(restorePoint: string): Promise<SignedObject | null> {
    log.debug("useRestorePoint", restorePoint);

    const restored = await this.mobile.useRestorePoint(restorePoint);

    if (restored !== null) {
      if (await this.delegate.confirmRestorePoint()) {
        return restored;
      }
    }
    return null;
  }

  private async signDesktop(
    document: AutogramDocument,
    signatureParameters: SignatureParameters,
    payloadMimeType: string,
    abortController: AbortController,
    onDesktopStateChange?: DesktopSigningStateConsumer
  ): Promise<SignedObject> {
    log.info("signDesktop");

    const emit = (state: DesktopSigningState) => {
      this.delegate.onState({ type: "desktop", state }, abortController);
      onDesktopStateChange?.(state);
    };

    // show the desktop screen before the first client callback arrives
    emit({ type: "checkingApp" });

    const signedObject = await this.desktopClient.sign(
      document,
      signatureParameters,
      payloadMimeType,
      {
        abortController,
        onStateChange: emit,
      }
    );

    this.delegate.onState({ type: "done" }, abortController);
    return signedObject;
  }

  private async signMobile(
    document: AutogramDocument,
    signatureParameters: SignatureParameters,
    payloadMimeType: string,
    abortController: AbortController
  ): Promise<SignedObject> {
    try {
      this.delegate.onState(
        { type: "mobile", state: "preparing" },
        abortController
      );
      const { signingUrl, pairingUrl } = await this.prepareMobileSigning(
        signatureParameters,
        document,
        payloadMimeType
      );
      this.delegate.onState(
        { type: "mobile", state: "qr-ready", signingUrl, pairingUrl },
        abortController
      );

      return await this.waitForMobileSignature(abortController);
    } catch (e) {
      log.error("signMobile failed", e);
      throw e;
    }
  }

  private async signMobileOnMobile(
    document: AutogramDocument,
    signatureParameters: SignatureParameters,
    payloadMimeType: string,
    abortController: AbortController
  ): Promise<SignedObject> {
    try {
      this.delegate.onState(
        { type: "mobile", state: "preparing" },
        abortController
      );
      const { signingUrl } = await this.prepareMobileSigning(
        signatureParameters,
        document,
        payloadMimeType
      );
      // the delegate opens the URL (headless code must not touch `window`)
      this.delegate.onState(
        { type: "mobile-on-mobile", state: "url-ready", signingUrl },
        abortController
      );

      return await this.waitForMobileSignature(abortController);
    } catch (e) {
      log.error("signMobileOnMobile failed", e);
      throw e;
    }
  }

  private async prepareMobileSigning(
    signatureParameters: SignatureParameters,
    document: { filename?: string; content: string },
    payloadMimeType: string
  ): Promise<{ signingUrl: string; pairingUrl: string }> {
    const params = signatureParameters;
    const container =
      params.container == null
        ? null
        : params.container == "ASiC_E"
          ? "ASiC-E"
          : "ASiC-S";

    await this.mobile.loadOrRegister({
      platform: this.options.platform,
      displayName: this.options.displayName,
    });
    await this.mobile.addDocument({
      document: document,
      parameters: {
        ...params,
        container: container ?? undefined,
      },
      payloadMimeType: payloadMimeType,
    });
    const [signingUrl, pairingUrl] = await Promise.all([
      this.mobile.getQrCodeUrl(),
      this.mobile.getPairingQrCodeUrl(),
    ]);
    log.debug({ signingUrl, pairingUrl });
    return { signingUrl, pairingUrl };
  }

  private async waitForMobileSignature(
    abortController: AbortController
  ): Promise<SignedObject> {
    const signedDocument = await this.mobile.waitForSignature(abortController);
    log.debug({ signedDocument });
    if (signedDocument === null || signedDocument === undefined) {
      throw new Error("Signing cancelled");
    }

    this.delegate.onState({ type: "done" }, abortController);
    this.mobile.reset();

    return {
      content: signedDocument.content,
      signedBy:
        signedDocument.signers?.at(-1)?.signedBy ?? "Používateľ Autogramu",
      issuedBy: signedDocument.signers?.at(-1)?.issuedBy ?? "(neznámy)",
    };
  }
}
