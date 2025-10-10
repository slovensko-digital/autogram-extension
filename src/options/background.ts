import browser from "webextension-polyfill";
import { defaultOptionsStorage } from "./default";
import { createLogger } from "../log";
const log = createLogger("ag-ext.options.bg");

export function setDefaultOptions() {
  browser.storage.local
    .get(defaultOptionsStorage)
    .then((options) => {
      log.debug('background options', options)
      browser.storage.local.set(options);
    });
}
