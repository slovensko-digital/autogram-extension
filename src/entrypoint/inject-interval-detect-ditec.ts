import { captureException } from "../sentry";

console.log("inject-interval-detect-ditec 0");

type WindowWithDitec = Window & { ditec?: any }; // eslint-disable-line @typescript-eslint/no-explicit-any
const windowAny = window as WindowWithDitec;

function detectDitecLoaded(windowAny: WindowWithDitec): Promise<void> {
  console.log("detectDitecLoaded");
  const DITEC_INITIALIZATION_DELAY: number = 30000;
  const DITEC_CHECK_INTERVAL: number = 300;
  const DITEC_CHECK_TIMEOUT: number | null = 60000;
  function isDitecInitialized() {
    return windowAny.ditec?.dSigXadesBpJs;
  }
  if (isDitecInitialized()) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    // eslint-disable-next-line prefer-const
    let interval: NodeJS.Timeout;

    const delay = setTimeout(() => {
      clearInterval(interval);
      reject(
        new Error(
          `Ditec was not initialized within ${DITEC_INITIALIZATION_DELAY}ms timeout.`
        )
      );
    }, DITEC_INITIALIZATION_DELAY);

    const timeout =
      DITEC_CHECK_TIMEOUT === null
        ? null
        : setTimeout(() => {
            clearInterval(interval);
            reject(
              new Error(
                `Ditec was not initialized within ${DITEC_CHECK_TIMEOUT}ms timeout.`
              )
            );
          }, DITEC_CHECK_TIMEOUT + DITEC_INITIALIZATION_DELAY);

    interval = setInterval(() => {
      console.log(
        "Checking for Ditec",
        windowAny,
        windowAny.ditec,
        isDitecInitialized(),
        windowAny.ditec?.dSigXadesBpJs
      );
      // Check for `windowAny.ditec` is not enough (e.g. only config is loaded).
      if (isDitecInitialized()) {
        console.log("Ditec initialized");
        clearTimeout(delay);
        if (timeout) clearTimeout(timeout);
        clearInterval(interval);
        resolve();
      }
    }, DITEC_CHECK_INTERVAL);
  });
}

console.log("inject-interval-detect-ditec");
detectDitecLoaded(windowAny).then(() => {
  windowAny.dispatchEvent(new Event("autogram-ditec-loaded"));
}, captureException);
