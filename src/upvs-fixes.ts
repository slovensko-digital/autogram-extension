/***
 * Fixes for mobile UPVS (schranka.slovensko.sk, www.slovensko.sk)
 */
import { isMobileDevice } from "./util";
import { createLogger } from "./log";
import cssSchrankaSlovenskoSk from "./static/upvs-fix-schranka-sksk.css"; // maybe this way of importing doesnt work?
import cssSlovenskoSk from "./static/upvs-fix-sksk.css";

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
  log.debug("maybeInsertUpvsCssFixes");
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
    style.textContent = cssSlovenskoSk;
    theWindow.document.head.appendChild(style);
  }
  function injectCssSchranka() {
    const style = document.createElement("style");
    style.dataset.autogramExtension = "true";
    style.textContent = cssSchrankaSlovenskoSk;

    theWindow.document.head.appendChild(style);
    log.debug("injectCssSchranka");
  }
}
