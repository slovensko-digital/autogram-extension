import { z } from "zod";
import {
  AutogramVMobileIntegration,
  AvmIntegrationDocument,
  DocumentToSign,
} from "../../avm-api/lib/apiClient";
import { ZChannelMessage } from "./avm-channel";
import { get, set } from "idb-keyval";

export class AvmWorker {
  private apiClient = new AutogramVMobileIntegration({
    get,
    set,
  });
  private documents = new Map<SenderId, AvmIntegrationDocument>();
  private abortControllers = new Map<SenderId, AbortController>();

  initListener() {
    chrome.runtime.onMessage.addListener((request, sender) => {
      console.log("background message", request);
      const senderId = getSenderId(sender);
      const data = ZChannelMessage.parse(request);
      console.log("background data", data);
      const tabId = sender.tab?.id;
      if (!tabId) {
        throw new Error("Tab ID not found");
      }
      this.methods[data.method](data.args, senderId).then(
        (result) => {
          const response = {
            id: data.id,
            result: result ?? {},
          };
          console.log("background response", response);
          chrome.tabs.sendMessage(tabId, response);
        },
        (error) => {
          console.error("background error", error);
          chrome.tabs.sendMessage(tabId, { id: data.id, error });
        }
      );
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
      const doc = this.documents.get(senderId);
      if (!doc) {
        throw new Error("Document not found");
      }
      return this.apiClient.getQrCodeUrl(doc);
    },
    addDocument: async (args: unknown, senderId: SenderId): Promise<void> => {
      const { documentToSign } = ZAddDocumentArgs.parse(args);
      const document = await this.apiClient.addDocument(
        documentToSign as unknown as DocumentToSign
      );
      this.documents.set(senderId, document);
    },

    waitForSignature: async (args: unknown, senderId: SenderId) => {
      const document = this.documents.get(senderId);
      if (!document) {
        throw new Error("Document not found");
      }
      const abortController = new AbortController();
      this.abortControllers.set(senderId, abortController);
      const res = await this.apiClient.waitForSignature(document, abortController);
      console.log("res", res);
      return res
    },

    abortWaitForSignature: async (args: unknown, senderId: SenderId) => {
      const abortController = this.abortControllers.get(senderId);
      if (!abortController) {
        throw new Error("AbortController not found");
      }
      abortController.abort();
    },

    reset: async (args: unknown, senderId: SenderId) => {
      if (args !== null) {
        throw new Error("Invalid args");
      }
      this.documents.delete(senderId);
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
  payloadMimeTypeme: z.string().optional(),
});

const ZAddDocumentArgs = z.object({
  documentToSign: ZDocumentToSign,
});

type SenderId = string;

function getSenderId(sender: chrome.runtime.MessageSender): SenderId {
  return `${sender.tab?.id?.toString()}|${sender.frameId?.toString()}`;
}
