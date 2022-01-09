import browser from "webextension-polyfill";

export function setDefaultOptions() {
  browser.storage.local
    .get({ options: { extensionEnabled: true } })
    .then((options) => {
      console.log('background options', options)
      browser.storage.local.set(options);
    });
}
