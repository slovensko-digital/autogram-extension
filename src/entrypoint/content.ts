import { isExtensionEnabled } from "../options/content";
import browser from "webextension-polyfill";
import packageJson from "../../package.json";
import { ContentChannelPassthrough } from "../dbridge_js/autogram/avm-channel";
import {
  supportedSites,
  ON_DOCUMENT_LOAD_INJECTION,
  DIRECT_INJECTION,
  INTERVAL_INJECTION,
  // MUTATION_OBSERVER_INJECTION,
} from "../supported-sites";

type WindowWithDitec = Window & { ditec?: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

const { version } = packageJson;

import { captureException } from "../sentry";

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
}, captureException);

function insertInjectScript(doc: Document) {
  const site = supportedSites.matchUrl(doc.location.href);
  let injector: BaseInjector | null = null;

  for (const InjectorClass of [
    DirectInjector,
    OnDocumentLoadInjector,
    IntervalInjector,
    // MutationObserverInjector,
  ]) {
    console.log(site.injectionStrategy, InjectorClass, InjectorClass.key);
    if (site.injectionStrategy === InjectorClass.key) {
      injector = new InjectorClass(doc);
      break;
    }
  }

  if (!injector) {
    throw new Error(`Unsupported injection strategy ${site.injectionStrategy}`);
  }

  injector.inject(window);
}

class BaseInjector {
  public static readonly key: string;
  protected script: HTMLScriptElement;
  constructor(protected doc: Document) {
    this.script = this.createScript();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  inject(windowAny: WindowWithDitec) {
    throw new Error("Method not implemented.");
  }

  append() {
    console.log(this.script);
    console.log(this.script.src);
    this.doc.head.appendChild(this.script);
  }

  createScript() {
    const url = browser.runtime.getURL("autogram-inject.bundle.js");
    console.log(url);

    const script = document.createElement("script");
    script.src = url;
    script.type = "text/javascript";

    script.onload = function () {
      console.log("script load");
    };
    return script;
  }
}

class DirectInjector extends BaseInjector {
  static key = DIRECT_INJECTION;
  inject() {
    this.append();
  }
}

class OnDocumentLoadInjector extends BaseInjector {
  static key = ON_DOCUMENT_LOAD_INJECTION;
  inject() {
    console.log("OnDocumentLoadInjector");
    this.websiteReady().then(this.append.bind(this), captureException);
  }

  websiteReady(): Promise<void> {
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
}

// class MutationObserverInjector extends BaseInjector {
//   static key = MUTATION_OBSERVER_INJECTION;
//   inject() {
//     console.log("MutationObserverInjector");
//     // this.websiteReady().then(this.append.bind(this), handleError);
//   }
// }

class IntervalInjector extends BaseInjector {
  static key = INTERVAL_INJECTION;

  inject(windowAny: WindowWithDitec) {
    console.log("IntervalInjector");

    windowAny.addEventListener("autogram-ditec-loaded", () => {
      console.log("autogram-ditec-loaded");
      this.append();
    });

    const detectScript = this.createDetectScript();
    console.log(detectScript);
    this.doc.head.appendChild(detectScript);
    console.log("detect script appended");
  }

  createDetectScript() {
    const url = browser.runtime.getURL(
      "autogram-injectIntervalDetectDitec.bundle.js"
    );
    console.log(url);

    const script = document.createElement("script");
    script.src = url;
    script.type = "text/javascript";

    script.onload = function () {
      console.log("detect script load");
    };
    return script;
  }
}
