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
import type {
  AutogramVMobileIntegrationInterfaceStateful,
  PairedDevice,
} from "./avm-api/index";
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
      /** `null` when the integration does not support notifications */
      pairingUrl: string | null;
    }
  | { type: "mobile-on-mobile"; state: "url-ready"; signingUrl: string }
  /**
   * The signature is delivered. With `pairingSuggestion` a
   * `suggest-pairing` state follows right away — keep the dialog open.
   */
  | { type: "done"; pairingSuggestion?: true }
  /**
   * Emitted right after `done` for a mobile signature when the integration
   * supports notifications and no device was paired when signing started.
   * Re-emitted with a fresh URL before the pairing JWT expires. Abort the
   * passed controller to stop waiting for the pairing.
   */
  | { type: "mobile"; state: "suggest-pairing"; pairingUrl: string }
  /** A device was paired while `suggest-pairing` was shown. */
  | { type: "mobile"; state: "paired"; devices: PairedDevice[] };

/** A mobile channel that implements the optional notification methods. */
export type NotificationCapableChannel =
  AutogramVMobileIntegrationInterfaceStateful &
    Required<
      Pick<
        AutogramVMobileIntegrationInterfaceStateful,
        "getPairingQrCodeUrl" | "sendNotification" | "getPairedDevices"
      >
    >;

/**
 * Whether the channel implements the whole notifications capability
 * (pairing QR, push notifications, paired-device listing). Integrations
 * that skip it never get the pairing UI.
 */
