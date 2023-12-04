import { isExtensionEnabled } from "../options/content";
import browser from "webextension-polyfill";

console.log("content");
insertInjectScript();

function shouldBlockScript(src: string) {
  return /js-signer\/samples\.js/.test(src) || /\/dbridgejs-1\.0\//.test(src);
}

async function insertInjectScript() {
  // We are doing it this way because we have to be first to write ditec object
  // If we used .then() it would be executed after ditec initialization but on some sites
  // ditec.deploy() gets called right after ditec object is created
  if (!(await isExtensionEnabled())) {
    console.log("Autogram extension is disabled");
    return;
  }
  console.log("Autogram extension is enabled");

  // block dSigner scripts
  // inspired by https://medium.com/snips-ai/how-to-block-third-party-scripts-with-a-few-lines-of-javascript-f0b08b9c4c0
  const scriptBlockObserver = new MutationObserver(function (mutations) {
    mutations.forEach(({ addedNodes }) => {
      addedNodes.forEach((node) => {
        // find script tags
        if (node.nodeType === 1 && (node as any).tagName === "SCRIPT") {
          const scriptNode = node as HTMLScriptElement;
          if (shouldBlockScript(scriptNode.src)) {
            console.log("blocked script", scriptNode.src);
            scriptNode.type = "javascript/blocked";
            node.parentElement.removeChild(node);
          }
        }
      });
    });
  });
  scriptBlockObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  websiteReady().then(() => {
    scriptBlockObserver.disconnect();
  });

  // create script tag for inject entrypoint
  const url = browser.runtime.getURL("inject.bundle.js");
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
