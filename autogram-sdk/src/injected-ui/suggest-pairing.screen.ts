import { html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { closeSvg } from "./svg";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { AutogramBaseScreen } from "./base.screen";
import type { PairedDevice } from "../avm-api/index";

import { toSVG as bwipToSvg } from "@bwip-js/generic";

/**
 * Shown after a successful mobile signature when the integration supports
 * notifications and no phone is paired yet.
 */
@customElement("autogram-suggest-pairing-screen")
export class AutogramSuggestPairingScreen extends AutogramBaseScreen {
  @property({ attribute: false })
  declare pairingUrl: string;

  /** set once a phone was paired while this screen was shown */
  @property({ attribute: false })
  declare pairedDevices: PairedDevice[] | null;

  constructor() {
    super();
    this.pairingUrl = "";
    this.pairedDevices = null;
  }

  render() {
    return this.pairedDevices ? this.renderPaired() : this.renderSuggestion();
  }

  renderSuggestion() {
    const qrCode = bwipToSvg({
      bcid: "qrcode",
      text: this.pairingUrl,
      scale: 6,
      width: 100,
      height: 100,
    });

    return html`
      <div class="heading">
        <h1>Dokument je podpísaný</h1>
        <button class="close" @click="${this.close}">
          ${unsafeSVG(closeSvg)}
        </button>
      </div>
      <div class="main">
        <div class="cols">
          <div class="col">
            <p>
              Nabudúce nemusíte skenovať QR kód. Spárujte si mobil s týmto
              počítačom a žiadosti o podpis vám budú chodiť priamo do aplikácie
              Autogram v mobile.
            </p>
            <ol>
              <li>V mobile otvorte Autogram v mobile.</li>
              <li>Naskenujte párovací QR kód.</li>
            </ol>
            <div class="button-wrapper" style="margin-top: 24px;">
              <button class="button" @click="${this.close}">Teraz nie</button>
            </div>
          </div>
          <div class="col">
            <a href="${this.pairingUrl}" target="_blank" rel="noopener">
              <figure
                role="img"
                aria-label="Párovací QR kód"
                style="width: 250px; height: 250px;"
              >
                ${unsafeSVG(qrCode)}
              </figure>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  renderPaired() {
    const names = (this.pairedDevices ?? [])
      .map((device) => device.displayName)
      .filter((name) => name)
      .join(", ");

    return html`
      <div class="heading">
        <h1>Mobil je spárovaný</h1>
        <button class="close" @click="${this.close}">
          ${unsafeSVG(closeSvg)}
        </button>
      </div>
      <div class="main">
        <div class="mobile-on-mobile-content">
          <p role="status">
            ${names
              ? html`Zariadenie <strong>${names}</strong> je spárované.`
              : html`Zariadenie je spárované.`}
            Žiadosti o podpis vám odteraz pošleme priamo do mobilu.
          </p>
          <div class="button-wrapper">
            <button class="button" @click="${this.close}">Zavrieť</button>
          </div>
        </div>
      </div>
    `;
  }
}
