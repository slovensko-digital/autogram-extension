import { inject } from "../dbridge_js/inject-ditec";
import { createLogger } from "../log";
import { captureException } from "../sentry";
import { maybeInsertUpvsJsFixes } from "../upvs-fixes";

const log = createLogger("ag-ext.ent.inject");
try {
  // throw new Error("Error Thrown on purpose to send it to Bugsink");

  type WindowWithDitec = Window & { ditec?: object };

  const windowAny = window as WindowWithDitec;

  // Listen for options from the content script
  window.addEventListener("autogram-extension-options", (event: Event) => {
    const customEvent = event as CustomEvent;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).autogramOptions = customEvent.detail;
    log.debug("Received autogram options", customEvent.detail);
  });

  maybeInsertUpvsJsFixes(windowAny);

  inject(windowAny);

  log.debug("inject", {
    windowIsTop: window.top === window,
  });

  // eslint-disable-next-line no-debugger
  // debugger;
} catch (e) {
  captureException(e);
}
