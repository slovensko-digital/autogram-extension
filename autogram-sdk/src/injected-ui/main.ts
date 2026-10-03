import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

import "./choice.screen";
import "./sign-reader.screen";
import "./sign-mobile.screen";
import "./sign-mobile-on-mobile.screen";
import "./signing-cancelled.screen";
import "./restore-point-choice.screen";
import "./error.screen";
import "./suggest-pairing.screen";
import {
  EventChoice,
  EventClose,
  EventPairingStep,
  EventRestorePointResult,
  EventRetryMobileNotification,
} from "./events";
import { SigningMethod } from "./types";
import { createLogger } from "../log";
import { UserCancelledSigningException } from "../errors";
import { isMobileDevice } from "../utils";
import type { DesktopSigningState } from "../autogram-api/index";
import type { PairedDevice } from "../avm-api/index";
import { themeTokens } from "./theme";

const log = createLogger("ag-sdk:root");

// States of the UI - ~routes
enum Screens {
  choice,
  signReader,
  signMobile,
  signingCancelled,
  signMobileOnMobile,
  useRestorePoint,
  error,
  suggestPairing,
}

@customElement("autogram-root")
export class AutogramRoot extends LitElement {
  /**
   * Styles for the component
   */
  static styles = [
    themeTokens,
    css`
      :host {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgb(17 24 39 / 0.55);
        padding: 16px;
        z-index: 999999;

        /* display: flex; */
        justify-content: center;
        align-items: center;

        flex-direction: column;

        font-family: var(--ag-font);
        font-style: normal;
      }

      .dialog {
        box-sizing: border-box;
        padding: 0;
        background: var(--ag-surface);
        color: var(--ag-text);
        border: none;
        border-radius: var(--ag-radius-lg);
        box-shadow:
          0 20px 25px -5px rgb(0 0 0 / 0.1),
          0 8px 10px -6px rgb(0 0 0 / 0.1);
        overflow: auto;

        max-width: 800px;
        max-height: min(800px, calc(100vh - 32px));
        width: 100%;
      }

      /* :host already dims the page */
      .dialog::backdrop {
        background: transparent;
      }
    `,
  ];

  @property()
  declare screen: Screens;

  @property()
  declare mobileSigningUrl: string | null;

  @property()
  declare mobilePairingUrl: string | null;

  @property({ attribute: false })
  declare pairedDevices: PairedDevice[] | null;

  @property({ attribute: false })
  declare desktopSigningState: DesktopSigningState;

  abortController: AbortController | null = null;

  errorMessage: string | null = null;

  hideTimeout: ReturnType<typeof setTimeout> | null = null;

  onRetryMobileNotification: (() => Promise<void>) | null = null;

  /** Polls for a new pairing; resolves the devices, `null` on abort/timeout. */
  onWaitForPairing:
    | ((
        signal: AbortSignal,
        onPairingUrl: (pairingUrl: string) => void
      ) => Promise<PairedDevice[] | null>)
    | null = null;

  /** the pairing poll of the QR screen's pairing step */
  private pairingWatch: AbortController | null = null;

  /**
   * Some host pages (e.g. konto.bratislava.sk) manage focus traps by setting the
   * `inert` attribute on every element outside their own modal — including
   * <autogram-root>.  An inert element ignores all pointer and keyboard events,
   * making our dialog appear but be completely unclickable regardless of z-index.
   * This observer watches for that attribute being added while our dialog is open
   * and immediately removes it so the dialog stays interactive.
   */
  private inertObserver: MutationObserver | null = null;

  choiceResult: {
    promise: Promise<SigningMethod>;
    resolve: (value: SigningMethod) => void;
    reject: (reason?: unknown) => void;
  } | null = null;

  constructor() {
    super();
    this.stopPairingWatch();
    this.screen = Screens.choice;
    this.mobileSigningUrl = null;
    this.mobilePairingUrl = null;
    this.pairedDevices = null;
    this.desktopSigningState = { type: "checkingApp" };
  }

  _closeChoiceScreen(event: EventClose) {
    log.debug("_closeScreen");
    // TODO check if this works correctly
    this.choiceResult?.reject(new UserCancelledSigningException());
    this.choiceResult = null;
  }

  _closeSigningScreen(event: EventClose) {
    log.debug("_closeSigningScreen");

    this.abortController?.abort("User closed signing screen");
    this.abortController = null;
    this.reset();
    this.hide();
  }

  _closeNow(_event: Event) {
    log.debug("_closeNow");
    this.reset();
    this.hide();
  }

