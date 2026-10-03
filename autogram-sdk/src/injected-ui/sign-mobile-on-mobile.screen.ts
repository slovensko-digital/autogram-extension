import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { AutogramBaseScreen } from "./base.screen";
@customElement("autogram-signing-mobile-on-mobile-screen")
export class AutogramSigningMobileOnMobileScreen extends AutogramBaseScreen {
  @property()
  url: string;

  render() {
    return html`
      ${this.renderHeading("Autogram v mobile")}
      <div class="main">
        <div class="centered-content">
          <p>
            Ak sa aplikácia Autogram v mobile neotvorila automaticky, použite
            tlačidlo nižšie.
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
