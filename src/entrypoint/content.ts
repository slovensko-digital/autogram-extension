import { isExtensionEnabled } from "../options/content";
import browser from "webextension-polyfill";

console.log("content");

isExtensionEnabled().then((enabled) => {
  if (enabled) {
    console.log("Extension is enabled");
    insertInjectScript();
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