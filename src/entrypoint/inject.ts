import { inject } from "../dbridge_js/inject-ditec";
import { captureException } from "../sentry";
try {
  // throw new Error("Error Thrown on purpose to send it to Bugsink");

  type WindowWithDitec = Window & { ditec?: object };

  const windowAny = window as WindowWithDitec;

  inject(windowAny);

  console.log("inject");

  // eslint-disable-next-line no-debugger
  // debugger;
} catch (e) {
  captureException(e);
}
