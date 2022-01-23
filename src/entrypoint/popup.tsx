import browser from "webextension-polyfill";

document.getElementById("open-options").addEventListener("click", () => {
  if (browser.runtime.openOptionsPage) {
    browser.runtime.openOptionsPage();
  } else {
    window.open(browser.runtime.getURL("static/options.html"));
  }
});

document.getElementById("check").addEventListener("click", () => {
  window.open(browser.runtime.getURL("static/redirect.html"));
});
