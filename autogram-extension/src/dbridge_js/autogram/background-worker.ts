import {
  desktopApiClient,
  AutogramVMobileIntegration,
  AutogramError,
  MobileClient,
  RestorePointStore,
  createRpcHandler,
  serializeRpcError,
  ZRpcCallerFrame,
} from "autogram-sdk";
import type {
  AVMDocumentToSign,
  AVMIntegrationDocument,
  RpcHandler,
  RpcImpl,
  RpcResponseFrame,
} from "autogram-sdk";
import type { SignedDocument } from "autogram-sdk/avm-api";
import { avmService, autogramService } from "./channel/services";
import { get, set } from "idb-keyval";
import browser from "webextension-polyfill";
import { createLogger } from "../../log";
import { getAvmIntegrationRegistrationInfo } from "../../util-extension";

const log = createLogger("ag-ext.bg.worker");

export class BackgroundWorker {
  private handlers: RpcHandler[];

  constructor(
    private avm = new AvmExecutor(),
    private autogram = new AutogramExecutor()
  ) {
    this.handlers = [
      createRpcHandler(avmService, this.avm.impl),
      createRpcHandler(autogramService, this.autogram.impl),
    ];
  }

  initListener() {
    log.debug("initListener");
    browser.runtime.onConnect.addListener(this.onConnectListener.bind(this));
  }

  onConnectListener(newPort: browser.Runtime.Port) {
    log.debug("onConnect", newPort);

    const postFrame = (port: browser.Runtime.Port, frame: RpcResponseFrame) => {
      log.debug("background response", frame);
      try {
        port.postMessage(frame);
      } catch (e) {
        log.error("postMessage error", e);
      }
    };

    const handleMessage = (request: unknown, port: browser.Runtime.Port) => {
      const sender = port.sender;
      if (!sender) {
        throw new Error("Sender not found");
      }
      const senderId = getSenderId(sender);
      const frame = ZRpcCallerFrame.parse(request);
      log.debug("background frame", frame);

      if ("abort" in frame) {
        // Abort frames carry no service; every handler checks its own in-flight map.
        this.handlers.forEach((handler) => void handler.handle(frame, senderId));
        return;
      }

      // keepalive ping just starts the worker
      if (frame.method === "hello") {
        return;
      }

      const handler = this.handlers.find(
        (candidate) => candidate.serviceName === frame.service
      );
      if (!handler) {
        postFrame(port, {
          id: frame.id,
          ok: false,
          payload: serializeRpcError(
            new AutogramError(
              "protocol-error",
              `Unknown service ${frame.service}`
            )
          ),
        });
        return;
      }

      void handler.handle(frame, senderId).then((response) => {
        if (response) {
          postFrame(port, response);
        }
      });
    };

    if (newPort.sender) {
      this.avm
        .resumeWaitingForSignature(getSenderId(newPort.sender))
        .then(
          (result) => {
            if (result) {
              postFrame(newPort, {
                id: result.messageId,
                ok: true,
                payload: result.signedDocument,
              });
            }
          },
          (reason) => {
            if (reason?.messageId && reason?.error) {
              postFrame(newPort, {
                id: reason.messageId,
                ok: false,
                payload: serializeRpcError(reason.error),
              });
            }
          }
        )
        .catch((e) => {
          log.error("Error while resuming AVM waitForSignature", e);
        });
    }

    newPort.onDisconnect.addListener((p) => {
      log.debug("Disconnected .....", {
        p,
        lastError: browser.runtime.lastError,
      });

      if (newPort.sender) {
        const senderId = getSenderId(newPort.sender);
        this.handlers.forEach((handler) =>
          handler.abortSender(senderId, "Worker stopped")
        );
        this.avm.abortSenderRequests(senderId);
      }

      newPort.onMessage.removeListener(handleMessage);
    });

    newPort.onMessage.addListener(handleMessage);
  }
}

