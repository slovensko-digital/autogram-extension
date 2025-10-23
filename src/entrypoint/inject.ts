import { inject } from "../dbridge_js/inject-ditec";
import { createLogger } from "../log";
import { captureException } from "../sentry";
import { maybeInsertUpvsJsFixes } from "../upvs-fixes";

const log = createLogger("ag-ext.ent.inject");
try {
  // throw new Error("Error Thrown on purpose to send it to Bugsink");

  type WindowWithDitec = Window & { ditec?: object };

  const windowAny = window as WindowWithDitec;

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
