import {
  AutogramVMobileIntegrationInterfaceStateful,
  AVMDocumentToSign,
  AVMSignedDocument,
  randomUUID,
} from "autogram-sdk";

import {
  AutogramDesktopIntegrationInterface,
  DesktopAutogramDocument,
  DesktopSignatureParameters,
  DesktopSignResponseBody,
  DesktopServerInfo,
} from "autogram-sdk";
import {
  ChannelMessage,
  EVENT_MESSAGE_RESPONSE_CS_TO_INJ,
  EVENT_SEND_MESSAGE_INJ_TO_CS,
  ZChannelResponse,
  ZGetLaunchUrlResponse,
  ZGetQrCodeUrlResponse,
  ZSignResponse,
  ZWaitForSignatureResponse,
  ZWaitForStatusResponse,
} from "./common";
import { createLogger } from "../../../log";

const log = createLogger("ag-ext.channel.web");

/**
 * Class used on side of injected content script
 */
export class AutogramDesktopChannel
  implements AutogramDesktopIntegrationInterface
{
  constructor(private channel: WebChannelCaller) {}

  async getLaunchURL(command?: "listen"): Promise<string> {
    const obj = await this.channel.sendMessage({
      method: "getLaunchURL",
      args: { command },
      app: "autogram",
    });
    const response = ZGetLaunchUrlResponse.parse(obj);
    return response;
  }
  async info(): Promise<DesktopServerInfo> {
    const obj = await this.channel.sendMessage({
      method: "info",
      args: {},
      app: "autogram",
    });
    const response = ZWaitForStatusResponse.parse(obj);
    return response;
  }
  async waitForStatus(
    status: DesktopServerInfo["status"],
    timeout?: number,
    delay?: number
    // abortController?: AbortController
  ): Promise<DesktopServerInfo> {
    const obj = await this.channel.sendMessage({
      method: "waitForStatus",
      args: { status, timeout, delay },
      app: "autogram",
    });
    const response = ZWaitForStatusResponse.parse(obj);
    return response;
  }
  async sign(
    document: DesktopAutogramDocument,
    signatureParameters?: DesktopSignatureParameters,
    payloadMimeType?: string
  ): Promise<DesktopSignResponseBody> {
    const obj = await this.channel.sendMessage({
      method: "sign",
      args: { document, signatureParameters, payloadMimeType },
      app: "autogram",
    });
    const response = ZSignResponse.parse(obj);
    log.debug("sign response", obj, response);
    return response;
  }
}

/**
 * Class used on side of injected content script
 */
export class AvmChannelWeb
  implements AutogramVMobileIntegrationInterfaceStateful
{
  constructor(private channel: WebChannelCaller) {}

  async init() {}

  async loadOrRegister(): Promise<void> {
    await this.channel.sendMessage({
      method: "loadOrRegister",
      args: null,
      app: "avm",
    });
  }

  async getQrCodeUrl(): Promise<string> {
    const obj = await this.channel.sendMessage({
      method: "getQrCodeUrl",
      args: null,
      app: "avm",
    });
    const response = ZGetQrCodeUrlResponse.parse(obj);
    return response;
  }
  async addDocument(documentToSign: AVMDocumentToSign): Promise<void> {
    await this.channel.sendMessage({
      method: "addDocument",
      args: { documentToSign },
      app: "avm",
    });
  }
  async waitForSignature(
    abortController?: AbortController
  ): Promise<AVMSignedDocument> {
    /* transform abortController signal to message because abort handler can't cross execution contexts */
    const abortHandler = () => {
      this.channel.sendMessage({
        method: "abortWaitForSignature",
        args: {},
        app: "avm",
      });
    };

    abortController?.signal.addEventListener("abort", abortHandler);

    try {
      const obj = await this.channel.sendMessage({
        method: "waitForSignature",
        args: {},
        app: "avm",
      });
      log.debug("waitForSignature", obj);
      const response = ZWaitForSignatureResponse.parse(obj);
      return response;
    } finally {
      abortController?.signal.removeEventListener("abort", abortHandler);
    }
  }
  async reset(): Promise<void> {
    await this.channel.sendMessage({
      method: "reset",
      args: null,
      app: "avm",
    });
  }
}

/**
 * Class used on side of web page/injected script
 *
 * it is used to send messages between web page and content script
 *
 * injected script --(EVENT_SEND_MESSAGE_INJ_TO_CS)--> content script
 * injected script <--(EVENT_MESSAGE_RESPONSE_CS_TO_INJ)-- content script
 */
export class WebChannelCaller {
  private responsePromises = new Map<string, PromiseWithResolvers<unknown>>();

  public init() {
    window.addEventListener(
      EVENT_MESSAGE_RESPONSE_CS_TO_INJ,
      this.responseEventHandler.bind(this)
    );
  }

  public destroy() {
    window.removeEventListener(
      EVENT_MESSAGE_RESPONSE_CS_TO_INJ,
      this.responseEventHandler.bind(this)
    );
  }

  /**
   * Event handler for response messages, to recieve response messages from background script
   *
   * saves response promise  to responsePromises map
   */
  private responseEventHandler(evt: CustomEvent) {
    log.debug("responseEventHandler", this);
    log.debug("web message response ⬅️", evt.detail);

    const data = ZChannelResponse.parse(evt.detail);

    const promiseWithResolvers = this.responsePromises.get(data.id);
    log.debug("web message responsePromise", data.id, promiseWithResolvers);
    if (!promiseWithResolvers) {
      throw new Error("Promise not found");
    }

    if (data.error) {
      promiseWithResolvers.reject(data.error);
    } else {
      promiseWithResolvers.resolve(data.result);
    }
    this.responsePromises.delete(data.id);
    log.debug("web message responsePromise delete", data.id);
  }

  /**
   * Send message to background script
   *
   * injected script --(CustomEvent)--> content script --(chrome.runtime.Port)--> background script
   */
  public async sendMessage(data: Omit<ChannelMessage, "id">): Promise<unknown> {
    const id = randomUUID();
    const detail = { ...data, id };
    log.debug("Sending message ➡️", detail);
    try {
      const evt = new CustomEvent(EVENT_SEND_MESSAGE_INJ_TO_CS, {
        detail,
        bubbles: true,
        composed: true,
      });
      window.dispatchEvent(evt);
    } catch (e) {
      log.debug("WebChannelCaller.sendMessage error");
      log.error(e);
      throw e;
    }

    const withResolvers: PromiseWithResolvers<unknown> = Promise.withResolvers
      ? Promise.withResolvers<unknown>()
      : promiseWithResolversPolyfill<unknown>();

    this.responsePromises.set(id, withResolvers);
    return withResolvers.promise;
  }
}

function promiseWithResolversPolyfill<T>() {
  let resolve: (value: T) => void = () => {
      console.log("too soon");
    },
    reject: (reason?: unknown) => void = () => {
      console.log("too soon");
    };
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return { promise, resolve, reject };
}
