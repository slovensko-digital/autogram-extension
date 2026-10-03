import { html } from "lit";
import { customElement } from "lit/decorators.js";

import { AutogramBaseScreen } from "./base.screen";

@customElement("autogram-signing-cancelled-screen")
export class AutogramSigningCancelledScreen extends AutogramBaseScreen {
  render() {
    return html`
      ${this.renderHeading("Podpisovanie zrušené")}
      <div class="main">
        <p>Podpisovanie bolo zrušené.</p>
      </div>
    `;
  }
}
