import { html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { closeSvg } from "./svg";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { AutogramBaseScreen } from "./base.screen";

import { toSVG as bwipToSvg } from "@bwip-js/generic";
import { createLogger } from "../log";

const log = createLogger("ag-sdk:AutogramSignMobileScreen");

enum Steps {
  showQRCode,
  noitifyMobile,
}
@customElement("autogram-sign-mobile-screen")
export class AutogramSignMobileScreen extends AutogramBaseScreen {
  @property()
  step = Steps.showQRCode;

  @property()
  url: string;

  render() {
    log.debug(this.url);
    return this.step === Steps.showQRCode
      ? this.renderQR()
      : this.step === Steps.noitifyMobile
      ? this.renderNotifyMobile()
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
          </div>
          <div class="col">
            <a href="${this.url}" target="_blank" rel="noopener">
              <figure style="width: 250px; height: 250px;">
                ${unsafeSVG(qrCode)}
              </figure>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  renderNotifyMobile() {
    return html`
      <div class="heading">
        <h1>Poslali sme vám upozornenie do mobilu</h1>
        <button class="close" @click="${this.close}">
          ${unsafeSVG(closeSvg)}
        </button>
      </div>
      <div class="main">
        <div class="col">
          <p>
            Skontrolujte si upozornenie vo vašom telefóne. Ak vám nepošle môžete
            si ho nechať preposlať znovu ale si overte, či máte spárovaný tento
            počítač s vašim telefónom.
          </p>
        </div>
      </div>
    `;
  }
}
