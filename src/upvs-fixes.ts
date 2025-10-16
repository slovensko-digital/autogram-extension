/***
 * Fixes for mobile UPVS (schranka.slovensko.sk, www.slovensko.sk)
 */
import { isMobileDevice } from "./util";
import { createLogger } from "./log";

const log = createLogger("ag-ext.upvs-fixes");
export function maybeInsertUpvsJsFixes(theWindow: Window) {
  if (
    theWindow.location.hostname.endsWith("schranka.slovensko.sk") &&
    isMobileDevice()
  ) {
    if (document.querySelector(".app-layout__pane--left") != null) {
      addHamburgerMenu();
    }

    removeEmptyAttachmentCells();
  }

  function addHamburgerMenu() {
    const parent = document.querySelector(".header-global");

    const div = document.createElement("div");
    div.className = "btn btn--plain no-mrg-bottom";
    div.style = "margin: 0 15px; height: 2.5rem; margin-top: 1.35rem;";
    div.onclick = () => {
      document
        .querySelector(".app-layout__pane--left")
        ?.classList.toggle("open");
    };

    const span = document.createElement("span");

    div.innerHTML = `
        <svg class="icon icon-plus" viewBox="0 0 24 24" role="img"
             xmlns="http://www.w3.org/2000/svg" style="width: 1.5em; height: 1.5em;">
          <path d="M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1Zm0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1ZM3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1Z" fill="currentColor"></path>
        </svg>
    `;

    div.appendChild(span);

    parent?.appendChild(div);
  }

  function removeEmptyAttachmentCells() {
    const cells = Array.from(
      document.querySelectorAll(
        '[id^="ctl00_ctl00_CphMasterMain_CphMain_phGvMessageList_gvMessage_tccell"][id$="_4"]'
      )
    );

    cells
      .filter((cell) => cell.textContent.trim() === "")
      .forEach((cell) => {
        if (cell instanceof HTMLElement) {
          cell.style.display = "none";
        }
      });
  }
}

export function maybeInsertUpvsCssFixes(theWindow: Window) {
  const document = theWindow ? theWindow.document : window.document;
  if (
    theWindow.location.hostname.endsWith("slovensko.sk") &&
    isMobileDevice()
  ) {
    injectCssMainPage();
  }

  if (
    theWindow.location.hostname.endsWith("schranka.slovensko.sk") &&
    isMobileDevice()
  ) {
    injectCssSchranka();
  }

  function injectCssMainPage() {
    const style = document.createElement("style");
    style.dataset.autogramExtension = "true";
    style.textContent = `
@media (max-width: 767px) {
  #header #loginPanel {
        display: block !important;
        width: 80%;
        padding: 10px;
        margin: 1em auto;
        text-align: center;
        background: unset;
        border: #453b34 solid 3px;
        float: unset !important;
  }

  #header .inner {
    height: unset !important;
  }

  #search {
      margin-top: 10px !important;
  }

  #boxBanner img {
    max-width: 100% !important;
  }
}
`;
    theWindow.document.head.appendChild(style);
  }
  function injectCssSchranka() {
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

  .display-flex {
      flex-wrap: wrap;
  }

  /* hide links in header */
  #global-header .header-proposition {
      display: none;
  }

  /** table **/

  /* hide table header */
  tr[id*="DXHeadersRow0"] {
      display: none !important;
  }

  .table td {
      display: block;
      width: 100%;
      border-bottom: none !important;
      border-top: none !important;
      border: none;
  }

  /* hide checkboxes in table */
  tr > td[class="td_noclik_row dxgv"] {
      display: none;
  }

  /* color cards */
  table[id*="DXMainTable"] tr {
      display: block;
      background: #f7f7f7;
      margin-bottom: 1rem;
  }

  .table > tbody > tr > td.dxgv:last-child {
      border-right-width: 0px !important;
  }

  tr[id*="DXDataRow"] > td:last-child {
      text-align: left !important;
  }

  .message-table__row > td {
      max-width: unset !important;
  }

  /** sidebar **/
  .app-layout__pane--left {
      position: absolute;
      left: 0;
      z-index: 10;
      width: 100%;
      height: 100%;
      visibility: hidden;
  }

  .app-layout__pane--left {
      transform: translateX(-100%);
      transition: transform 0.3s ease;
  }

  .app-layout__pane--left.open {
      transform: translateX(0);
      visibility: visible;
  }

  /* remove three-column view button */
  aside.card:last-child {
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

  /* message - remove unnecessary tools */
  div[id*="callbackPanelMessageDetail"] div[class="bar toolbar"] div:nth-child(2) {
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
      overflow: unset !important;
      text-overflow: unset !important;
      white-space: unset !important;
  }

  /* modal */

  .modal {
      width: auto !important;
  }

  .modal .carousel .js_slide {
      width: auto !important;
  }

  /* badge */
  .badge--plain {
      color: white;
      background-color: #13a02b;
  }

  /* warning box */
  .idsk-warning-text {
      padding: 1.5em;
  }

  div[class*="idsk-warning-text"] .text-space-left {
      margin-left: unset !important;
  }

  /* iframe */
  .layoutMain {
      width: auto !important;
  }

  .fieldContent {
      display: block;
      padding-right: 10px;
      width: unset !important;
  }

  #subject, #text {
      width: 100% !important;
      box-sizing: border-box !important;
  }
}
`;

    theWindow.document.head.appendChild(style);
    log.debug("injectCssSchranka");
  }
}
