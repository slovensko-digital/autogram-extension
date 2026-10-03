import { html } from "lit";
import { customElement, property } from "lit/decorators.js";

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
      ${this.renderHeading("Dokument je podpísaný")}
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
            <div class="button-wrapper start">
              <button class="button secondary" @click="${this.close}">
                Teraz nie
              </button>
            </div>
          </div>
          ${this.renderQrCode(this.pairingUrl, qrCode, "Párovací QR kód")}
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
      ${this.renderHeading("Mobil je spárovaný")}
      <div class="main">
        <div class="centered-content">
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
