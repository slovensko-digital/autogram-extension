import { html } from "lit";
import { customElement, property } from "lit/decorators.js";


import { closeSvg } from "./svg";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { AutogramBaseScreen } from "./base.screen";

@customElement("autogram-error-screen")
export class AutogramErrorScreen extends AutogramBaseScreen {
  @property()
  errorMessage: string;

  render() {
    return html`
      <div class="heading">
        <h1>Nastala chyba</h1>
        <button class="close" @click="${this.close}">
          ${unsafeSVG(closeSvg)}
        </button>
      </div>
      <div class="main">
        <p>${this.errorMessage}</p>
      </div>
    `;
  }
}
