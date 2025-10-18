import { z } from "zod";
import {
  AutogramVMobileIntegration,
  AVMDocumentToSign,
  desktopApiClient,
  DesktopSignResponseBody,
  DesktopServerInfo,
  AVMIntegrationDocument,
} from "autogram-sdk";
import { ChannelMessage, ZChannelMessage } from "./channel/common";
import { get, set } from "idb-keyval";
import browser from "webextension-polyfill";
import { createLogger } from "../../log";

const log = createLogger("ag-ext.bg.worker");

export class BackgroundWorker {
  constructor(
    private avm = new AvmExecutor(),
    private autogram = new AutogramExecutor()
  ) {}

  initListener() {
    log.debug("initListener");

    browser.runtime.onConnect.addListener(this.onConnectListener.bind(this));
    //   browser.runtime.onMessage.addListener((message) => {
    //     console.log("background message", message);
    //   });
  }

  onConnectListener(newPort: browser.Runtime.Port) {
    let port: browser.Runtime.Port | null = newPort;
    log.debug("onConnect", port);

    // TODO problem with SDK not responding to button clicks is probably somewhere here
    // how to test it - open demo site with extension, open extension options page, open background worker devtools, 
    // open extension options page devtools - show Application>Service Workers - and stop the worker
    // now when you open extension modal and click on button either QR code is not shown or desktop app is not opened
    // seems like messages are not delivered to the worker when it is started again

    // const keepAlive = new KeepAlive();

    const postMessage = (message: unknown) => {
      try {
        if (!port) {
          log.debug("Port is null in postMessage");
          return;
        }
        port.postMessage(message);
      } catch (e) {
        log.error("postMessage error", e);
      }
    };

    // const logListener = (
    //   level: string,
    //   message: string,
    //   ...args: unknown[]
    // ) => {
    //   const logMessage = {
    //     level,
    //     message,
    //     args,
    //   };
    //   postMessage({
    //     id: "log",
    //     result: logMessage,
    //   });
    // };
    // this creates a loop
    // log.addListener(logListener);

    // keepAlive.start();
    log.debug("Connected .....", port);
    const handleMessage = (request) => {
      if (!port) {
        log.error("Port is null in handleMessage");
        return;
      }
      const sender = port.sender;
      if (!sender) {
        throw new Error("Sender not found");
      }
      // log.debug("background message", request);
      const senderId = getSenderId(sender);
      const data = ZChannelMessage.parse(request);
      log.debug("background data", data);
      // just to start the worker
      // if (data.method === "hello") {
      //   return;
      // }

      const app = data.app === "avm" ? this.avm : this.autogram;

      app.run(data, senderId).then(
        (result) => {
          const response = {
            id: data.id,
            result: result ?? null,
          };
          log.debug(
            "background response",
            response,
            JSON.stringify(response),
            typeof response?.result
          );
          postMessage(response);
        },
        (error: Error) => {
          log.error("background error", error);
          // only serializable objects can be passed to postMessage
          postMessage({
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
      log.debug("Disconnected .....", {
        port,
        p,
        lastError: browser.runtime.lastError,
      });
      // log.removeListener(logListener);

      // keepAlive.stop();

      if (!port) {
        log.error("Port is null in onDisconnect");
        return;
      }
      port.onMessage.removeListener(handleMessage);
      port = null;
    });

    port.onMessage.addListener(handleMessage);
  }
}

class AvmExecutor {
  private apiClient = new AutogramVMobileIntegration({
    get,
    set,
  });
  // TODO: store this somewhere, so we can use it after worker is resumed??
  private abortControllers = new Map<SenderId, AbortController>();

  public async run(data: ChannelMessage, senderId: SenderId) {
    return this.methods[data.method](data.args, senderId);
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
    getQrCodeUrl: async (
      args: unknown,
      senderId: SenderId
    ): Promise<string> => {
      if (args !== null) {
        throw new Error("Invalid args");
      }
      const doc = await get(dbKeyDocumentRef(senderId));
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
      await set(dbKeyDocumentRef(senderId), documentRef);
    },

    waitForSignature: async (args: unknown, senderId: SenderId) => {
      const documentRef = await get(dbKeyDocumentRef(senderId));
      if (!documentRef) {
        throw new Error("Document not found");
      }
      // TODO abort when tab is closed
      const abortController = new AbortController();
      this.abortControllers.set(senderId, abortController);

      // TODO: use alarms to abort when tab is closed
      const alarmName = "autogram-signature-timeout-" + senderId;
      browser.alarms.create(alarmName, {
        delayInMinutes: 120,
      });
      browser.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === alarmName) {
          log.debug("Alarm triggered", alarm);
          abortController.abort("Timeout");
          browser.alarms.clear(alarmName);
        }
      });

      // const timeout = setTimeout(
      //   () => {
      //     abortController.abort("Timeout");
      //   },
      //   1000 * 60 * 60 * 2 // 2 hours
      // );
      abortController.signal.addEventListener("abort", () => {
        // clearTimeout(timeout);
        browser.alarms.clear(alarmName);
      });
      const res = await this.apiClient.waitForSignature(
        documentRef,
        abortController
      );
      // clearTimeout(timeout);
      browser.alarms.clear(alarmName);
      log.debug("res", res);
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
      await set(dbKeyDocumentRef(senderId), undefined);
      // TODO: should we abort the request when resetting?
      this.abortControllers.delete(senderId);
      browser.alarms.clear("autogram-signature-timeout-" + senderId);
    },

    useRestorePoint: async (
      args: unknown,
      senderId: SenderId
    ): Promise<boolean> => {
      const { restorePoint } = ZUseRestorePointArgs.parse(args);
      const dbKeyRestorePoint = `autogram:avm:restorePoint:${restorePoint}`;

      // Try to load the saved document reference
      const savedDocumentRef = await get<AVMIntegrationDocument>(dbKeyRestorePoint);

      const documentRef = await get(dbKeyDocumentRef(senderId));
      if (!savedDocumentRef) {
        // No restore point found, save current state if we have a document
        if (documentRef) {
          await set(dbKeyRestorePoint, documentRef);
          log.info("Created new restore point", restorePoint);
        }
        return false;
      }

      // Restore point found, check if document is already signed
      try {
        if (!savedDocumentRef.guid || !savedDocumentRef.encryptionKey) {
          log.debug("Invalid saved document reference", savedDocumentRef);
          return false;
        }

        // Check document status without polling
        const documentResult =
          await this.apiClient.checkDocumentStatus(savedDocumentRef);

        if (documentResult.status === "signed") {
          // Document is signed, restore state and return true
          await set(dbKeyDocumentRef(senderId), savedDocumentRef);
          log.info(
            "Restore point used - document already signed",
            restorePoint
          );
          // Clean up restore point
          await set(dbKeyRestorePoint, undefined);
          return true;
        } else {
          // TODO: does this make sense?
          // Document not signed yet, restore state for continued signing
          await set(dbKeyDocumentRef(senderId), savedDocumentRef);
          log.info("Restore point used - document pending", restorePoint);
          return false;
        }
      } catch (error) {
        log.error("Error checking restore point", error);
        return false;
      }
    },
  };
}

