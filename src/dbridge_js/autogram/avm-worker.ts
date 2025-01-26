import { z } from "zod";
import {
  AutogramVMobileIntegration,
  AVMIntegrationDocument,
  AVMDocumentToSign,
} from "autogram-sdk";
import { ZChannelMessage } from "./avm-channel";
import { get, set } from "idb-keyval";
import browser from "webextension-polyfill";

export class AvmWorker {
  private apiClient = new AutogramVMobileIntegration({
    get,
    set,
  });
  private documentRefs = new Map<SenderId, AVMIntegrationDocument>();
  private abortControllers = new Map<SenderId, AbortController>();

  initListener() {
    let keepAlive: number | null = null;

    browser.runtime.onConnect.addListener((port) => {
      if (keepAlive) {
        clearInterval(keepAlive);
      }
      console.log("start keepAlive");
      keepAlive = setInterval(chrome.runtime.getPlatformInfo, 25 * 1000);
      console.log("Connected .....", port);
      const handleMessage = (request) => {
        const sender = port.sender;
        if (!sender) {
          throw new Error("Sender not found");
        }
        console.log("background message", request);
        const senderId = getSenderId(sender);
        const data = ZChannelMessage.parse(request);
        console.log("background data", data);
        // just to start the worker
        if (data.method === "hello") {
          return;
        }
        this.methods[data.method](data.args, senderId).then(
          (result) => {
            const response = {
              id: data.id,
              result: result ?? null,
            };
            console.log(
              "background response",
              response,
              JSON.stringify(response),
              typeof response?.result
            );
            port.postMessage(response);
          },
          (error: Error) => {
            console.error("background error", error);
            // only serializable objects can be passed to postMessage
            port.postMessage({
              id: data.id,
              error: JSON.parse(
                JSON.stringify({
                  message: error.message,
                  name: error.name,
                  cause: error.cause,
                  error: error,
                })
              ),
            });
          }
        );
      };
      port.onDisconnect.addListener((p) => {
        console.log("Disconnected .....", {
          port,
          p,
          lastError: browser.runtime.lastError,
        });

        if (keepAlive) {
          console.log("clear keepAlive");
          clearInterval(keepAlive);
        }
        //   port.onMessage.removeListener(handleMessage);
      });
      port.onMessage.addListener(handleMessage);
    });
    //   browser.runtime.onMessage.addListener((message) => {
    //     console.log("background message", message);
    //   });
  }

  private methods: {
    [methodName: string]: (
      args: unknown,
      senderId: SenderId
    ) => Promise<unknown>;
  } = {
    loadOrRegister: async (args: unknown) => {
      if (args !== null) {
        throw new Error("Invalid args");
      }
      await this.apiClient.loadOrRegister();
    },
    getQrCodeUrl: (args: unknown, senderId: SenderId): Promise<string> => {
      if (args !== null) {
        throw new Error("Invalid args");
      }
      const doc = this.documentRefs.get(senderId);
      if (!doc) {
        throw new Error("Document not found");
      }
      return this.apiClient.getQrCodeUrl(doc);
    },
    addDocument: async (args: unknown, senderId: SenderId): Promise<void> => {
      const { documentToSign } = ZAddDocumentArgs.parse(args);
      const documentRef = await this.apiClient.addDocument(
        documentToSign as unknown as AVMDocumentToSign
      );
      this.documentRefs.set(senderId, documentRef);
    },

    waitForSignature: async (args: unknown, senderId: SenderId) => {
      const documentRef = this.documentRefs.get(senderId);
      if (!documentRef) {
        throw new Error("Document not found");
      }
      // TODO abort when tab is closed
      const abortController = new AbortController();
      this.abortControllers.set(senderId, abortController);
      const timeout = setTimeout(
        () => {
          abortController.abort("Timeout");
        },
        1000 * 60 * 60 * 2 // 2 hours
      );
      abortController.signal.addEventListener("abort", () => {
        clearTimeout(timeout);
      });
      const res = await this.apiClient.waitForSignature(
        documentRef,
        abortController
      );
      clearTimeout(timeout);
      console.log("res", res);
      return res;
    },

    abortWaitForSignature: async (args: unknown, senderId: SenderId) => {
      const abortController = this.abortControllers.get(senderId);
      if (!abortController) {
        throw new Error("AbortController not found");
      }
      abortController.abort("Aborted");
    },

    reset: async (args: unknown, senderId: SenderId) => {
      if (args !== null) {
        throw new Error("Invalid args");
      }
      this.documentRefs.delete(senderId);
    },
  };
}

const ZDocumentToSign = z.object({
  document: z.object({
    content: z.string(),
    filename: z.string().optional(),
  }),
  parameters: z
    .object({
      checkPDFACompliance: z.boolean().optional().nullable(),
      autoLoadEform: z.boolean().optional().nullable(),
      level: z.string().optional().nullable(),
      container: z.string().optional().nullable(),
      containerXmlns: z.string().optional().nullable(),
      embedUsedSchemas: z.boolean().optional().nullable(),
      identifier: z.string().optional().nullable(),
      packaging: z.string().optional().nullable(),
      digestAlgorithm: z.string().optional().nullable(),
      en319132: z.boolean().optional().nullable(),
      infoCanonicalization: z.string().optional().nullable(),
      propertiesCanonicalization: z.string().optional().nullable(),
      keyInfoCanonicalization: z.string().optional().nullable(),
      schema: z.string().optional().nullable(),
      schemaIdentifier: z.string().optional().nullable(),
      transformation: z.string().optional().nullable(),
      transformationIdentifier: z.string().optional().nullable(),
      transformationLanguage: z.string().optional().nullable(),
      transformationMediaDestinationTypeDescription: z
        .string()
        .optional()
        .nullable(),
      transformationTargetEnvironment: z.string().optional().nullable(),
    })
    .optional(),
  payloadMimeType: z.string().optional(),
});

const ZAddDocumentArgs = z.object({
  documentToSign: ZDocumentToSign,
});

type SenderId = string;

function getSenderId(sender: browser.Runtime.MessageSender): SenderId {
  return `${sender.tab?.id?.toString()}|${sender.frameId?.toString()}`;
}
