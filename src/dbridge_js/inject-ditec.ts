import { ditecX } from "./ditecx/ditecx";

type OriginalDitec = { dSigXadesBpJs?: object };

const useProxy = false;
const useProxyWithOriginal = useProxy && false;

const DITEC_INITIALIZATION_TIMEOUT = 30000;
const DITEC_CHECK_INTERVAL = 10;

/**
 * Periodically checks if Ditec was initialized (or timeout was reached).
 *
 * Most of the websites load the signer synchronously, but e.g. konto.bratislava.sk loads it asynchronously, so it's
 * necessary to wait for it.
 */
function waitForDitec(windowAny: { ditec?: OriginalDitec }) {
  if (windowAny.ditec?.dSigXadesBpJs) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    // eslint-disable-next-line prefer-const
    let interval: NodeJS.Timeout;

    const timeout = setTimeout(() => {
      clearInterval(interval);
      reject(new Error(`Ditec was not initialized within ${DITEC_INITIALIZATION_TIMEOUT}ms timeout.`));
    }, DITEC_INITIALIZATION_TIMEOUT);

    interval = setInterval(() => {
      // Check for `windowAny.ditec` is not enough (e.g. only config is loaded).
      if (windowAny.ditec?.dSigXadesBpJs) {
        clearTimeout(timeout);
        clearInterval(interval);
        resolve();
      }
    }, DITEC_CHECK_INTERVAL);
  });
}

export async function inject(windowAny: { ditec?: OriginalDitec }) {
  console.log("Start inject");
  try {
    await waitForDitec(windowAny);
  } catch (e) {
    console.error(e);
    return;
  }
  console.log(windowAny.ditec)

  if (useProxy) {
    import("./proxy").then(({ wrapWithProxy }) => {
      windowAny.ditec = useProxyWithOriginal
        ? wrapWithProxy(windowAny.ditec)
        : wrapWithProxy(ditecX);
    });
  } else {
    windowAny.ditec = ditecX;
  }

  // windowAny.ditec = wrapWithProxy(ditecX);
}