  _handleChoice(event: EventChoice) {
    log.debug("_handleChoice", event.detail);
    if (this.choiceResult) {
      this.choiceResult.resolve(event.detail.method);
      this.choiceResult = null;
    }
  }

  _handleRestorePointChoice(event: EventRestorePointResult) {
    log.debug("_handleRestorePointChoice", event.detail);
    if (this.restorePointResult) {
      this.restorePointResult.resolve(event.detail);
      this.restorePointResult = null;
      this.hide();
      this.reset();
    }
  }

  async _handleRetryMobileNotification(_event: EventRetryMobileNotification) {
    log.debug("_handleRetryMobileNotification");
    if (!this.onRetryMobileNotification) {
      return;
    }

    try {
      await this.onRetryMobileNotification();
    } catch (error) {
      log.warn("Retrying mobile notification failed", error);
    }
  }

  _handlePairingStep(event: EventPairingStep) {
    log.debug("_handlePairingStep", event.detail);
    this.stopPairingWatch();
    if (!event.detail.open || !this.onWaitForPairing) {
      return;
    }

    const watch = new AbortController();
    this.pairingWatch = watch;
    this.onWaitForPairing(watch.signal, (pairingUrl) => {
      this.mobilePairingUrl = pairingUrl;
    })
      .then((devices) => {
        if (
          !devices ||
          watch.signal.aborted ||
          this.screen !== Screens.signMobile
        ) {
          return;
        }
        // the pairing step confirms it; the request goes to the phone
        this.pairedDevices = devices;
        void this._handleRetryMobileNotification(
          new EventRetryMobileNotification()
        );
      })
      .catch((error) => log.warn("Waiting for pairing failed", error))
      .finally(() => {
        if (this.pairingWatch === watch) {
          this.pairingWatch = null;
        }
      });
  }

  private stopPairingWatch() {
    this.pairingWatch?.abort();
    this.pairingWatch = null;
  }

  render() {
    log.debug("render");
    return html`
      <dialog class="dialog" aria-modal="true">
        ${this.screen === Screens.choice
          ? html`<autogram-choice-screen
              @autogram-close=${this._closeChoiceScreen}
              @autogram-choice=${this._handleChoice}
            ></autogram-choice-screen>`
          : this.screen === Screens.signReader
            ? html`<autogram-sign-reader-screen
                .state=${this.desktopSigningState}
                @autogram-close=${this._closeSigningScreen}
              ></autogram-sign-reader-screen>`
            : this.screen === Screens.signMobile
              ? html`<autogram-sign-mobile-screen
                  @autogram-close=${this._closeSigningScreen}
                  @autogram-retry-mobile-notification=${this
                    ._handleRetryMobileNotification}
                  @autogram-pairing-step=${this._handlePairingStep}
                  .url=${this.mobileSigningUrl ?? ""}
                  .pairingUrl=${this.mobilePairingUrl}
                  .pairedDevices=${this.pairedDevices}
                ></autogram-sign-mobile-screen>`
              : this.screen === Screens.signingCancelled
                ? html`<autogram-signing-cancelled-screen
                    @autogram-close=${this._closeNow}
                  ></autogram-signing-cancelled-screen>`
                : this.screen === Screens.signMobileOnMobile
                  ? html`<autogram-signing-mobile-on-mobile-screen
                      @autogram-close=${this._closeSigningScreen}
                      .url=${this.mobileSigningUrl ?? ""}
                    ></autogram-signing-mobile-on-mobile-screen>`
                  : this.screen === Screens.useRestorePoint
                    ? html`<autogram-restore-point-choice-screen
                        @autogram-close=${this._closeNow}
                        @autogram-restore-point-result=${this
                          ._handleRestorePointChoice}
                      ></autogram-restore-point-choice-screen>`
                    : this.screen === Screens.error
                      ? html`<autogram-error-screen
                          @autogram-close=${this._closeNow}
                          errorMessage=${this.errorMessage}
                        ></autogram-error-screen>`
                      : this.screen === Screens.suggestPairing
                        ? html`<autogram-suggest-pairing-screen
                            @autogram-close=${this._closeSigningScreen}
                            .pairingUrl=${this.mobilePairingUrl ?? ""}
                            .pairedDevices=${this.pairedDevices}
                          ></autogram-suggest-pairing-screen>`
                        : ""}
      </dialog>
    `;
  }

  connectedCallback(): void {
    log.debug("connectedCallback");
    super.connectedCallback();
  }

  disconnectedCallback(): void {
    log.debug("disconnectedCallback");
    super.disconnectedCallback();
  }

