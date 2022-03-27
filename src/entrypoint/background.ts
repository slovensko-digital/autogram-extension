import { enabledUrls } from "../constants";
import browser from "webextension-polyfill";
import { setDefaultOptions } from "../options/background";

console.log("background");
function isChrome() {
  return true;
}

if (isChrome()) {
  browser.runtime.onInstalled.addListener(() => {
    setDefaultOptions();
  });
  declarativeContentRules();
}

function declarativeContentRules() {
  const ruleOnEnabledPagesActivatePageAction = {
    conditions: [
      ...enabledUrls.map((url) => {
        return new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { urlMatches: url },
        });
      }),
    ],
    actions: [new chrome.declarativeContent.ShowPageAction()],
  };

  chrome.runtime.onInstalled.addListener(function () {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
      chrome.declarativeContent.onPageChanged.addRules([
        ruleOnEnabledPagesActivatePageAction,
      ]);
    });
  });
}