class AutogramExecutor {
  private client: ReturnType<typeof desktopApiClient>;
  constructor() {
    const serverProtocol: "http" | "https" = "http";
    const serverHost = "localhost";

    this.client = desktopApiClient({
      serverProtocol,
      serverHost,
      disableSecurity: true,
      requestsOrigin: "*",
    });
  }

  // private documentRefs = new Map<SenderId, AVMIntegrationDocument>();
  private abortControllers = new Map<SenderId, AbortController>();

  public async run(data: ChannelMessage, senderId: SenderId) {
    return this.methods[data.method](data.args, senderId);
  }

  private methods: {
    [methodName: string]: (
      args: unknown,
      senderId: SenderId
    ) => Promise<unknown>;
  } = {
    getLaunchURL: async (args: unknown): Promise<string> => {
      const { command } = z
        .object({ command: z.literal("listen").optional() })
        .parse(args);

      return this.client.getLaunchURL(command);
    },

    info: async (): Promise<DesktopServerInfo> => {
      return this.client.info();
    },
    waitForStatus: async (
      args: unknown,
      senderId: SenderId
    ): Promise<DesktopServerInfo> => {
      const { status, timeout, delay } = z
        .object({
          status: z.literal("READY").optional(),
          timeout: z.number().optional(),
          delay: z.number().optional(),
        })
        .parse(args);
      const abortController = new AbortController();
      this.abortControllers.set(senderId, abortController);
      return this.client.waitForStatus(status, timeout, delay, abortController);
    },
    sign: async (args: unknown): Promise<DesktopSignResponseBody> => {
      const {
        document: documentToSign,
        signatureParameters,
        payloadMimeType,
      } = z
        .object({
          document: ZAutogramDocument,
          signatureParameters: ZSignatureParameters,
          payloadMimeType: z.string().optional(),
        })
        .parse(args);

      return this.client.sign(
        documentToSign,
        signatureParameters,
        payloadMimeType
      );
    },
  };
}

