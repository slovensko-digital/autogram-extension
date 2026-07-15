import { html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { closeSvg } from "./svg";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { AutogramBaseScreen } from "./base.screen";
import { EventRetryMobileNotification } from "./events";

import { toSVG as bwipToSvg } from "@bwip-js/generic";
import { createLogger } from "../log";

const log = createLogger("ag-sdk:AutogramSignMobileScreen");

enum Steps {
  showQRCode,
  showPairing,
}
@customElement("autogram-sign-mobile-screen")
export class AutogramSignMobileScreen extends AutogramBaseScreen {
  @property()
  declare step: Steps;

  @property()
  declare url: string;

  @property({ attribute: false })
  declare pairingEnabled: boolean;

  @property({ attribute: false })
  declare pairingUrl: string | null;

  constructor() {
    super();
    this.step = Steps.showQRCode;
    this.pairingUrl = null;
    this.pairingEnabled = false;
  }

  render() {
    log.debug(this.url);
    return this.step === Steps.showQRCode
      ? this.renderQR()
      : this.step === Steps.showPairing
      ? this.renderPairing()
      : html``;
  }

  renderQR() {
    const qrCode = bwipToSvg({
      bcid: "qrcode", // Barcode type
      text: this.url, // Text to encode
      scale: 6, // 3x scaling factor
      width: 100,
      height: 100,
    });

    return html`
      <div class="heading">
        <h1>Naskenujte QR kód</h1>
        <button class="close" @click="${this.close}">
          ${unsafeSVG(closeSvg)}
        </button>
      </div>
      <div class="main">
        <div class="cols">
          <div class="col">
            <p>
              Dokumenty nachádzajúce sa vo vašom počítači, či v informačnom
              systéme môžete podpisovať aj mobilom. Potrebujete na to aplikáciu
              <a
                href="https://sluzby.slovensko.digital/autogram-v-mobile/?utm_source=extension&utm_medium=web&utm_campaign=avm"
                target="_blank"
                rel="noopener"
                >Autogram v mobile</a
              >.
            </p>
            <ol>
              <li>Naskenujte QR kód mobilom.</li>
              <li>
                Podpíšte dokument mobilom pomocou aplikácie Autogram v mobile.
              </li>
              <li>
                Pokračujte v práci s podpísaným dokumentom na tomto počítači.
              </li>
            </ol>
            <p>
              ${this.pairingEnabled
                ? html`<a href="" @click="${this.openPairing}">
                    Chcete dostávať upozornenia do mobilu? Spárujte si tento počítač.
                  </a>`
                : html``}
            </p>
          </div>
          <div class="col">
            <a href="${this.url}" target="_blank" rel="noopener">
              <figure role="img" aria-label="QR kód" style="width: 250px; height: 250px;">
                ${unsafeSVG(qrCode)}
              </figure>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  renderPairing() {
    const qrCode = this.pairingUrl
      ? bwipToSvg({
          bcid: "qrcode",
          text: this.pairingUrl,
          scale: 6,
          width: 100,
          height: 100,
        })
      : null;

    return html`
      <div class="heading">
        <h1>Spárujte si tento počítač</h1>
        <button class="close" @click="${this.close}">
          ${unsafeSVG(closeSvg)}
        </button>
      </div>
      <div class="main">
        <div class="cols">
          <div class="col">
            <p>
              Ak chcete dostávať upozornenia na podpisovanie priamo do mobilu,
              naskenujte tento QR kód v aplikácii Autogram v mobile a spárujte
              si tento počítač s telefónom.
            </p>
            <ol>
              <li>V mobile otvorte Autogram v mobile.</li>
              <li>Naskenujte párovací QR kód.</li>
              <li>Po spárovaní sa vráťte späť a upozornenie pošleme znovu.</li>
            </ol>
            <div class="button-wrapper">
              <button class="button" @click="${this.returnToSigningQr}">
                Späť na podpisovanie
              </button>
            </div>
          </div>
          <div class="col">
            ${this.pairingUrl
              ? html`
                  <a href="${this.pairingUrl}" target="_blank" rel="noopener">
                    <figure
                      role="img"
                      aria-label="Párovací QR kód"
                      style="width: 250px; height: 250px;"
                    >
                      ${qrCode ? unsafeSVG(qrCode) : html``}
                    </figure>
                  </a>
                `
              : html`<p>Párovací QR kód sa nepodarilo pripraviť.</p>`}
          </div>
        </div>
      </div>
    `;
  }

  openPairing(event: Event) {
    event.preventDefault();
    this.step = Steps.showPairing;
  }

  returnToSigningQr() {
    this.step = Steps.showQRCode;
    this.dispatchEvent(new EventRetryMobileNotification());
  }
}
