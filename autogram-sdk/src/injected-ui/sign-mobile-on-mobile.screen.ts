import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { closeSvg } from "./svg";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { AutogramBaseScreen } from "./base.screen";
@customElement("autogram-signing-mobile-on-mobile-screen")
export class AutogramSigningMobileOnMobileScreen extends AutogramBaseScreen {
  @property()
  url: string;

  render() {
    return html`
      <div class="heading">
        <h1>Autogram v mobile</h1>
        <button class="close" @click="${this.close}">
          ${unsafeSVG(closeSvg)}
        </button>
      </div>
      <div class="main">
        <div class="mobile-on-mobile-content">
          <p>
            Ak sa aplikácia Autogram v mobile neotvorila automaticky, použite tlačidlo nižšie.
          </p>
          <div class="button-wrapper">
            <a href="${this.url}" target="_blank" rel="noopener" class="button"
              >Otvoriť Autogram v mobile</a
            >
          </div>
        </div>
      </div>
    `;
  }
}
