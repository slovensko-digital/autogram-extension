import { html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { closeSvg } from "./svg";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { AutogramBaseScreen } from "./base.screen";
import { EventRestorePointResult } from "./events";

@customElement("autogram-restore-point-choice-screen")
export class AutogramRestorePointChoiceScreen extends AutogramBaseScreen {
  render() {
    return html`
      <div class="heading">
        <h1>Obnoviť podpis?</h1>
        <button class="close" @click="${this.close}">
          ${unsafeSVG(closeSvg)}
        </button>
      </div>
      <div class="main">
        <div class="restore-point-intro">
          <p>
            Zdá sa, že tento dokument ste už podpísali cez Autogram v Mobile.
          </p>
          <p>
            Chcete použiť už podpísaný dokument?
          </p>
        </div>
        <div class="choice-screen">
          <button class="tile" @click="${this.chooseUseRestorePoint(true)}">
            <h2>Áno, obnoviť podpis</h2>
            <div>
              Použijeme už podpísaný dokument z Autogramu v mobile.
            </div>
          </button>

          <button class="tile" @click="${this.chooseUseRestorePoint(false)}">
            <h2>Nie, začať odznova</h2>
            <div>Spustí sa podpisovanie Autogramom v mobile.</div>
          </button>
        </div>
      </div>
    `;
  }

  chooseUseRestorePoint(use: boolean) {
    return () => this.dispatchEvent(new EventRestorePointResult(use));
  }
}
