import { html } from "lit/html.js";
import { customElement } from "lit/decorators.js";
import { computerSvg, mobileSvg } from "./svg";

import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { AutogramBaseScreen } from "./base.screen";
import { closeSvg } from "./svg";
import { EventChoice } from "./events";
import { createLogger } from "../log";
import { SigningMethod } from "./types";

const log = createLogger("ag-sdk:AutogramChoiceScreen");

log.debug("AutogramChoiceScreen", customElements.get("autogram-choice-screen"));
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
            <h2>Podpísať v tomto počítači</h2>
            <div>Podpíšte občianskym preukazom v čítačke pomocou aplikácie <b>Autogram</b> vo vašom počítači.</div>
          </button>

          <button class="tile" @click="${this.signUsingMobile}">
            ${unsafeSVG(mobileSvg)}
            <h2>Podpísať v mobile</h2>
            <div>
              Podpíšte priložením občianskeho preukazu k mobilu v aplikácii <b>Autogram v mobile</b>.
            </div>
          </button>
        </div>
      </div>
    `;
  }

  signUsingReader() {
    log.debug("signUsingReader");
    this.dispatchEvent(new EventChoice(SigningMethod.reader));
  }

  signUsingMobile() {
    log.debug("signUsingMobile");
    // this.dispatchEvent(
    //   new CustomEvent(EVENT_SCREEN.SIGN_MOBILE, {
    //     bubbles: true,
    //     composed: true,
    //   })
    // );
    this.dispatchEvent(new EventChoice(SigningMethod.mobile));
  }
}
