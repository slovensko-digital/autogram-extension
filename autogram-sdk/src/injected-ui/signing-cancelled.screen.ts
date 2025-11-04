import { html } from "lit";
import { customElement } from "lit/decorators.js";

import { closeSvg } from "./svg";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { AutogramBaseScreen } from "./base.screen";

@customElement("autogram-signing-cancelled-screen")
export class AutogramSigningCancelledScreen extends AutogramBaseScreen {
  render() {
    return html`
      <div class="heading">
        <h1>Podpisovanie zrušené</h1>
        <button class="close" @click="${this.close}">
          ${unsafeSVG(closeSvg)}
        </button>
      </div>
      <div class="main">
        <p>Podpisovanie bolo zrušené.</p>
      </div>
    `;
  }
}
