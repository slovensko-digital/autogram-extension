import { html, css, type CSSResultGroup } from "lit";
import { customElement, property } from "lit/decorators.js";

import { closeSvg } from "./svg";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { AutogramBaseScreen } from "./base.screen";
import type { DesktopSigningState } from "../autogram-api/index";

const downloadSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 16L7 11L8.4 9.55L11 12.15V4H13V12.15L15.6 9.55L17 11L12 16ZM6 20C5.45 20 4.979 19.804 4.587 19.412C4.195 19.02 3.99933 18.5493 4 18V15H6V18H18V15H20V18C20 18.55 19.804 19.021 19.412 19.413C19.02 19.805 18.5493 20.0007 18 20H6Z" fill="currentColor"/>
</svg>`;

@customElement("autogram-sign-reader-screen")
export class AutogramSignReaderScreen extends AutogramBaseScreen {
  static override styles: CSSResultGroup = [
    AutogramBaseScreen.styles,
    css`
      :host {
        width: 100%;
        height: 100%;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e0e0e0;
        border-top-color: #126dff;
        border-radius: 50%;
        animation: ag-spin 0.8s linear infinite;
        margin-bottom: 20px;
        flex-shrink: 0;
      }

      @keyframes ag-spin {
        to {
          transform: rotate(360deg);
        }
      }

      .not-installed {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 20px;
        padding: 30px;
        width: 100%;
        box-sizing: border-box;
      }

      .not-installed-icon {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: #fff0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .not-installed-icon svg {
        width: 28px;
        height: 28px;
        color: #ef4444;
      }

      .not-installed h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 700;
        color: #111;
      }

      .not-installed p {
        margin: 0;
        font-size: 17px;
        line-height: 26px;
        color: #444;
        text-align: left;
      }

      .not-installed ol {
        margin: 0;
        padding-left: 22px;
        font-size: 17px;
        line-height: 28px;
        color: #444;
      }

      .not-installed ol li {
        margin-bottom: 6px;
      }

      .not-installed ol li:last-child {
        margin-bottom: 0;
      }

      .not-installed ol a {
        color: #126dff;
        text-decoration: underline;
        font-weight: 600;
      }

      .not-installed ol a:hover {
        color: #0d5ae0;
      }

      .download-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #126dff;
        color: #fff;
        text-decoration: none !important;
        border-radius: 8px;
        padding: 10px 22px;
        font-family: "Source Sans 3", sans-serif;
        font-weight: 600;
        font-size: 17px;
        line-height: 24px;
        transition: background 0.15s;
      }

      .download-btn:hover {
        background: #0d5ae0;
        color: #fff !important;
      }

      .download-btn svg {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }
    `,
  ];

  @property({ attribute: false })
  declare state: DesktopSigningState;

  constructor() {
    super();
    this.state = { type: "checkingApp" };
  }

  render() {
    let title = "Prebieha podpisovanie Autogramom";
    let content;

    switch (this.state.type) {
      case "checkingApp":
        content = html`
          <div class="spinner"></div>
          <p>Kontrolujem, či je Autogram spustený…</p>
        `;
        break;

      case "launchingApp":
        content = html`
          <div class="spinner"></div>
          <p>Spúšťam Autogram…</p>
          <p>Ak sa aplikácia nespustila automaticky, otvorte ju ručne.</p>
        `;
        break;

      case "waitingForSignature":
        content = html`
          <div class="spinner"></div>
          <p>Podpisovanie pokračuje v desktopovej aplikácii Autogram.</p>
        `;
        break;

      case "appNotInstalled":
        title = "Autogram nie je nainštalovaný";
        content = html`
          <div class="not-installed">
            <div class="not-installed-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#ef4444"/>
              </svg>
            </div>
            <div>
              <h2>Autogram nie je nainštalovaný</h2>
            </div>
            <p>
              Na podpisovanie dokumentov je potrebná desktopová aplikácia
              Autogram. Postupujte podľa nasledujúcich krokov:
            </p>
            <ol>
              <li>
                Stiahnite a nainštalujte Autogram zo stránky
                <a
                  href="https://autogram.slovensko.digital"
                  target="_blank"
                  rel="noopener noreferrer"
                  >autogram.slovensko.digital</a
                >.
              </li>
              <li>Po inštalácii spustite aplikáciu Autogram.</li>
              <li>Vráťte sa na túto stránku a skúste podpisovanie znova.</li>
            </ol>
            <a
              class="download-btn"
              href="https://autogram.slovensko.digital"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${unsafeSVG(downloadSvg)}
              Stiahnuť Autogram
            </a>
          </div>
        `;
        break;

      case "signingCancelled":
        title = "Podpisovanie bolo zrušené";
        content = html`
          <p>Zatvorili ste dialóg spustenia aplikácie Autogram.</p>
          <p>Ak chcete podpisovať, zavrite toto okno a skúste znova.</p>
        `;
        break;

      case "error":
        title = "Chyba pri podpisovaní";
        content = html`<p>${this.state.message}</p>`;
        break;

      default:
        content = html`
          <div class="spinner"></div>
          <p>Podpisovanie pokračuje v desktopovej aplikácii Autogram.</p>
        `;
    }

    return html`
      <div class="heading">
        <h1>${title}</h1>
        <button class="close" @click="${this.close}">
          ${unsafeSVG(closeSvg)}
        </button>
      </div>
      ${this.state.type === "appNotInstalled"
        ? content
        : html`<div class="main">${content}</div>`}
    `;
  }
}
