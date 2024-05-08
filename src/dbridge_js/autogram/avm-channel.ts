import {
  AutogramVMobileIntegrationInterfaceStateful,
  DocumentToSign,
  GetDocumentsResponse,
  SignedDocument,
  randomUUID,
} from "../../avm-api/lib/apiClient";
import { z } from "zod";

/**
 * Class used on side of injected content script
 */
export class AvmChannelWeb
  implements AutogramVMobileIntegrationInterfaceStateful
{
  channel = new WebChannelCaller();

  async init() {
    this.channel.init();
  }

  async loadOrRegister(): Promise<void> {
    await this.channel.sendMessage({
      method: "loadOrRegister",
      args: null,
    });
  }

  async getQrCodeUrl(): Promise<string> {
    const obj = await this.channel.sendMessage({
      method: "getQrCodeUrl",
      args: null,
    });
    const response = ZGetQrCodeUrlResponse.parse(obj);
    return response;
  }
  async addDocument(documentToSign: DocumentToSign): Promise<void> {
    await this.channel.sendMessage({
      method: "addDocument",
      args: { documentToSign },
    });
  }
  async waitForSignature(
    abortController?: AbortController
  ): Promise<SignedDocument> {
    const abortHandler = () => {
      this.channel.sendMessage({
        method: "abortWaitForSignature",
        args: {},
      });
    };

    abortController?.signal.addEventListener("abort", abortHandler);

    try {
      const obj = await this.channel.sendMessage({
        method: "waitForSignature",
        args: {},
      });
      console.log("waitForSignature", obj);
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
    });
  }
}

/**
 * Class used on side of web page
 */
export class WebChannelCaller {
  private responsePromises = new Map<string, PromiseWithResolvers<unknown>>();

  public init() {
    window.addEventListener(EVENT_MESSAGE_RESPONSE, this.responseEventHandler);
  }

  public destroy() {
    window.removeEventListener(
      EVENT_MESSAGE_RESPONSE,
      this.responseEventHandler
    );
  }

  private responseEventHandler = (evt: CustomEvent) => {
    console.log("web message response", evt.detail);

    const data = ZChannelResponse.parse(evt.detail);
    console.log(
      "web message responsePromise",
      this.responsePromises.get(data.id)
    );

    const promiseWithResolvers = this.responsePromises.get(data.id);
    if (!promiseWithResolvers) {
      throw new Error("Promise not found");
    }

    if (data.error) {
      promiseWithResolvers.reject(data.error);
    } else {
      promiseWithResolvers.resolve(data.result);
    }
    this.responsePromises.delete(data.id);
  };

  public async sendMessage(data: Omit<ChannelMessage, "id">): Promise<unknown> {
    const id = randomUUID();
    const detail = { ...data, id };
    console.log(detail);
    const evt = new CustomEvent(EVENT_SEND_MESSAGE, {
      detail,
      bubbles: true,
      composed: true,
    });
    window.dispatchEvent(evt);
    const withResolvers = Promise.withResolvers<unknown>();

    this.responsePromises.set(id, withResolvers);
    return withResolvers.promise;
  }
}

/**
 * Class used in content script used for communication between web page and background script
 */
export class ContentChannelPassthrough {
  port = chrome.runtime.connect({ name: "autogram-extension" });
  initEventListener() {
    window.addEventListener(EVENT_SEND_MESSAGE, (evt: CustomEvent) => {
      const data = ZChannelMessage.parse(evt.detail);
      console.log("content send message", data);
      this.port.postMessage(data);
    });

    this.port.onMessage.addListener((message) => {
      console.log("content message", message);
      const data = ZChannelResponse.parse(message);
      console.log("content response", data);
      const evt = new CustomEvent(EVENT_MESSAGE_RESPONSE, {
        detail: data,
        bubbles: true,
        composed: true,
      });
      window.dispatchEvent(evt);
    });
  }
}

const EVENT_SEND_MESSAGE = "autogram-send-message" as const;
const EVENT_MESSAGE_RESPONSE = "autogram-message-response" as const;

export const ZChannelMessage = z.object({
  id: z.string(),
  method: z.string(),
  args: z.any().nullable(),
});
type ChannelMessage = z.infer<typeof ZChannelMessage>;

const ZChannelResponse = z.object({
  id: z.string(),
  result: z.any(),
  error: z.any(),
});

const ZGetQrCodeUrlResponse = z.string();
export type GetQrCodeUrlResponse = z.infer<typeof ZGetQrCodeUrlResponse>;

const ZWaitForSignatureResponse = GetDocumentsResponse;
export type WaitForSignatureResponse = z.infer<
  typeof ZWaitForSignatureResponse
>;
