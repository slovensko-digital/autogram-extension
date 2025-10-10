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
  const style = document.createElement("style");
  style.textContent = `/* special 🤪 Autogram CSS */`;

  window.document.head.appendChild(style);
  log.debug("injectCss");
}
