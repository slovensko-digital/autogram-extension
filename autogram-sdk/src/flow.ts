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
  DesktopSigningState,
  DesktopSigningStateConsumer,
} from "./autogram-api/index";
import type { AutogramVMobileIntegrationInterfaceStateful } from "./avm-api/index";
import { DesktopClient } from "./desktop-client";
import {
  SigningMethod,
  fromAvmSignedDocument,
  fromDesktopResponse,
} from "./types";
import type { SignedDocumentResult, SignedObject } from "./types";
import { AutogramError, MultiDocumentSigningOnMobileException } from "./errors";
import { createLogger } from "./log";
import { signRequestToLegacy, type SignRequest } from "./sign-request";

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
  /**
   * Whether the page runs on a mobile device, where the desktop app is not
   * available. Multiple documents can only be signed on desktop.
   * Default: never.
   */
  isMobileDevice?: () => boolean;
}

export interface SigningFlowSignOptions {
  onDesktopStateChange?: DesktopSigningStateConsumer;
  /** Cancels the signing step (not the method chooser). */
  signal?: AbortSignal;
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
   * Multiple documents (one shared ASiC_E container) can only be signed
   * with the desktop app, so the method choice is skipped for them.
   * Resolves with the signed object; rejects with `AutogramError`s
   * (`user-cancelled`, `aborted`, `app-not-installed`,
   * `app-version-too-low`, `not-supported`, …).
   */
  async sign(
    request: SignRequest,
    options?: SigningFlowSignOptions
  ): Promise<SignedDocumentResult> {
    if (options?.signal?.aborted) {
      throw new AutogramError("aborted", "Signing aborted");
    }
    if (request.documents.length === 0) {
      throw new AutogramError("unknown", "No documents to sign");
    }

    const abortController = new AbortController();
    options?.signal?.addEventListener(
      "abort",
      () => abortController.abort(options.signal?.reason),
      { once: true }
    );

    let signingMethod: SigningMethod;
    if (request.documents.length > 1) {
      if (this.options.isMobileDevice?.()) {
        throw new MultiDocumentSigningOnMobileException();
      }
      log.info(
        "Multiple documents can only be signed with the desktop app, skipping method choice"
      );
      signingMethod = SigningMethod.reader;
    } else {
      signingMethod = await this.delegate.chooseMethod();
      log.debug("User chose signing method", signingMethod);
    }

    switch (signingMethod) {
      case SigningMethod.reader:
        return this.signDesktop(
          request,
          abortController,
          options?.onDesktopStateChange
        );
      case SigningMethod.mobile:
        return this.signMobile(request, abortController);
      case SigningMethod.mobileOnMobile:
        return this.signMobileOnMobile(request, abortController);
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
    request: SignRequest,
    abortController: AbortController,
    onDesktopStateChange?: DesktopSigningStateConsumer
  ): Promise<SignedDocumentResult> {
    log.info("signDesktop");

    const emit = (state: DesktopSigningState) => {
      this.delegate.onState({ type: "desktop", state }, abortController);
      onDesktopStateChange?.(state);
    };

    // show the desktop screen before the first client callback arrives
    emit({ type: "checkingApp" });

    const signedObject = await this.desktopClient.signRequest(request, {
      abortController,
      onStateChange: emit,
    });

    this.delegate.onState({ type: "done" }, abortController);
    return fromDesktopResponse(signedObject, request.parameters);
  }

  private async signMobile(
    request: SignRequest,
    abortController: AbortController
  ): Promise<SignedDocumentResult> {
    try {
      this.delegate.onState(
        { type: "mobile", state: "preparing" },
        abortController
      );
      const { signingUrl, pairingUrl } = await this.prepareMobileSigning(request);
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
    request: SignRequest,
    abortController: AbortController
  ): Promise<SignedDocumentResult> {
    try {
      this.delegate.onState(
        { type: "mobile", state: "preparing" },
        abortController
      );
      const { signingUrl } = await this.prepareMobileSigning(request);
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
    request: SignRequest
  ): Promise<{ signingUrl: string; pairingUrl: string }> {
    // AVM only knows the legacy single-document shape
    const {
      document,
      parameters: params,
      payloadMimeType,
    } = signRequestToLegacy(request);
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

    await this.mobile.loadOrRegister({
      platform: this.options.platform,
      displayName: this.options.displayName,
    });
    await this.mobile.addDocument({
      document: document,
      parameters: {
        ...params,
        container: container ?? undefined,
        level,
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
  ): Promise<SignedDocumentResult> {
    const signedDocument = await this.mobile.waitForSignature(abortController);
    log.debug({ signedDocument });
    if (signedDocument === null || signedDocument === undefined) {
      throw new Error("Signing cancelled");
    }

    this.delegate.onState({ type: "done" }, abortController);
    this.mobile.reset();

    return fromAvmSignedDocument(signedDocument);
  }
}
