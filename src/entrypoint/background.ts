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
  // bindPageAction();
  startLogCollector();
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

  chrome.runtime.onInstalled.addListener(function (details) {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
      chrome.declarativeContent.onPageChanged.addRules([
        ruleOnEnabledPagesActivatePageAction,
      ]);
    });
  });
}

function bindPageAction() {
  browser.pageAction.onClicked.addListener(function (tab) {
    console.log("pageAction clicked");
    // chrome.tabs.executeScript(null, {  });
  });
}

function startLogCollector() {
  const messages = [];

  browser.runtime.onConnect.addListener(function (port) {
    browser.runtime.onConnectExternal.addListener(function (extPort) {
      function handleLogMsg(msg) {
        messages.push(msg);
        port.postMessage({ content: messages });
      }

      extPort.onMessage.addListener(handleLogMsg);

      port.onDisconnect.addListener(function () {
        extPort.onMessage.removeListener(handleLogMsg);
      });
    });

    port.onMessage.addListener(function (message, port) {
      if (message.method && message.method == "getLog") {
        port.postMessage({ content: messages });
      }
    });
  });
}

// TEST THIS
// chrome.tabs.executeScript(null, { file: "inject.bundle.js" });

// chrome.webRequest.onBeforeRequest.addListener(
//   (details) => {
//     console.log(details);
//     return {
//       cancel: details.url.indexOf("/Content/jscript/DSignerMulti.js") != -1,
//     };
//   },
//   { urls: ["<all_urls>", "https://schranka.slovensko.sk/Content/jscript/DSignerMulti.js*"] },
//   ["blocking", "extraHeaders"]
// );

// UNUSED

// chrome.action.onClicked.addListener((tab) => {
//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     files: ["inject.bundle.js"],
//   });
// });

// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//   chrome.tabs.sendMessage(
//     tabs[0].id,
//     { greeting: "hello" },
//     function (response) {
//       console.log(response && response.farewell);
//     }
//   );
// });

// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   console.log(
//     sender.tab
//       ? "from a content script:" + sender.tab.url
//       : "from the extension"
//   );
//   if (request.greeting === "hello") sendResponse({ farewell: "goodbye" });
// });