  public async startSigning() {
    log.debug("startSigning");
    // If we are on mobile just start signing
    if (isMobileDevice()) {
      this.screen = Screens.signMobileOnMobile;
      this.show();
      return Promise.resolve(SigningMethod.mobileOnMobile);
    }

    this.screen = Screens.choice;
    this.show();

    this.choiceResult = promiseWithResolvers<SigningMethod>();

    return this.choiceResult.promise;
  }

  private restorePointResult: PromiseWithResolvers<boolean> | null = null;

  public async maybeRestoreRestorePoint() {
    log.debug("maybeRestoreRestorePoint");

    this.restorePointResult = promiseWithResolvers<boolean>();
    this.screen = Screens.useRestorePoint;
    this.show();

    return this.restorePointResult.promise;
  }

  desktopSigning(abortController: AbortController) {
    this.screen = Screens.signReader;
    this.abortController = abortController;
    this.desktopSigningState = { type: "checkingApp" };
  }

  updateDesktopSigningState(state: DesktopSigningState) {
    this.desktopSigningState = state;
  }

  signingCancelled() {
    this.show();
    this.screen = Screens.signingCancelled;
    this.hideTimeout = setTimeout(() => {
      this.hide();
      this.reset();
    }, 10000);
  }

  /** @param pairingUrl `null` hides the pairing link */
  showQRCode(
    url: string,
    pairingUrl: string | null,
    abortController: AbortController
  ) {
    this.stopPairingWatch();
    this.screen = Screens.signMobile;
    this.mobileSigningUrl = url;
    this.mobilePairingUrl = pairingUrl;
    this.pairedDevices = null;
    this.abortController = abortController;
  }

  /**
   * Suggest pairing after a mobile signature. Called again with a fresh
   * URL before the pairing JWT expires; closing aborts `abortController`.
   */
  suggestPairing(pairingUrl: string, abortController: AbortController) {
    this.stopPairingWatch();
    const visible = this.style.display === "flex";
    if (this.screen !== Screens.suggestPairing) {
      this.pairedDevices = null;
    }
    this.screen = Screens.suggestPairing;
    this.mobilePairingUrl = pairingUrl;
    this.abortController = abortController;
    if (!visible) {
      this.show();
    }
  }

  pairingCompleted(devices: PairedDevice[]) {
    if (this.screen === Screens.suggestPairing) {
      this.pairedDevices = devices;
    }
  }

  openMobileOnMobile(url: string, abortController: AbortController) {
    this.screen = Screens.signMobileOnMobile;
    this.mobileSigningUrl = url;
    this.abortController = abortController;
  }

  showError(message: string) {
    log.debug("showError", message);
    this.screen = Screens.error;
    this.errorMessage = message;
    this.abortController = null;
  }

  show() {
    // Remove inert immediately in case it was already set before show() was called.
    this.removeAttribute("inert");
    this.style.display = "flex";
    // Start watching for the host page re-adding the inert attribute and strip it
    // straight away so our dialog remains interactive for the duration of signing.
    this.inertObserver = new MutationObserver(() => {
      this.removeAttribute("inert");
    });
    this.inertObserver.observe(this, {
      attributes: true,
      attributeFilter: ["inert"],
    });

    const dialog = this.renderRoot.querySelector("dialog");
    if (!dialog) {
      return;
    }
    dialog.addEventListener("close", () => {
      log.debug("dialog closed");
      this._closeNow(new Event("close"));
    });
    dialog.showModal();
    log.debug("focus dialog after render");
  }

  hide() {
    this.style.display = "none";
    // Stop observing once the dialog is closed — no need to fight the host page
    // over the inert attribute when we are not visible.
    if (this.inertObserver) {
      this.inertObserver.disconnect();
      this.inertObserver = null;
    }
    const dialog = this.renderRoot.querySelector("dialog");
    if (dialog && dialog.open) {
      dialog.close();
    }
  }

  reset() {
    log.debug("reset");
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    this.screen = Screens.choice;
    this.mobileSigningUrl = null;
    this.mobilePairingUrl = null;
    this.pairedDevices = null;
    this.desktopSigningState = { type: "checkingApp" };
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = null;
  }
}

function promiseWithResolvers<T>() {
  return Promise.withResolvers
    ? Promise.withResolvers<T>()
    : promiseWithResolversPolyfill<T>();
}
function promiseWithResolversPolyfill<T>() {
  let resolve: (value: T) => void = () => {
      log.debug("promiseWithResolvers called too soon");
    },
    reject: (reason?: unknown) => void = () => {
      log.debug("promiseWithResolvers called too soon");
    };
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return { promise, resolve, reject };
}
