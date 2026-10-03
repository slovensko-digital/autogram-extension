import { html } from "lit";
import { customElement, property } from "lit/decorators.js";

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

  /** `null` when the integration does not offer pairing */
  @property({ attribute: false })
  declare pairingUrl: string | null;

  constructor() {
    super();
    this.step = Steps.showQRCode;
    this.pairingUrl = null;
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
      ${this.renderHeading("Naskenujte QR kód")}
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
            ${this.pairingUrl
              ? html`<p class="hint">
                  <a href="" @click="${this.openPairing}">
                    Chcete dostávať upozornenia do mobilu? Spárujte si tento
                    počítač.
                  </a>
                </p>`
              : html``}
          </div>
          ${this.renderQrCode(this.url, qrCode, "QR kód na podpísanie")}
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
      ${this.renderHeading("Spárujte si tento počítač")}
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
            <div class="button-wrapper start">
              <button
                class="button secondary"
                @click="${this.returnToSigningQr}"
              >
                Späť na podpisovanie
              </button>
            </div>
          </div>
          ${this.pairingUrl && qrCode
            ? this.renderQrCode(this.pairingUrl, qrCode, "Párovací QR kód")
            : html`<p>Párovací QR kód sa nepodarilo pripraviť.</p>`}
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
