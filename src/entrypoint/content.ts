import { isExtensionEnabled } from "../options/content";
import browser from "webextension-polyfill";
import { version } from "../../package.json";

console.log("content");

isExtensionEnabled().then((enabled) => {
  if (enabled) {
    console.log(`Autogram extension ${version} is enabled`);
    insertInjectScript(document);

    // TODO: probably this should be conditional, based on the website
    const iframe = document.getElementById(
      "workdeskIframe"
    ) as HTMLIFrameElement;
    if (iframe) {
      console.log("workdeskIframe found");
      insertInjectScript(iframe.contentDocument);
    } else {
      console.log("workdeskIframe not found");
    }
  }
});

function insertInjectScript(doc: Document) {
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
    doc.head.appendChild(script);
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
