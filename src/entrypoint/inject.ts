import { inject } from "../dbridge_js/inject-ditec";
import { createLogger } from "../log";
import { captureException } from "../sentry";

const log = createLogger("ag-ext.ent.inject");
try {
  // throw new Error("Error Thrown on purpose to send it to Bugsink");

  type WindowWithDitec = Window & { ditec?: object };

  const windowAny = window as WindowWithDitec;

  inject(windowAny);
  injectCss(windowAny);

  log.debug("inject", {
    windowIsTop: window.top === window,
  });

  // eslint-disable-next-line no-debugger
  // debugger;
} catch (e) {
  captureException(e);
}

function injectCss(window: Window) {
  if (!window.location.hostname.endsWith("slovensko.sk")) return;

  const style = document.createElement("style");
  style.dataset.autogramExtension = "true";
  style.textContent = `
  
@media (max-width: 767px) {
  .parent {
      min-width: 0px !important;
  }

  .align-self-right {
      margin-left: 0px !important;
  }

  /* hide header */
  #global-header {
      display: none;
  }

  /** table **/

  /* hide table header */
  tr[id*="DXHeadersRow0"] {
      display: none;
  }

  .table td {
      display: block;
      width: 100%;
      border-bottom: none !important;
      border-top: none !important;
  }

  /* hide checkboxes in table */
  tr > td[class="td_noclik_row dxgv"] {
      display: none;
  }

  /* sidebar */
  .app-layout__pane--left {
      position: absolute;
      left: 0;
      z-index: 10;
      width: 100%;
      height: 100%;
      /*visibility: hidden;*/
  }

  aside[class="card card--underlined"] {
      display: none;
  }

  aside[class="card no-mrg-bottom"] {
      display: none;
  }

  /** upper bar toolbar **/

  div[class="bar toolbar"] > div:nth-child(1) {
      display: none;
  }

  div[class="bar toolbar"] > div > div[class*="align-items-right"] {
      justify-content: flex-start;
  }

  div[class="bar toolbar"] {
      gap: 1rem;
  }

  div.bar.toolbar {
      flex-wrap: wrap;
  }

  .btn-group--horizontal {
      flex-wrap: wrap !important;
  }

  .btn-layout--horizontal > * {
      flex: initial !important;
  }

  /* extend search menu button */
  .no-pad-horizontal {
      display: none;
  }

  /** bottom bar toolbar **/

  section.toolbar > .bar__item {
      margin-right: 0;
  }

  section.toolbar > .bar__item:has(> nav) {
      display: flex;
      justify-content: center;
      width: 100%;
      margin-bottom: 1rem;
  }

  section.toolbar > div[class*="align-self-right"] {
      margin-left: 0;
  }

  /* remove "Strana X z Y strán" */
  section.toolbar .btn-layout.paging .paging__text {
      display: none;
  }

  /* text */
  .text-ellipsis {
      word-break: break-word !important;
      white-space: normal !important;
      overflow: visible !important;
  }

  #header #loginPanel {
        display: block !important;
        width: 100%;
        padding: 10px;
        margin: 1em;
        text-align: center;
        background: unset;
        border: #453b34 solid 3px;
  }

  #search {
      display: none;
  }

  .modal--small {
      width: 90% !important;
    }
}
`;

  window.document.head.appendChild(style);
  log.debug("injectCss");
}
