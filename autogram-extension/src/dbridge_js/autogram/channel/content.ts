import { createLogger } from "../../../log";
import {
  ChannelMessage,
  EVENT_MESSAGE_RESPONSE_CS_TO_INJ,
  EVENT_SEND_MESSAGE_INJ_TO_CS,
  ZChannelMessage,
  ZChannelResponse,
} from "./common";

const log = createLogger("ag-ext.channel.content");

/** How many times should we retry sending message / intializing port */
const RETRY_LIMIT = 5;

/**
 * Class used in content script used for communication between web page (injected script) and background script
 *
 * injected script --(EVENT_SEND_MESSAGE_INJ_TO_CS)--> content script
 * content script  <--(chrome.runtime.Port)--> background script
 * content script --(EVENT_MESSAGE_RESPONSE_CS_TO_INJ)--> injected script
 *
 */
export class ContentChannelPassthrough {
  portToBackground: chrome.runtime.Port | null; // We use chrome.runtime here because `import browser from "webextension-polyfill"` is not working in web (page) script
  helloInterval: number | NodeJS.Timeout | null;
  reinitNumber = 0;
  isEventListenerInitialized = false;
  private messageListener: ((message: unknown) => void) | null = null;

  constructor() {
    this.initPortToBackground();
  }

  private initPortToBackground(retryNumber = 0) {
    log.debug("initPort", new Date(), retryNumber);

    if (retryNumber > RETRY_LIMIT) {
      throw new Error("Port reinit failed");
    }

    this.reinitNumber = retryNumber;
    if (this.portToBackground) {
      log.debug("Port to Background already initialized");
      try {
        // Remove the old message listener before disconnecting
        if (this.messageListener) {
          this.portToBackground.onMessage.removeListener(this.messageListener);
        }
        this.portToBackground.disconnect();
      } catch (e) {
        log.error("Error disconnecting port", e);
      }
      this.portToBackground = null;
    }

    try {
      this.portToBackground = chrome.runtime.connect({
        name: "autogram-extension",
      });
      log.debug("Port to Background initialized", this.portToBackground);
    } catch (e) {
      log.debug("initPort error");
      log.error(e);
      throw e;
    }
    this.portToBackground.onDisconnect.addListener((p) => {
      log.debug("Port to Background Disconnected .....", {
        p,
        lastError: chrome.runtime.lastError,
      });
    });

    // Re-attach the message listener to the new port if it was already initialized
    if (this.messageListener) {
      log.debug("Re-attaching message listener to new port");
      this.portToBackground.onMessage.addListener(this.messageListener);
    }

    if (this.helloInterval) {
      clearInterval(this.helloInterval as number);
    }
    this.hello();
    // Stupid solution to keep the port alive and the worker active
    this.helloInterval = setInterval(
      () => {
        this.hello();
      },
      20 * 1000
    );
  }

  postMessageToBackground(message: ChannelMessage, retryNumber = 0) {
    log.debug("content post message ➡️", message, retryNumber);
    try {
      if (!this.portToBackground) {
        throw new Error("Port to background is not initialized");
      }
      this.portToBackground.postMessage(message);
    } catch (e) {
      if (
        e instanceof Error &&
        (e.message === "Extension context invalidated." ||
          e.message === "Attempting to use a disconnected port object")
      ) {
        if (retryNumber > RETRY_LIMIT) {
          throw new Error("Port disconnected, retry limit reached");
        }

        log.debug("Port disconnected, reinit", e);
        this.initPortToBackground(this.reinitNumber + 1);
        this.postMessageToBackground(message, retryNumber + 1);
      } else {
        log.error("Error sending message", e);
      }
    }
  }

  hello() {
    this.postMessageToBackground({
      id: "hello",
      method: "hello",
      args: null,
      app: "avm",
    });
  }

  initEventListener() {
    log.debug("initEventListener");
    if (this.isEventListenerInitialized) {
      log.warn("Event listener already initialized");
      return;
    }
    window.addEventListener(
      EVENT_SEND_MESSAGE_INJ_TO_CS,
      (evt: CustomEvent) => {
        const data = ZChannelMessage.parse(evt.detail);
        log.debug("➡️ recieved EVENT_SEND_MESSAGE_INJ_TO_CS", data);
        this.postMessageToBackground(data);
      }
    );

    this.isEventListenerInitialized = true;

    if (!this.portToBackground) {
      log.error("Port to background is not initialized");

      this.initPortToBackground();
      return;
    }

    // Store the message listener so we can re-attach it when port is reinitialized
    this.messageListener = (message) => {
      log.debug("content message ⬅️", message);
      const data = ZChannelResponse.parse(message);
      if (data.id === "log") {
        log.debug("content log from background", data.result);
        return;
      }
      log.debug("content response", data);

      let detail = data;
      if (typeof cloneInto != "undefined") {
        detail = cloneInto(data, window, {
          cloneFunctions: true,
        }) as ChannelMessage;
      }

      const evt = new CustomEvent(EVENT_MESSAGE_RESPONSE_CS_TO_INJ, {
        detail: detail,
        bubbles: true,
        composed: true,
      });
      window.dispatchEvent(evt);
    };

    this.portToBackground.onMessage.addListener(this.messageListener);
  }
}
