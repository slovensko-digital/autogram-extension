import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";

import { AutogramBaseScreen } from "./base.screen";
import { checkSvg } from "./svg";
import type { PairedDevice } from "../avm-api/index";

import { toSVG as bwipToSvg } from "@bwip-js/generic";

/** Comma-separated display names, `""` when the devices have none. */
export function pairedDeviceNames(devices: PairedDevice[]): string {
  return devices
    .map((device) => device.displayName)
    .filter((name) => name)
    .join(", ");
}

/**
 * Shown after a successful mobile signature when the integration supports
 * notifications and no phone was paired yet: a success page offering
 * pairing, then the pairing QR code, then a confirmation once paired.
 */
@customElement("autogram-suggest-pairing-screen")
export class AutogramSuggestPairingScreen extends AutogramBaseScreen {
  @property({ attribute: false })
  declare pairingUrl: string;

  /** set once a phone was paired while this screen was shown */
  @property({ attribute: false })
  declare pairedDevices: PairedDevice[] | null;

  /** `success` until the user chooses to pair */
  @state()
  declare step: "success" | "pairing";

  constructor() {
    super();
    this.pairingUrl = "";
    this.pairedDevices = null;
    this.step = "success";
  }

  render() {
    if (this.pairedDevices) {
      return this.renderPaired();
    }
    return this.step === "success"
      ? this.renderSuccess()
      : this.renderPairing();
  }

  renderSuccess() {
    return html`
      ${this.renderHeading("Dokument je podpísaný")}
      <div class="main">
        <div class="cols">
          <div class="col">
            <p>Podpísaný dokument je pripravený, môžete pokračovať.</p>
            <p>
              Nabudúce nemusíte skenovať QR kód. Spárujte si mobil s týmto
              počítačom a žiadosti o podpis vám budú chodiť priamo do aplikácie
              Autogram v mobile.
            </p>
            <div class="button-wrapper start">
              <button class="button" @click="${this.startPairing}">
                Spárovať mobil
              </button>
              <button class="button secondary" @click="${this.close}">
                Teraz nie
              </button>
            </div>
          </div>
          <div class="success-mark"><span>${unsafeSVG(checkSvg)}</span></div>
        </div>
      </div>
    `;
  }

  renderPairing() {
    const qrCode = bwipToSvg({
      bcid: "qrcode",
      text: this.pairingUrl,
      scale: 6,
      width: 100,
      height: 100,
    });

    return html`
      ${this.renderHeading("Spárujte mobil")}
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
            <p class="waiting">Čakám na spárovanie…</p>
            <div class="button-wrapper start">
              <button class="button secondary" @click="${this.close}">
                Možno nabudúce
              </button>
            </div>
          </div>
          ${this.renderQrCode(this.pairingUrl, qrCode, "Párovací QR kód")}
        </div>
      </div>
    `;
  }

  renderPaired() {
    const names = pairedDeviceNames(this.pairedDevices ?? []);

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
            <button class="button" @click="${this.close}">Hotovo</button>
          </div>
        </div>
      </div>
    `;
  }

  startPairing() {
    this.step = "pairing";
  }
}
