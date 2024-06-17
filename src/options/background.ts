import browser from "webextension-polyfill";
import { defaultOptionsStorage } from "./default";

export function setDefaultOptions() {
  browser.storage.local
    .get(defaultOptionsStorage)
    .then((options) => {
      console.log('background options', options)
      browser.storage.local.set(options);
    });
}
