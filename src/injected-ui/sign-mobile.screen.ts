import { html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { closeSvg } from "./svg";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { AutogramBaseScreen } from "./base.screen";

import bwipjs from 'bwip-js';


enum Steps {
  showQRCode,
  noitifyMobile,
}
@customElement("autogram-sign-mobile-screen")
export class AutogramSignMobileScreen extends AutogramBaseScreen {
  @property()
  step = Steps.showQRCode;

  render() {
    return this.step === Steps.showQRCode ? this.renderQR() : 
    this.step === Steps.noitifyMobile ? this.renderNotifyMobile() : html``;
  }

  renderQR() {

    const qrCode = bwipjs.toSVG({
      bcid: "qrcode",       // Barcode type
      text: "https://autogram.slovensko.digital/api/v1/qr?guid=e7e95411-66a1-d401-e063-0a64dbb6b796&key=EeESAfZQh9OTf5qZhHZtgaDJpYtxZD6TIOQJzRgRFgQ%3D&integration=eyJhbGciOiJFUzI1NiJ9.eyJzdWIiOiI3OGQ5MWRlNy0xY2MyLTQwZTQtOWE3MS0zODU4YjRmMDMxOWQiLCJleHAiOjE3MTI5MDk3MjAsImp0aSI6IjAwZTAxN2Y1LTI4MTAtNDkyNS04ODRlLWNiN2FhZDAzZDFhNiIsImF1ZCI6ImRldmljZSJ9.7Op6W2BvbX2_mgj9dkz1IiolEsQ1Z2a0AzpS5bj4pcG3CJ4Z8j9W3RQE95wrAj3t6nmd9JaGZSlCJNSV_myyLQ",    // Text to encode
      scale: 6,               // 3x scaling factor
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
          <p>Dokumenty nachádzajúce sa vo vašom počítači, či v informačnom systéme môžete podpisovať aj mobilom. Potrebujete na to aplikáciu <a href="#todo">Autogram v mobile</a>.</p>
          <ol>
            <li>Naskenujte QR kód mobilom.</li>
            <li>Podpíšte dokument mobilom pomocou aplikácie Autogram v mobile.</li>
            <li>Pokračujte v práci s podpísaným dokumentom na tomto počítači.</li>
          </ol>
          </div>
          <div class="col">
            <figure style="width: 200px; height: 200px;">
            ${unsafeSVG(qrCode)}
            </figure>
          </div>
        </div>
      </div>
    `;
  }

  renderNotifyMobile() {return html`
  <div class="heading">
    <h1>Poslali sme vám upozornenie do mobilu</h1>
    <button class="close" @click="${this.close}">
      ${unsafeSVG(closeSvg)}
    </button>
  </div>
  <div class="main">
  <div class="col">
  <p>Skontrolujte si upozornenie vo vašom telefóne. Ak vám nepošle môžete si ho nechať preposlať znovu ale si overte, či máte spárovaný tento počítač s vašim telefónom.</p>
  </div>
`;
  }

}
