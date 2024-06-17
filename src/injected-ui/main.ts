import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

import "./choice.screen";
import "./sign-reader.screen";
import "./sign-mobile.screen";
import { EVENT_CLOSE, EVENT_SCREEN } from "./events";

enum Screens {
  choice,
  signReader,
  signMobile,
}

export enum SigningMethod {
  reader,
  mobile,
}

@customElement("autogram-root")
export class AutogramRoot extends LitElement {
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
  qrCodeUrl: string | null = null;

  abortController: AbortController | null = null;

  render() {
    console.log("render");
    return html`
      <div class="dialog">
        ${this.screen === Screens.choice
          ? html`<autogram-choice-screen></autogram-choice-screen>`
          : this.screen === Screens.signReader
            ? html`<autogram-sign-reader-screen></autogram-sign-reader-screen>`
            : this.screen === Screens.signMobile
              ? html`<autogram-sign-mobile-screen
                  url=${this.qrCodeUrl}
                ></autogram-sign-mobile-screen>`
              : ""}
      </div>
    `;
  }

  closeEventHander = () => {
    console.log("EVENT_CLOSE");
    this.reset();
    this.hide();
  };

  connectedCallback(): void {
    super.connectedCallback();
    this.addFonts();

    this.shadowRoot?.addEventListener(EVENT_CLOSE, this.closeEventHander, {
      capture: true,
      passive: true,
    });

    // this.addEventListener(EVENT_SCREEN.SIGN_READER, () => {
    //   this.screen = Screens.signReader;
    //   // TODO wait for reader to finish? or close dialog and continue in background?
    // });

    // this.addEventListener(EVENT_SCREEN.SIGN_MOBILE, () => {
    //   this.screen = Screens.signMobile;
    //   // TODO wait for mobile app to add device
    // });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    // remove event listeners?
    this.shadowRoot?.removeEventListener(EVENT_CLOSE, this.closeEventHander);
  }

  async startSigning() {
    this.screen = Screens.choice;
    this.show();
    return new Promise<SigningMethod>((resolve, reject) => {
      // we have to remove these event handlers after returning so we keep them in array
      const eventHandlers = [
        {
          event: EVENT_SCREEN.SIGN_READER,
          handler: () => {
            console.log("event", EVENT_SCREEN.SIGN_READER);
            removeHandlers();
            // this.screen = Screens.signReader;
            resolve(SigningMethod.reader);
          },
        },
        {
          event: EVENT_SCREEN.SIGN_MOBILE,
          handler: () => {
            console.log("event", EVENT_SCREEN.SIGN_MOBILE);
            // this.screen = Screens.signMobile;
            removeHandlers();
            resolve(SigningMethod.mobile);
          },
        },
        {
          event: EVENT_CLOSE,
          handler: () => {
            console.log("event", EVENT_CLOSE);
            removeHandlers();
            reject(new Error("User cancelled signing"));
          },
        },
      ];
      const removeHandlers = () => {
        console.log("removeHandlers");
        eventHandlers.forEach(({ event, handler }) => {
          this.shadowRoot?.removeEventListener(event, handler);
        });
      };

      console.log("startSiginig inside promise");

      eventHandlers.forEach(({ event, handler }) => {
        this.shadowRoot?.addEventListener(event, handler);
      });
    });
  }

  desktopSigning(abortController: AbortController){
    this.screen = Screens.signReader;
    this.abortController = abortController;
  }

  showQRCode(url: string, abortController: AbortController) {
    this.screen = Screens.signMobile;
    this.qrCodeUrl = url;
    this.abortController = abortController;
  }

  show() {
    this.style.display = "flex";
  }

  hide() {
    this.style.display = "none";
  }

  reset() {
    console.log("reset");
    this.screen = Screens.choice;
    this.qrCodeUrl = null;
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
