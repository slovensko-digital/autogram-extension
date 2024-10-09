import { isExtensionEnabled } from "../options/content";
import browser from "webextension-polyfill";
import { version } from "../../package.json";
import { ContentChannelPassthrough } from "../dbridge_js/autogram/avm-channel";
import {
  supportedSites,
  ON_DOCUMENT_LOAD_INJECTION,
  DIRECT_INJECTION,
} from "../supported-sites";

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
});

function insertInjectScript(doc: Document) {
  const site = supportedSites.matchUrl(doc.location.href);
  let injector: BaseInjector | null = null;

  for (const InjectorClass of [DirectInjector, OnDocumentLoadInjector]) {
    if (site.injectionStrategy === InjectorClass.prototype.key) {
      injector = new InjectorClass(doc);
      break;
    }
  }

  if (!injector) {
    throw new Error(`Unsupported injection strategy ${site.injectionStrategy}`);
  }

  injector.inject();
}

class BaseInjector {
  public readonly key: string;
  protected script: HTMLScriptElement;
  constructor(protected doc: Document) {
    this.script = this.createScript();
  }

  inject() {
    throw new Error("Method not implemented.");
  }

  append() {
    console.log(this.script);
    console.log(this.script.src);
    this.doc.head.appendChild(this.script);
  }

  createScript() {
    const url = browser.runtime.getURL("inject.bundle.js");
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
  key = DIRECT_INJECTION;
  inject() {
    this.append();
  }
}

class OnDocumentLoadInjector extends BaseInjector {
  key = ON_DOCUMENT_LOAD_INJECTION;
  inject() {
    console.log("OnDocumentLoadInjector");
    this.websiteReady().then(this.append);
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
