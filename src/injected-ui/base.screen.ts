import { LitElement, unsafeCSS, html } from "lit";
import styleCss from "./style.css";

import { closeSvg } from "./svg";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { EVENT_CLOSE } from "./events";


export class AutogramBaseScreen extends LitElement {
  static styles = unsafeCSS(styleCss);
  render() {
    return html`
      <div class="heading">
        <h1>?</h1>
        <button class="close" @click="${this.close}">
          ${unsafeSVG(closeSvg)}
        </button>
      </div>
      <div class="main">
        <div class="screen">
        </div>
      </div>
    `;
  }

  close() {
    this.dispatchEvent(
      new CustomEvent(EVENT_CLOSE, { bubbles: true, composed: true })
    );
  }
}
