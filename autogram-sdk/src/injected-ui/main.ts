import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

import "./choice.screen";
import "./sign-reader.screen";
import "./sign-mobile.screen";
import "./sign-mobile-on-mobile.screen";
import "./signing-cancelled.screen";
import "./restore-point-choice.screen";
import "./error.screen";
import { EventChoice, EventClose, EventRestorePointResult } from "./events";
import { SigningMethod } from "./types";
import { createLogger } from "../log";
import { UserCancelledSigningException } from "../errors";
import { isMobileDevice } from "../utils";

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
}

@customElement("autogram-root")
export class AutogramRoot extends LitElement {
  /**
   * Styles for the component
   */
  static styles = css`
    :host {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #87858599;
      padding: 10px;
      z-index: 999999;

      /* display: flex; */
      justify-content: center;
      align-items: center;

      flex-direction: column;

      font-family: "Source Sans 3";
      font-style: normal;
    }

    .dialog {
      /* Neutral/White */
      background: #ffffff;
      /* Neutral/N300 */
      border: 1px solid #e0e0e0;
      border-radius: 10px 10px 10px 10px;

      max-width: 800px;
      max-height: 800px;
      margin-bottom: 100px;
      width: 100%;
    }
  `;

  @property()
  screen = Screens.choice;

  @property()
  mobileSigningUrl: string | null = null;

  abortController: AbortController | null = null;

  errorMessage: string | null = null;

  hideTimeout: ReturnType<typeof setTimeout> | null = null;

  choiceResult: {
    promise: Promise<SigningMethod>;
    resolve: (value: SigningMethod) => void;
    reject: (reason?: unknown) => void;
  } | null = null;

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

  render() {
    log.debug("render");
    return html`
      <div class="dialog">
        ${this.screen === Screens.choice
          ? html`<autogram-choice-screen
              @autogram-close=${this._closeChoiceScreen}
              @autogram-choice=${this._handleChoice}
            ></autogram-choice-screen>`
          : this.screen === Screens.signReader
          ? html`<autogram-sign-reader-screen
              @autogram-close=${this._closeSigningScreen}
            ></autogram-sign-reader-screen>`
          : this.screen === Screens.signMobile
          ? html`<autogram-sign-mobile-screen
              @autogram-close=${this._closeSigningScreen}
              url=${this.mobileSigningUrl}
            ></autogram-sign-mobile-screen>`
          : this.screen === Screens.signingCancelled
          ? html`<autogram-signing-cancelled-screen
              @autogram-close=${this._closeNow}
            ></autogram-signing-cancelled-screen>`
          : this.screen === Screens.signMobileOnMobile
          ? html`<autogram-signing-mobile-on-mobile-screen
              @autogram-close=${this._closeSigningScreen}
              url=${this.mobileSigningUrl}
            ></autogram-signing-mobile-on-mobile-screen>`
          : this.screen === Screens.useRestorePoint
          ? html`<autogram-restore-point-choice-screen
              @autogram-close=${this._closeNow}
              @autogram-restore-point-result=${this._handleRestorePointChoice}
            ></autogram-restore-point-choice-screen>`
          : this.screen === Screens.error
          ? html`<autogram-error-screen
              @autogram-close=${this._closeNow}
              errorMessage=${this.errorMessage}
            ></autogram-error-screen>`
          : ""}
      </div>
    `;
  }

  connectedCallback(): void {
    log.debug("connectedCallback");
    super.connectedCallback();
    this.addFonts();
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
  }

  signingCancelled() {
    this.show();
    this.screen = Screens.signingCancelled;
    this.hideTimeout = setTimeout(() => {
      this.hide();
      this.reset();
    }, 10000);
  }

  showQRCode(url: string, abortController: AbortController) {
    this.screen = Screens.signMobile;
    this.mobileSigningUrl = url;
    this.abortController = abortController;
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
    this.style.display = "flex";
  }

  hide() {
    this.style.display = "none";
  }

  reset() {
    log.debug("reset");
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
    this.screen = Screens.choice;
    this.mobileSigningUrl = null;
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = null;
  }

  addFonts() {
    // TODO - replace with local version?
    /*
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Anonymous+Pro:ital,wght@0,400;0,700;1,400;1,700&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet">
    */
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = "https://fonts.googleapis.com";

    const link2 = document.createElement("link");
    link2.rel = "preconnect";
    link2.href = "https://fonts.gstatic.com";
    link2.crossOrigin = "anonymous";

    const link3 = document.createElement("link");
    link3.rel = "stylesheet";
    link3.href =
      "https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap";

    document.head.appendChild(link);
    document.head.appendChild(link2);
    document.head.appendChild(link3);
  }
}

function promiseWithResolvers<T>() {
  return Promise.withResolvers
    ? Promise.withResolvers<T>()
    : promiseWithResolversPolyfill<T>();
}
function promiseWithResolversPolyfill<T>() {
  let resolve: (value: T) => void = () => {
      console.log("too soon");
    },
    reject: (reason?: unknown) => void = () => {
      console.log("too soon");
    };
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return { promise, resolve, reject };
}