class AvmExecutor {
  private client = new MobileClient(
    new AutogramVMobileIntegration({ get, set })
  );
  private restorePoints = new RestorePointStore(
    { get, set },
    this.client,
    // historical key prefix — keeps previously persisted restore points readable
    "autogram:avm:restorePoint:"
  );
  /**
   * Controllers of in-progress signature waits, keyed by sender. Needed in
   * addition to the RPC handler's per-request tracking because resumed
   * waits (after a worker restart) run outside any request context.
   */
  private abortControllers = new Map<SenderId, AbortController>();

  public abortSenderRequests(senderId: SenderId) {
    const abortController = this.abortControllers.get(senderId);
    if (abortController) {
      abortController.abort("Worker stopped");
      this.abortControllers.delete(senderId);
    }
  }

  public async resumeWaitingForSignature(senderId: SenderId): Promise<{
    signedDocument: SignedDocument;
    messageId: string;
  } | null> {
    const waitingForSignature = await get<WaitingForSignatureRecord>(
      dbKeyWaitingForSignature(senderId)
    );
    if (waitingForSignature) {
      const documentRef = await get<AVMIntegrationDocument>(
        waitingForSignature.documentRefDbKey
      );
      if (documentRef) {
        log.debug(
          "Resuming waiting for signature after worker resume",
          senderId,
          documentRef
        );
        try {
          await this.client.register(
            await getAvmIntegrationRegistrationInfo()
          );

          return {
            signedDocument: await this.waitForSignatureSubroutine(
              documentRef,
              senderId
            ),
            messageId: waitingForSignature.messageId,
          };
        } catch (e) {
          log.error("Error while resuming waitForSignature", e);
          throw { error: e, messageId: waitingForSignature.messageId };
        }
      }
    }
    return null;
  }

  private async waitForSignatureSubroutine(
    documentRef: AVMIntegrationDocument,
    senderId: SenderId,
    externalSignal?: AbortSignal
  ) {
    const request = this.client.resumeRequest(documentRef);
    if (!request) {
      throw new Error("Document guid or key missing");
    }

    const abortController = new AbortController();
    this.abortControllers.set(senderId, abortController);
    if (externalSignal) {
      if (externalSignal.aborted) {
        abortController.abort(externalSignal.reason);
      } else {
        externalSignal.addEventListener(
          "abort",
          () => abortController.abort(externalSignal.reason),
          { once: true }
        );
      }
    }

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

    abortController.signal.addEventListener("abort", () => {
      browser.alarms.clear(alarmName);
      set(dbKeyWaitingForSignature(senderId), undefined);
    });

    const res = await request.waitForSignature({
      signal: abortController.signal,
    });

    browser.alarms.clear(alarmName);
    log.debug("res", res);
    return res;
  }

