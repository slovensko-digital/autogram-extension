import { html, css, type CSSResultGroup } from "lit";
import { customElement, property } from "lit/decorators.js";

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
        width: 36px;
        height: 36px;
        border: 3px solid var(--ag-border);
        border-top-color: var(--ag-primary);
        border-radius: 50%;
        animation: ag-spin 0.8s linear infinite;
        margin-bottom: 20px;
        flex-shrink: 0;
      }

      .inline-status {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .inline-status .spinner {
        width: 20px;
        height: 20px;
        border-width: 2px;
      }

      .inline-status .spinner,
      .inline-status p {
        margin: 0;
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
        gap: 16px;
        padding: 28px;
        width: 100%;
        box-sizing: border-box;
      }

      .callout {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .callout-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--ag-danger-soft);
        color: var(--ag-danger);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .callout-icon.warning {
        background: var(--ag-warning-soft);
        color: var(--ag-warning);
      }

      .callout-icon svg {
        width: 24px;
        height: 24px;
      }

      .not-installed h2 {
        margin: 0;
        font-size: 19px;
        font-weight: 600;
        line-height: 28px;
        color: var(--ag-text);
      }

      .not-installed p,
      .not-installed ol {
        margin: 0;
        text-align: left;
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
          <div class="inline-status">
            <div class="spinner"></div>
            <p>Spúšťam Autogram…</p>
          </div>
        `;
        break;

      case "waitingForSignature":
        content = html`
          <div class="spinner"></div>
          <p>Podpisovanie pokračuje v aplikácii Autogram.</p>
        `;
        break;

      case "appMayNotBeInstalled":
        title = "Autogram sa zatiaľ nespustil";
        content = html`
          <div class="not-installed">
            <div class="inline-status">
              <div class="spinner"></div>
              <p>Spúšťam Autogram…</p>
            </div>

            <div class="callout">
              <div class="callout-icon warning">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div>
                <h2>Máte nainštalovaný Autogram?</h2>
              </div>
            </div>
            <p>
              Autogram sa po pokuse o spustenie zatiaľ neprihlásil. Možno nie je
              nainštalovaný alebo sa ešte len spúšťa.
            </p>
            <p>
              Ešte chvíľu čakáme na odpoveď aplikácie. Ak sa nespustí, zobrazíme
              ďalšie pokyny na inštaláciu.
            </p>
            <a
              class="button"
              href="https://autogram.slovensko.digital"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${unsafeSVG(downloadSvg)} Stiahnuť Autogram
            </a>
          </div>
        `;
        break;

      case "appNotInstalled":
        title = "Autogram nie je nainštalovaný";
        content = html`
          <div class="not-installed">
            <div class="callout">
              <div class="callout-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div>
                <h2>Autogram nie je nainštalovaný</h2>
              </div>
            </div>
            <p>
              Na podpisovanie dokumentov je potrebná aplikácia Autogram.
              Postupujte podľa nasledujúcich krokov:
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
              <li>Vráťte sa na túto stránku a skúste podpisovanie znova.</li>
            </ol>
            <a
              class="button"
              href="https://autogram.slovensko.digital"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${unsafeSVG(downloadSvg)} Stiahnuť Autogram
            </a>
          </div>
        `;
        break;

      case "appVersionTooLow":
        title = "Autogram je potrebné aktualizovať";
        content = html`
          <div class="not-installed">
            <div class="callout">
              <div class="callout-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div>
                <h2>Autogram je potrebné aktualizovať</h2>
              </div>
            </div>
            <p>
              Táto funkcia vyžaduje Autogram verzie
              ${this.state.requiredVersion} alebo novšej. Nainštalovaná verzia:
              ${this.state.detectedVersion}. Postupujte podľa nasledujúcich
              krokov:
            </p>
            <ol>
              <li>
                Stiahnite a nainštalujte najnovší Autogram zo stránky
                <a
                  href="https://autogram.slovensko.digital"
                  target="_blank"
                  rel="noopener noreferrer"
                  >autogram.slovensko.digital</a
                >.
              </li>
              <li>Vráťte sa na túto stránku a skúste podpisovanie znova.</li>
            </ol>
            <a
              class="button"
              href="https://autogram.slovensko.digital"
              target="_blank"
              rel="noopener noreferrer"
            >
              ${unsafeSVG(downloadSvg)} Stiahnuť Autogram
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
          <p>Podpisovanie pokračuje v aplikácii Autogram.</p>
        `;
    }

    return html`
      ${this.renderHeading(title)}
      <div class="main">${content}</div>
    `;
  }
}
