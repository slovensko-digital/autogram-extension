import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { computerSvg, mobileSvg } from "./svg";

import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { AutogramBaseScreen } from "./base.screen";
import { closeSvg } from "./svg";
import { EVENT_SCREEN } from "./events";

@customElement("autogram-choice-screen")
export class AutogramChoiceScreen extends AutogramBaseScreen {
  render() {
    return html`
      <div class="heading">
        <h1>Ako si prajete dokument podpísať?</h1>
        <button class="close" @click="${this.close}">
          ${unsafeSVG(closeSvg)}
        </button>
      </div>
      <div class="main">
        <div class="choice-screen">
          <button class="tile" @click="${this.signUsingReader}">
            ${unsafeSVG(computerSvg)}
            <h2>Podpísať čítačkou</h2>
            <div>Podpíšte jednoducho a právne závezne cez <b>Autogram</b>.</div>
          </button>

          <button class="tile" @click="${this.signUsingMobile}">
            ${unsafeSVG(mobileSvg)}
            <h2>Podpísať mobilom</h2>
            <div>
              Dokumenty z vašho počítaču môžete podpisovať aj&nbsp;mobilom
              pomocou aplikácie <b>Autogram v&nbsp;mobile</b>.
            </div>
          </button>
        </div>
      </div>
    `;
  }

  signUsingReader() {
    this.dispatchEvent(
      new CustomEvent(EVENT_SCREEN.SIGN_READER, {
        bubbles: true,
        composed: true,
      })
    );
  }

  signUsingMobile() {
    this.dispatchEvent(
      new CustomEvent(EVENT_SCREEN.SIGN_MOBILE, {
        bubbles: true,
        composed: true,
      })
    );
  }
}
