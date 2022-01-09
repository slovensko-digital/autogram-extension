import { isExtensionEnabled } from "../options/content";
import browser from "webextension-polyfill";
import { extensionId } from "../constants";

import React from "react";
import ReactDOM from "react-dom";
import { App } from "../ui/app";

console.log("content");

isExtensionEnabled().then((enabled) => {
  if (enabled) {
    console.log("Extension is enabled");
    insertInjectScript();
    insertUI();
  }
});

function insertInjectScript() {
  const url = browser.runtime.getURL("inject.bundle.js");
  console.log(url);

  const script = document.createElement("script");
  script.src = url;
  script.type = "text/javascript";

  script.onload = function () {
    console.log("script load");
  };

  function append() {
    console.log(script);
    console.log(script.src);
    document.head.appendChild(script);
  }

  websiteReady().then(append);

  if (document.readyState == "complete") {
    append();
  } else {
    window.addEventListener("load", () => {
      console.log("window event: load");
      append();
    });
  }

  const port = browser.runtime.connect(null, { name: "log" });
  document.addEventListener(extensionId, function (event: CustomEvent) {
    port.postMessage(event.detail);
  });
}

function insertUI() {
  function append() {
    console.log("adding UI");
    const uiDiv = document.createElement("div");
    uiDiv.id = "signer-switcher-extension-ui";
    document.body.appendChild(uiDiv);

    ReactDOM.render(React.createElement(App), uiDiv);
  }
  websiteReady().then(append);
}

function websiteReady(): Promise<void> {
  let resolved = false;
  return new Promise((resolve, reject) => {
    if (document.readyState == "complete") {
      resolved = true;
      resolve();
    } else {
      window.addEventListener("load", () => {
        if (!resolved) resolve();
      });
    }
  });
}
// var s = document.createElement('script');
// s.src = chrome.runtime.getURL('script.js');
// s.onload = function() {
//     this.remove();
// };
// (document.head || document.documentElement).appendChild(s);

// function getTitle() {
//   return document.title;
// }

// const tabId = getTabId();
// chrome.tabs.getCurrent().then((tabInfo) => {
//   chrome.scripting.executeScript({
//     target: { tabId: tabInfo.id },
//     function: getTitle,
//   });
// });
