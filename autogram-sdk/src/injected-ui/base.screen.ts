import { LitElement, html, css } from "lit";

import { closeSvg } from "./svg";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { EventClose } from "./events";

export class AutogramBaseScreen extends LitElement {
  static styles = css`
    .heading {
      /* Website/Headline 2 */
      /* 01 Header */

      box-sizing: border-box;

      /* Auto layout */
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 20px 30px;
      gap: 20px;

      /* Inside auto layout */
      flex: none;
      order: 0;
      align-self: stretch;
      flex-grow: 0;

      /* Border bottom */
      border-bottom: 1px solid #e0e0e0;
    }

    .heading > h1 {
      font-weight: 900;
      font-size: 32px;
      line-height: 40px;
      margin: 0;

      /* Neutral/Black */
      color: #000000;
    }

    @media (max-width: 768px) {
      .heading {
        padding: 15px 20px;
      }

      .heading > h1 {
        font-size: 24px;
        line-height: 32px;
      }

      .choice-screen {
        padding: 20px;
      }

      .main p {
        padding: 0 20px;
      }
    }
    .close {
      box-sizing: border-box;
      background: none;
      border: none;
      cursor: pointer;
    }

    .choice-screen {
      display: flex;
      flex-direction: row;
      gap: 30px;
      padding: 30px;
    }

    @media (max-width: 768px) {
      .choice-screen {
        flex-direction: column;
      }
    }

    .choice-screen .tile {
      flex: 1 1;
      display: flex;
      flex-direction: column;
      gap: 12px;

      box-sizing: border-box;

      align-items: flex-start;
      padding: 24px;

      /* Neutrálna paleta/Biela */
      background: #ffffff;
      /* Neutrálna paleta/N300 */
      border: 1px solid #e0e0e0;
      border-radius: 10px;

      text-align: left;

      font-family: "Source Sans 3", sans-serif;
      font-size: 19px;
      font-weight: 400;
      line-height: 28px;

      cursor: pointer;
      transition: border-color 0.2s ease;
    }

    .choice-screen .tile:hover {
      border-color: #126dff;
    }

    .choice-screen .tile svg {
      width: 48px;
      height: 48px;
      margin-bottom: 4px;
    }

    .choice-screen .tile h2 {
      /* Web - desktop/Link L bold */
      font-weight: 700;
      font-size: 24px;
      line-height: 36px;
      /* identical to box height, or 150% */
      letter-spacing: 0.5px;
      text-decoration-line: underline;

      /* Farby textov/Primárny text */
      color: #126dff;

      /* Inside auto layout */
      flex: none;
      order: 0;
      align-self: stretch;
      flex-grow: 0;
      margin: 0;
    }

    .choice-screen .tile > div {
      margin: 0;
      color: #000000;
    }

    .cols {
      display: flex;
      flex-direction: row;
      gap: 20px;
      padding: 30px;
    }

    .main {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      width: 100%;
    }

    .main p {
      font-family: "Source Sans 3", sans-serif;
      font-size: 20px;
      font-weight: 400;
      line-height: 30px;
      color: #000000;
      margin: 0 0 20px 0;
    }

    .main ol {
      font-family: "Source Sans 3", sans-serif;
      font-size: 20px;
      font-weight: 400;
      line-height: 30px;
      color: #000000;
      margin: 0;
      padding-left: 24px;
    }

    .main ol li {
      margin-bottom: 12px;
    }

    .main ol li:last-child {
      margin-bottom: 0;
    }

    .main a {
      color: #126dff;
      text-decoration: underline;
      font-weight: 600;
    }

    .main a:hover {
      color: #0d5ae0;
    }

    .mobile-on-mobile-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      padding: 30px;
      max-width: 600px;
      margin: 0 auto;
    }

    .mobile-on-mobile-content p {
      text-align: center;
      margin: 0;
    }

    .button-wrapper {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .restore-point-intro {
      padding: 30px 30px 0 30px;
      margin-bottom: 10px;
      width: 100%;
      box-sizing: border-box;
    }

    .restore-point-intro p {
      margin: 0;
      text-align: left;
    }

    @media (max-width: 768px) {
      .restore-point-intro {
        padding: 20px 20px 0 20px;
      }
    }

    .button {
      box-sizing: border-box;
      /* Website/Button */

      display: inline-block;
      padding: 10px 20px;
      gap: 10px;

      font-family: "Source Sans 3", sans-serif;
      font-style: normal;
      font-weight: 600;
      font-size: 18px;
      line-height: 24px;
      /* identical to box height, or 133% */

      text-align: center;
      text-decoration: none !important;

      /* Farby tlačidiel/Primárne tlačidlo */
      background: #126dff;
      border-radius: 8px;
      border: none;
      color: #ffffff !important;

      cursor: pointer;
    }

    .button:hover {
      background: #0d5ae0;
      color: #ffffff !important;
      text-decoration: none !important;
    }
  `;
  render() {
    return html`
      <div class="heading">
        <h1>?</h1>
        <button class="close" @click="${this.close}">
          ${unsafeSVG(closeSvg)}
        </button>
      </div>
      <div class="main">
        <div class="screen"></div>
      </div>
    `;
  }

  close() {
    this.dispatchEvent(new EventClose());
  }
}
