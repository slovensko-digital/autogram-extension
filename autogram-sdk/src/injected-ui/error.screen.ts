import { html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { AutogramBaseScreen } from "./base.screen";

@customElement("autogram-error-screen")
export class AutogramErrorScreen extends AutogramBaseScreen {
  @property()
  errorMessage: string;

  render() {
    return html`
      ${this.renderHeading("Nastala chyba")}
      <div class="main">
        <p>${this.errorMessage}</p>
      </div>
    `;
  }
}
