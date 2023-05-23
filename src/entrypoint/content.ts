import { isExtensionEnabled } from "../options/content";
import browser from "webextension-polyfill";

console.log("content");
insertInjectScript();

async function insertInjectScript() {
  // We are doing it this way because we have to be first to write ditec object
  // If we used .then() it would be executed after ditec initialization but on some sites
  // ditec.deploy() gets called right after ditec object is created
  if (!(await isExtensionEnabled())) {
    console.log("Autogram extension is disabled");
    return;
  }
  console.log("Autogram extension is enabled");

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
    console.log(document.head);
    console.log(document.getElementsByTagName("head")[0]);
    document.head.appendChild(script);
  }

  headReady().then(append);

  // if (document.readyState == "complete") {
  //   append();
  // } else {
  //   window.addEventListener("load", () => {
  //     console.log("window event: load");
  //     append();
  //   });
  // }
}

/**
 * Use mutation observer to find first moment when <head> is available
 */
function headReady(): Promise<void> {
  return new Promise((resolve) => {
    if (document.head) {
      resolve();
      return;
    }

    const observer = new MutationObserver(function (mutations, observer) {
      if (document.head) {
        observer.disconnect();
        resolve();
      }
    });
    observer.observe(document.documentElement, { childList: true });
  });
}

/**
 * Resolve when website is ready
 */
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