  readonly impl: RpcImpl<typeof avmService.methods> = {
    loadOrRegister: async () => {
      await this.client.register(await getAvmIntegrationRegistrationInfo());
      return null;
    },

    getQrCodeUrl: async (_args, context) => {
      const request = this.client.resumeRequest(
        await get<AVMIntegrationDocument>(dbKeyDocumentRef(context.senderId))
      );
      if (!request) {
        throw new Error("Document not found");
      }
      return request.qrCodeUrl();
    },

    getPairingQrCodeUrl: async () => {
      return this.client.pairingQrCodeUrl();
    },

    addDocument: async ({ documentToSign }, context) => {
      const storageData = await browser.storage.local.get({
        options: { notifyPairedDevices: true },
      });
      const request = await this.client.requestSignature(
        documentToSign as unknown as AVMDocumentToSign,
        {
          notifyDevices: storageData.options?.notifyPairedDevices !== false,
        }
      );
      await set(dbKeyDocumentRef(context.senderId), request.token);
      return null;
    },

    sendNotification: async (_args, context) => {
      const request = this.client.resumeRequest(
        await get<AVMIntegrationDocument>(dbKeyDocumentRef(context.senderId))
      );
      if (!request) {
        throw new Error("Document not found");
      }
      await request.notifyDevices();
      return null;
    },

    waitForSignature: async (_args, context) => {
      const documentRef = await get<AVMIntegrationDocument>(
        dbKeyDocumentRef(context.senderId)
      );
      if (!documentRef) {
        throw new Error("Document not found");
      }

      // persist so the wait can resume if the MV3 worker gets suspended
      await set(dbKeyWaitingForSignature(context.senderId), <
        WaitingForSignatureRecord
      >{
        documentRefDbKey: dbKeyDocumentRef(context.senderId),
        messageId: context.requestId,
      });

      const res = await this.waitForSignatureSubroutine(
        documentRef,
        context.senderId,
        context.signal
      );
      await set(dbKeyWaitingForSignature(context.senderId), undefined);
      return res;
    },

    reset: async (_args, context) => {
      await set(dbKeyDocumentRef(context.senderId), undefined);
      // TODO: should we abort the request when resetting?
      this.abortControllers.delete(context.senderId);
      browser.alarms.clear("autogram-signature-timeout-" + context.senderId);
      return null;
    },

    useRestorePoint: async ({ restorePoint }, context) => {
      const currentToken =
        (await get<AVMIntegrationDocument>(
          dbKeyDocumentRef(context.senderId)
        )) ?? null;

      const result = await this.restorePoints.use(restorePoint, currentToken);
      if (result.outcome === "none") {
        return null;
      }
      await set(dbKeyDocumentRef(context.senderId), result.token);
      return result.outcome === "signed" ? result.signedObject : null;
    },
  };
}

class AutogramExecutor {
  private client: ReturnType<typeof desktopApiClient>;

  constructor() {
    this.client = desktopApiClient({
      serverProtocol: "http",
      serverHost: "localhost",
      disableSecurity: true,
      requestsOrigin: "*",
    });
  }

  readonly impl: RpcImpl<typeof autogramService.methods> = {
    getLaunchURL: async ({ command }) => {
      return this.client.getLaunchURL(command);
    },

    info: async () => {
      return this.client.info();
    },

    waitForStatus: async ({ status, timeout, delay }, context) => {
      return this.client.waitForStatus(
        status,
        timeout,
        delay,
        toAbortController(context.signal)
      );
    },

    sign: async (
      { document, signatureParameters, payloadMimeType, batchId },
      context
    ) => {
      return this.client.sign(
        document,
        signatureParameters,
        payloadMimeType,
        batchId ?? null,
        toAbortController(context.signal)
      );
    },

    startBatch: async ({ totalNumberOfDocuments }, context) => {
      return this.client.startBatch(
        totalNumberOfDocuments,
        toAbortController(context.signal)
      );
    },

    endBatch: async ({ batchId }, context) => {
      return this.client.endBatch(
        batchId,
        toAbortController(context.signal)
      );
    },
  };
}

/** Bridges an AbortSignal to the AbortController-based desktop API client. */
function toAbortController(signal: AbortSignal): AbortController {
  const controller = new AbortController();
  if (signal.aborted) {
    controller.abort(signal.reason);
  } else {
    signal.addEventListener("abort", () => controller.abort(signal.reason), {
      once: true,
    });
  }
  return controller;
}

type SenderId = string;

function getSenderId(sender: browser.Runtime.MessageSender): SenderId {
  return `${sender.tab?.id?.toString()}|${sender.frameId?.toString()}`;
}

function dbKeyDocumentRef(senderId: SenderId) {
  return `autogram:avm:documentRef:${senderId}`;
}

function dbKeyWaitingForSignature(senderId: SenderId) {
  return `autogram:avm:waitingForSignature:${senderId}`;
}

interface WaitingForSignatureRecord {
  documentRefDbKey: string;
  messageId: string;
}
