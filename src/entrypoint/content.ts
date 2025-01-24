import { isExtensionEnabled } from "../options/content";
import browser from "webextension-polyfill";
import packageJson from "../../package.json";
import { ContentChannelPassthrough } from "../dbridge_js/autogram/avm-channel";

const { version } = packageJson;

import { handleError } from "../sentry";

console.log("Sentry loaded");

console.log("content");

isExtensionEnabled().then((enabled) => {
  if (enabled) {
    console.log(`Autogram extension ${version} is enabled`);

    const messagePassthrough = new ContentChannelPassthrough();
    messagePassthrough.initEventListener();
    insertInjectScript(document);

    // TODO: probably this should be conditional, based on the website
    const iframe = document.getElementById(
      "workdeskIframe"
    ) as HTMLIFrameElement;
    if (iframe && iframe.contentDocument) {
      console.log("workdeskIframe found");
      insertInjectScript(iframe.contentDocument);
    } else {
      console.log("workdeskIframe not found");
    }
  }
}, handleError);

function insertInjectScript(doc: Document) {
  const url = browser.runtime.getURL("autogram-inject.bundle.js");
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
    doc.head.appendChild(script);
  }

  websiteReady().then(append, handleError);
}

function websiteReady(): Promise<void> {
  let resolved = false;
  return new Promise((resolve) => {
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