/**
 * AVM document
 */
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

const ZUseRestorePointArgs = z.object({
  restorePoint: z.string(),
});

/**
 * Desktop Autogram Document
 */
const ZAutogramDocument = z.object({
  content: z.string(),
  filename: z.string().optional(),
});

/**
 * Desktop Autogram Signature Params
 */
const ZSignatureParameters = z.object({
  checkPDFACompliance: z.boolean().optional(),
  autoLoadEform: z.boolean().optional(),
  level: z.enum(["XAdES_BASELINE_B", "PAdES_BASELINE_B", "CAdES_BASELINE_B"]),
  container: z.enum(["ASiC_E"]).optional(),
  containerXmlns: z
    .enum(["http://data.gov.sk/def/container/xmldatacontainer+xml/1.1"])
    .optional(),
  embedUsedSchemas: z.boolean().optional(),
  identifier: z.string().optional(),
  packaging: z.enum(["ENVELOPED", "ENVELOPING"]).optional(),
  digestAlgorithm: z.enum(["SHA256", "SHA384", "SHA512"]).optional(),
  en319132: z.boolean().optional(),
  infoCanonicalization: z
    .enum([
      "INCLUSIVE",
      "EXCLUSIVE",
      "INCLUSIVE_WITH_COMMENTS",
      "EXCLUSIVE_WITH_COMMENTS",
      "INCLUSIVE_11",
      "INCLUSIVE_11_WITH_COMMENTS",
    ])
    .optional(),
  propertiesCanonicalization: z
    .enum([
      "INCLUSIVE",
      "EXCLUSIVE",
      "INCLUSIVE_WITH_COMMENTS",
      "EXCLUSIVE_WITH_COMMENTS",
      "INCLUSIVE_11",
      "INCLUSIVE_11_WITH_COMMENTS",
    ])
    .optional(),
  keyInfoCanonicalization: z
    .enum([
      "INCLUSIVE",
      "EXCLUSIVE",
      "INCLUSIVE_WITH_COMMENTS",
      "EXCLUSIVE_WITH_COMMENTS",
      "INCLUSIVE_11",
      "INCLUSIVE_11_WITH_COMMENTS",
    ])
    .optional(),
  schema: z.string().optional(),
  schemaIdentifier: z.string().optional(),
  transformation: z.string().optional(),
  transformationIdentifier: z.string().optional(),
  transformationLanguage: z.string().optional(),
  transformationMediaDestinationTypeDescription: z
    .enum(["XHTML", "HTML", "TXT"])
    .optional(),
  transformationTargetEnvironment: z.string().optional(),
  visualizationWidth: z.enum(["sm", "md", "lg", "xl", "xxl"]).optional(),
});

type SenderId = string;

function getSenderId(sender: browser.Runtime.MessageSender): SenderId {
  return `${sender.tab?.id?.toString()}|${sender.frameId?.toString()}`;
}

// /**
//  * https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers#keep-sw-alive
//  *
//  * Keep the service worker alive by periodically calling extension API to prevent it from being stopped.
//  */
// class KeepAlive {
//   private interval: number | null = null;

//   start() {
//     if (this.interval) {
//       clearInterval(this.interval);
//     }
//     log.debug("KeepAlive start");
//     this.interval = setInterval(chrome.runtime.getPlatformInfo, 25 * 1000);
//   }

//   stop() {
//     if (this.interval) {
//       log.debug("KeepAlive stop");
//       clearInterval(this.interval);
//     }
//   }
// }


function dbKeyDocumentRef(senderId: SenderId) {
  return `autogram:avm:documentRef:${senderId}`;
}