export function supportsNotifications(
  channel: AutogramVMobileIntegrationInterfaceStateful
): channel is NotificationCapableChannel {
  return (
    typeof channel.getPairingQrCodeUrl === "function" &&
    typeof channel.sendNotification === "function" &&
    typeof channel.getPairedDevices === "function"
  );
}

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
  /**
   * Offer device pairing (link on the QR screen, pairing suggestion after
   * a mobile signature). Only takes effect when the mobile channel
   * {@link supportsNotifications}. Default `false`.
   */
  notifications?: boolean;
  /** Paired-device polling while a pairing QR is shown. Default 3 s. */
  pairingPollIntervalMs?: number;
  /** Pairing URL refresh period (its JWT lives 5 min). Default 4 min. */
  pairingUrlRefreshMs?: number;
  /** Stop polling for a pairing after this long. Default 15 min. */
  pairingTimeoutMs?: number;
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
  /** aborts the pairing suggestion of the previous mobile signature */
  private pairingSuggestion: AbortController | null = null;
  /** pairing state of the current mobile signing, `null` without one */
  private pairing: PairingSession | null = null;

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
    this.cancelPairingSuggestion();
    this.pairing = null;

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
      const { signingUrl, pairingUrl } =
        await this.prepareMobileSigning(request);
      this.delegate.onState(
        { type: "mobile", state: "qr-ready", signingUrl, pairingUrl },
        abortController
      );

      const notificationChannel = this.notificationChannel();
      // decided once the signature is in: a phone may get paired meanwhile
      const suggest = () =>
        notificationChannel !== null && this.pairing?.hasPairedDevice === false;
      const result = await this.waitForMobileSignature(abortController, () =>
        suggest() ? { type: "done", pairingSuggestion: true } : { type: "done" }
      );
      if (suggest()) {
        this.suggestPairing();
      }
      return result;
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

  /** Stops a pending pairing suggestion (its screen is being replaced). */
  cancelPairingSuggestion() {
    this.pairingSuggestion?.abort("Pairing suggestion replaced");
    this.pairingSuggestion = null;
  }

  /** The mobile channel when pairing should be offered, else `null`. */
  private notificationChannel(): NotificationCapableChannel | null {
    return this.options.notifications && supportsNotifications(this.mobile)
      ? this.mobile
      : null;
  }

  /**
   * Polls the paired devices of the current mobile signing until one shows
   * up (resolves with the list), `signal` aborts or the timeout passes
   * (resolves `null`). Refreshes the pairing URL before its JWT expires
   * and reports it through `onPairingUrl`. Use it while a pairing QR is
   * shown. Never throws.
   */
  async waitForPairing(
    signal: AbortSignal,
    onPairingUrl?: (pairingUrl: string) => void
  ): Promise<PairedDevice[] | null> {
    const mobile = this.notificationChannel();
    const pairing = this.pairing;
    if (!mobile || !pairing) {
      return null;
    }
    const pollIntervalMs = this.options.pairingPollIntervalMs ?? 3_000;
    const urlRefreshMs = this.options.pairingUrlRefreshMs ?? 4 * 60_000;
    const timeoutMs = this.options.pairingTimeoutMs ?? 15 * 60_000;

    const refreshUrlIfStale = async () => {
      if (Date.now() - pairing.pairingUrlIssuedAt < urlRefreshMs) {
        return;
      }
      const pairingUrl = await mobile.getPairingQrCodeUrl();
      pairing.pairingUrl = pairingUrl;
      pairing.pairingUrlIssuedAt = Date.now();
      if (!signal.aborted) {
        onPairingUrl?.(pairingUrl);
      }
    };

    const startedAt = Date.now();
    while (!signal.aborted && Date.now() - startedAt < timeoutMs) {
      try {
        await refreshUrlIfStale();
      } catch (e) {
        log.warn("Refreshing the pairing URL failed", e);
      }
      await abortableDelay(pollIntervalMs, signal);
      if (signal.aborted) {
        break;
      }
      try {
        const devices = await mobile.getPairedDevices();
        if (signal.aborted) {
          break;
        }
        if (devices.length > 0) {
          pairing.hasPairedDevice = true;
          return devices;
        }
      } catch (e) {
        log.warn("Polling paired devices failed", e);
      }
    }
    return null;
  }

  /**
   * Suggests pairing after a mobile signature: emits `suggest-pairing`
   * synchronously (the dialog stays open after `done`), then waits for the
   * pairing in the background.
   */
  private suggestPairing() {
    const pairing = this.pairing;
    if (!pairing || pairing.pairingUrl === null) {
      return;
    }
    const abortController = new AbortController();
    this.pairingSuggestion = abortController;
    const { signal } = abortController;

    this.delegate.onState(
      {
        type: "mobile",
        state: "suggest-pairing",
        pairingUrl: pairing.pairingUrl,
      },
      abortController
    );

    void this.waitForPairing(signal, (pairingUrl) =>
      this.delegate.onState(
        { type: "mobile", state: "suggest-pairing", pairingUrl },
        abortController
      )
    ).then((devices) => {
      if (devices && !signal.aborted) {
        this.delegate.onState(
          { type: "mobile", state: "paired", devices },
          abortController
        );
      }
      if (this.pairingSuggestion === abortController) {
        this.pairingSuggestion = null;
      }
    });
  }

  private async prepareMobileSigning(
    request: SignRequest
  ): Promise<{ signingUrl: string; pairingUrl: string | null }> {
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
      log.warn(
        `Signature level ${level} is not supported by AVM, using AVM default`
      );
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
    const notificationChannel = this.notificationChannel();
    const [signingUrl, pairingUrl, hasPairedDevice] = await Promise.all([
      this.mobile.getQrCodeUrl(),
      notificationChannel ? notificationChannel.getPairingQrCodeUrl() : null,
      // a failed lookup counts as unknown: better no suggestion than a wrong one
      notificationChannel
        ? notificationChannel.getPairedDevices().then(
            (devices) => devices.length > 0,
            (e) => {
              log.warn("Listing paired devices failed", e);
              return null;
            }
          )
        : null,
    ]);
    this.pairing = notificationChannel
      ? { pairingUrl, pairingUrlIssuedAt: Date.now(), hasPairedDevice }
      : null;
    log.debug({ signingUrl, pairingUrl, hasPairedDevice });
    return { signingUrl, pairingUrl };
  }

  private async waitForMobileSignature(
    abortController: AbortController,
    doneState: () => SigningState = () => ({ type: "done" })
  ): Promise<SignedDocumentResult> {
    const signedDocument = await this.mobile.waitForSignature(abortController);
    log.debug({ signedDocument });
    if (signedDocument === null || signedDocument === undefined) {
      throw new Error("Signing cancelled");
    }

    this.delegate.onState(doneState(), abortController);
    this.mobile.reset();

    return fromAvmSignedDocument(signedDocument);
  }
}

interface PairingSession {
  pairingUrl: string | null;
  pairingUrlIssuedAt: number;
  /** `null` when the lookup failed */
  hasPairedDevice: boolean | null;
}

function abortableDelay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const onAbort = () => {
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}
