import { LitElement, html, css, type CSSResultGroup } from "lit";

import { closeSvg } from "./svg";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { EventClose } from "./events";
import { themeTokens } from "./theme";

export class AutogramBaseScreen extends LitElement {
  static styles: CSSResultGroup = [
    themeTokens,
    css`
      :host {
        display: block;
        font-family: var(--ag-font);
        color: var(--ag-text);
        -webkit-font-smoothing: antialiased;
      }

      .heading {
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
        padding: 24px 28px 20px;
        border-bottom: 1px solid var(--ag-border);
      }

      .eyebrow {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 0 0 4px;
        font-size: 13px;
        font-weight: 600;
        line-height: 20px;
        color: var(--ag-text-subtle);
      }

      .eyebrow::before {
        content: "";
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--ag-primary);
      }

      .heading h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        line-height: 32px;
        letter-spacing: -0.01em;
        color: var(--ag-text);
      }

      .close {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        margin: -4px -8px 0 0;
        padding: 0;
        border: none;
        border-radius: var(--ag-radius);
        background: none;
        color: var(--ag-text-subtle);
        cursor: pointer;
      }

      .close:hover {
        background: var(--ag-surface-hover);
        color: var(--ag-text);
      }

      .close svg {
        width: 20px;
        height: 20px;
      }

      :focus-visible {
        outline: 2px solid var(--ag-focus);
        outline-offset: 2px;
      }

      .sr-only {
        border: 0 !important;
        clip: rect(1px, 1px, 1px, 1px) !important;
        -webkit-clip-path: inset(50%) !important;
        clip-path: inset(50%) !important;
        height: 1px !important;
        margin: -1px !important;
        overflow: hidden !important;
        padding: 0 !important;
        position: absolute !important;
        width: 1px !important;
        white-space: nowrap !important;
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
        font-size: 17px;
        line-height: 28px;
        color: var(--ag-text-muted);
        margin: 0 0 16px 0;
      }

      .main strong,
      .main b {
        color: var(--ag-text);
        font-weight: 600;
      }

      .main a:not(.button) {
        color: var(--ag-link);
        font-weight: 600;
        text-decoration: underline;
        text-underline-offset: 2px;
      }

      .main a:not(.button):hover {
        color: var(--ag-link-hover);
      }

      .main p.hint {
        margin: 20px 0 0;
        padding-top: 16px;
        border-top: 1px solid var(--ag-border);
        font-size: 15px;
        line-height: 24px;
      }

      .main p.paired-notice {
        margin: 20px 0 0;
        padding: 12px 16px;
        border-radius: var(--ag-radius);
        background: var(--ag-success-soft);
        color: var(--ag-text);
        font-size: 15px;
        line-height: 24px;
      }

      .main .col > p.paired-notice:first-child {
        margin-top: 0;
      }

      .main p.after-notice {
        margin-top: 16px;
      }

      .main p.waiting {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 15px;
        line-height: 24px;
        color: var(--ag-text-subtle);
      }

      .main p.waiting::before {
        content: "";
        flex-shrink: 0;
        width: 14px;
        height: 14px;
        border: 2px solid var(--ag-border);
        border-top-color: var(--ag-primary);
        border-radius: 50%;
        animation: ag-spin 0.8s linear infinite;
      }

      @keyframes ag-spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* sits where the QR code would, centered on the text beside it */
      .success-mark {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        align-self: center;
        width: 246px;
      }

      .success-mark span {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: var(--ag-success-soft);
        color: var(--ag-success);
      }

      .success-mark svg {
        width: 64px;
        height: 64px;
      }

      @media (max-width: 768px) {
        .success-mark {
          width: auto;
          order: -1;
        }
      }

      /* numbered steps with round badges, as on the AVM site */
      .main ol {
        list-style: none;
        counter-reset: step;
        margin: 0 0 16px;
        padding: 0;
        font-size: 17px;
        line-height: 28px;
        color: var(--ag-text-muted);
      }

      .main ol li {
        counter-increment: step;
        position: relative;
        padding-left: 40px;
        margin-bottom: 12px;
      }

      .main ol li:last-child {
        margin-bottom: 0;
      }

      .main ol li::before {
        content: counter(step);
        position: absolute;
        left: 0;
        top: 1px;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: var(--ag-primary-soft);
        color: var(--ag-primary);
        font-size: 14px;
        font-weight: 700;
        line-height: 26px;
        text-align: center;
      }

      .choice-screen {
        display: flex;
        flex-direction: row;
        gap: 16px;
        padding: 28px;
        width: 100%;
        box-sizing: border-box;
      }

      .choice-screen .tile {
        flex: 1 1;
        display: flex;
        flex-direction: column;
        gap: 8px;
        box-sizing: border-box;
        align-items: flex-start;
        padding: 24px;
        background: var(--ag-surface);
        border: 1px solid var(--ag-ring);
        border-radius: 8px;
        box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
        text-align: left;
        font-family: var(--ag-font);
        font-size: 16px;
        line-height: 24px;
        color: var(--ag-text-muted);
        cursor: pointer;
        transition:
          border-color 0.15s ease,
          background-color 0.15s ease,
          box-shadow 0.15s ease;
      }

      .choice-screen .tile:hover {
        border-color: var(--ag-primary);
        background: var(--ag-primary-soft);
        box-shadow: 0 0 0 1px var(--ag-primary);
      }

      .choice-screen .tile svg {
        width: 40px;
        height: 40px;
        margin-bottom: 8px;
        color: var(--ag-primary);
      }

      .choice-screen .tile h2 {
        margin: 0;
        font-size: 19px;
        font-weight: 600;
        line-height: 28px;
        color: var(--ag-text);
      }

      .choice-screen .tile > div {
        margin: 0;
      }

      .cols {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        gap: 28px;
        padding: 28px;
        box-sizing: border-box;
        width: 100%;
      }

      .cols .col:first-child {
        flex: 1 1;
      }

      .qr {
        display: block;
        flex-shrink: 0;
        padding: 12px;
        border: 1px solid var(--ag-border);
        border-radius: var(--ag-radius-lg);
        background: #ffffff;
      }

      .qr figure {
        display: block;
        width: 220px;
        height: 220px;
        margin: 0;
      }

      .qr figure svg {
        display: block;
        width: 100%;
        height: 100%;
      }

      .centered-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
        padding: 28px;
        max-width: 600px;
        margin: 0 auto;
      }

      .centered-content p {
        text-align: center;
        margin: 0;
      }

      .button-wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        justify-content: center;
        width: 100%;
      }

      .button-wrapper.start {
        justify-content: flex-start;
      }

      .restore-point-intro {
        padding: 28px 28px 0 28px;
        width: 100%;
        box-sizing: border-box;
      }

      .restore-point-intro p {
        margin: 0 0 4px;
        text-align: left;
      }

      .button {
        box-sizing: border-box;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 18px;
        font-family: var(--ag-font);
        font-size: 16px;
        font-weight: 600;
        line-height: 24px;
        text-align: center;
        text-decoration: none !important;
        background: var(--ag-primary);
        border: none;
        border-radius: var(--ag-radius);
        box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
        color: #ffffff !important;
        cursor: pointer;
        transition: background-color 0.15s ease;
      }

      .button:hover {
        background: var(--ag-primary-hover);
      }

      .button svg {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }

      .button.secondary {
        background: var(--ag-surface);
        color: var(--ag-text) !important;
        box-shadow:
          inset 0 0 0 1px var(--ag-ring),
          0 1px 2px rgb(0 0 0 / 0.05);
      }

      .button.secondary:hover {
        background: var(--ag-surface-muted);
      }

      @media (max-width: 768px) {
        .heading {
          padding: 18px 20px 16px;
        }

        .heading h1 {
          font-size: 20px;
          line-height: 28px;
        }

        .choice-screen,
        .cols {
          flex-direction: column;
          padding: 20px;
        }

        .cols {
          align-items: center;
        }

        .restore-point-intro {
          padding: 20px 20px 0 20px;
        }

        .centered-content {
          padding: 20px;
        }
      }
    `,
  ];

  /** The dialog header: product eyebrow, screen title and close button. */
  renderHeading(title: unknown) {
    return html`
      <div class="heading">
        <div>
          <p class="eyebrow">Autogram</p>
          <h1>${title}</h1>
        </div>
        <button class="close" @click="${this.close}">
          ${unsafeSVG(closeSvg)}
          <span class="sr-only">Zavrieť</span>
        </button>
      </div>
    `;
  }

  /** A clickable QR code; `svg` is markup produced by bwip-js. */
  renderQrCode(url: string, svg: string, label: string) {
    return html`
      <a class="qr" href="${url}" target="_blank" rel="noopener">
        <figure role="img" aria-label="${label}">${unsafeSVG(svg)}</figure>
      </a>
    `;
  }

  render() {
    return html`
      ${this.renderHeading("?")}
      <div class="main">
        <div class="screen"></div>
      </div>
    `;
  }

  close() {
    this.dispatchEvent(new EventClose());
  }
}
