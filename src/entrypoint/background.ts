import { BackgroundWorker } from "../dbridge_js/autogram/background-worker";
import browser from "webextension-polyfill";
import { captureException } from "../sentry";
import { createLogger } from "../log";

const log = createLogger("ag-ext.ent.bg");
try {
  log.debug("background");

  log.info(
    `Autogram extension ${__PACKAGE_VERSION__}(mv${__MANIFEST_VERSION__})`
  );

  // TODO If I move this to bottom it will not work in Safari, why?
  log.debug("Initializing BackgroundWorker");
  const worker = new BackgroundWorker();
  worker.initListener();

  // browser.runtime.sendMessage({ bgRuntimeEvent: "init" });

  browser.runtime.onStartup.addListener(() => {
    log.debug(`onStartup()`);
    // browser.runtime.sendMessage({ bgRuntimeEvent: "onStartup" });
  });

  if (chrome?.runtime?.onSuspend) {
    chrome.runtime.onSuspend.addListener(() => {
      console.log(`onSuspend()`);
      browser.runtime.sendMessage({ bgRuntimeEvent: "onSuspend" });
    });
  }
  if (chrome?.runtime?.onRestartRequired) {
    chrome.runtime.onRestartRequired.addListener(() => {
      console.log(`onRestartRequired()`);
      browser.runtime.sendMessage({ bgRuntimeEvent: "onRestartRequired" });
    });
  }

  browser.runtime.onInstalled.addListener(() => {
    log.debug(`onInstalled()`);
    // browser.runtime.sendMessage({ bgRuntimeEvent: "onInstalled" });

    // const worker = new BackgroundWorker();
    // worker.initListener();
  });

  browser.runtime.onUpdateAvailable.addListener(() => {
    log.debug(`onUpdateAvailable()`);
    // browser.runtime.sendMessage({ bgRuntimeEvent: "onUpdateAvailable" });
    // const worker = new BackgroundWorker();
    // worker.initListener();
  });

  browser.runtime.onConnect.addListener((port) => {
    log.debug(`onConnect()`, port);
    // browser.runtime.sendMessage({ bgRuntimeEvent: "onConnect" });
  });

  browser.runtime.onMessage.addListener((message) => {
    log.debug(`onMessage()`, message);
    // browser.runtime.sendMessage({ bgRuntimeEvent: "onMessage" });
  });

  browser.runtime.onStartup.addListener(() => {
    log.debug(`onStartup()`);
    // browser.runtime.sendMessage({ bgRuntimeEvent: "onStartup" });
  });
} catch (e) {
  captureException(e);
}
