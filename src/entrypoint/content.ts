import { getOptions } from "../options/content";
import browser from "webextension-polyfill";
import packageJson from "../../package.json";
import { ContentChannelPassthrough } from "../dbridge_js/autogram/channel/content";
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
import { createLogger } from "../log";

const log = createLogger("ag-ext.ent.content");

// log.trace("trace");
// log.debug("debug");
// log.log("log");
// log.info("info");
// log.warn("warn");
// log.error("error");

log.info("content", __BUILD_TIME__, {
  windowIsTop: window.top === window,
  windowName: window.name,
  windowLocation: window.location,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  autogramContentScriptLock: (window as any).autogramContentScriptLock,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if ((window as any).autogramContentScriptLock !== undefined) {
  throw new Error("Autogram content script already loaded");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).autogramContentScriptLock = new Date().toISOString();

window.addEventListener("load", (event) => {
  log.info("window load event", event);
});

log.debug("Checking if extension is enabled");

getOptions()
  .then((extensionOptions) => {
    const enabled = extensionOptions.extensionEnabled;
    if (enabled) {
      log.info(
        `Autogram extension ${version}(mv${__MANIFEST_VERSION__}) is enabled`
      );

      // maybeInsertUpvsCssFixes(window);

      const messagePassthrough = new ContentChannelPassthrough();
      messagePassthrough.initEventListener();
      insertInjectScript(document, extensionOptions);

      // TODO: probably this should be conditional, based on the website
      const iframe = document.getElementById(
        "workdeskIframe"
      ) as HTMLIFrameElement;
      if (iframe && iframe.contentDocument) {
        log.debug("workdeskIframe found");
        insertInjectScript(iframe.contentDocument, extensionOptions);
      } else {
        log.debug("workdeskIframe not found");
      }
    }
    // throw new Error("example");
  }, captureException)
  .catch(captureException);

function insertInjectScript(doc: Document, extensionOptions: object) {
  const site = supportedSites.matchUrl(doc.location.href);
  let injector: BaseInjector | null = null;

  for (const InjectorClass of [
    DirectInjector,
    OnDocumentLoadInjector,
    IntervalInjector,
    // MutationObserverInjector,
  ]) {
    if (site.injectionStrategy === InjectorClass.key) {
      log.debug(
        "Using injector strategy",
        site.injectionStrategy,
        InjectorClass,
        InjectorClass.key
      );
      injector = new InjectorClass(doc, extensionOptions);
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
  constructor(
    protected doc: Document,
    protected extensionOptions: object
  ) {
    this.script = this.createScript();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  inject(windowAny: WindowWithDitec) {
    throw new Error("Method not implemented.");
  }

  append() {
    log.debug("appending script", this.script);
    log.debug("appending script", this.script.src);
    this.doc.head.appendChild(this.script);
  }

  createScript() {
    const url = browser.runtime.getURL("autogram-inject.bundle.js");
    log.debug("using script url", url);

    const script = document.createElement("script");
    script.src = url;
    script.type = "text/javascript";

    const extensionOptions = this.extensionOptions;
    script.onload = function () {
      log.debug("script loaded");

      // Pass options via a custom event to avoid CSP issues with inline scripts
      const event = new CustomEvent("autogram-extension-options", {
        detail: extensionOptions,
      });
      window.dispatchEvent(event);
    };
    return script;
  }
}

class DirectInjector extends BaseInjector {
  static key = DIRECT_INJECTION;
  inject() {
    log.debug("DirectInjector");
    this.append();
  }
}

class OnDocumentLoadInjector extends BaseInjector {
  static key = ON_DOCUMENT_LOAD_INJECTION;
  inject() {
    log.debug("OnDocumentLoadInjector");
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
    log.debug("IntervalInjector");

    windowAny.addEventListener("autogram-ditec-loaded", () => {
      log.debug("autogram-ditec-loaded");
      this.append();
    });

    const detectScript = this.createDetectScript();
    log.debug(detectScript);
    this.doc.head.appendChild(detectScript);
    log.debug("detect script appended");
  }

  createDetectScript() {
    const url = browser.runtime.getURL(
      "autogram-injectIntervalDetectDitec.bundle.js"
    );
    log.debug("using script url", url);

    const script = document.createElement("script");
    script.src = url;
    script.type = "text/javascript";

    script.onload = function () {
      log.debug("detect script load");
    };
    return script;
  }
}
