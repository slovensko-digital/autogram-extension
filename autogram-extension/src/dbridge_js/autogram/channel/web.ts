import {
  AutogramVMobileIntegrationInterfaceStateful,
  AVMDocumentToSign,
  AVMSignedDocument,
  AutogramDesktopIntegrationInterface,
  DesktopAutogramDocument,
  DesktopSignatureParameters,
  DesktopSignResponseBody,
  DesktopServerInfo,
  DesktopBatchStartResponseBody,
  DesktopBatchEndResponseBody,
  SignedObject,
  createRpcClient,
  RpcCallerFrame,
  RpcClient,
  RpcClientTransport,
  RpcResponseFrame,
  ZRpcResponseFrame,
} from "autogram-sdk";
import { avmService, autogramService } from "./services";
import {
  EVENT_MESSAGE_RESPONSE_CS_TO_INJ,
  EVENT_SEND_MESSAGE_INJ_TO_CS,
} from "./common";
import { createLogger } from "../../../log";

const log = createLogger("ag-ext.channel.web");

/**
 * Class used on side of injected content script
 */
export class AutogramDesktopChannel
  implements AutogramDesktopIntegrationInterface
{
  private rpc: RpcClient<typeof autogramService.methods>;

  constructor(channel: WebChannelCaller) {
    this.rpc = createRpcClient(autogramService, channel);
  }

  getLaunchURL(command?: "listen"): Promise<string> {
    return this.rpc.getLaunchURL({ command });
  }
  info(): Promise<DesktopServerInfo> {
    return this.rpc.info(null);
  }
  waitForStatus(
    status: DesktopServerInfo["status"],
    timeout?: number,
    delay?: number,
    abortController?: AbortController
  ): Promise<DesktopServerInfo> {
    return this.rpc.waitForStatus(
      { status, timeout, delay },
      { signal: abortController?.signal }
    );
  }
  async sign(
    document: DesktopAutogramDocument,
    signatureParameters?: DesktopSignatureParameters,
    payloadMimeType?: string,
    batchId?: string,
    abortController?: AbortController
  ): Promise<DesktopSignResponseBody> {
    const response = await this.rpc.sign(
      { document, signatureParameters, payloadMimeType, batchId },
      { signal: abortController?.signal }
    );
    log.debug("sign response", response);
    return response;
  }
  startBatch(
    totalNumberOfDocuments: number,
    abortController?: AbortController
  ): Promise<DesktopBatchStartResponseBody> {
    return this.rpc.startBatch(
      { totalNumberOfDocuments },
      { signal: abortController?.signal }
    );
  }
  endBatch(
    batchId: string,
    abortController?: AbortController
  ): Promise<DesktopBatchEndResponseBody> {
    return this.rpc.endBatch({ batchId }, { signal: abortController?.signal });
  }
}

/**
 * Class used on side of injected content script
 */
export class AvmChannelWeb
  implements AutogramVMobileIntegrationInterfaceStateful
{
  private rpc: RpcClient<typeof avmService.methods>;

  constructor(channel: WebChannelCaller) {
    this.rpc = createRpcClient(avmService, channel);
  }

  async init() {}

  /* registration info is provided by the background worker itself */
  async loadOrRegister(): Promise<void> {
    await this.rpc.loadOrRegister(null);
  }
  getQrCodeUrl(): Promise<string> {
    return this.rpc.getQrCodeUrl(null);
  }
  getPairingQrCodeUrl(): Promise<string> {
    return this.rpc.getPairingQrCodeUrl(null);
  }
  async addDocument(documentToSign: AVMDocumentToSign): Promise<void> {
    await this.rpc.addDocument({ documentToSign });
  }
  async sendNotification(): Promise<void> {
    await this.rpc.sendNotification(null);
  }
  waitForSignature(
    abortController?: AbortController
  ): Promise<AVMSignedDocument> {
    return this.rpc.waitForSignature(null, {
      signal: abortController?.signal,
    });
  }
  async reset(): Promise<void> {
    await this.rpc.reset(null);
  }
  useRestorePoint(restorePoint: string): Promise<SignedObject | null> {
    log.debug("useRestorePoint", restorePoint);
    return this.rpc.useRestorePoint({ restorePoint });
  }
}

/**
 * Injected-script side of the bridge: an {@link RpcClientTransport} that
 * moves RPC frames over CustomEvents.
 *
 * injected script --(EVENT_SEND_MESSAGE_INJ_TO_CS)--> content script
 * injected script <--(EVENT_MESSAGE_RESPONSE_CS_TO_INJ)-- content script
 */
export class WebChannelCaller implements RpcClientTransport {
  private responseListeners: Array<(frame: RpcResponseFrame) => void> = [];

  private responseEventHandler = (evt: CustomEvent) => {
    log.debug("web message response ⬅️", evt.detail);
    const frame = ZRpcResponseFrame.parse(evt.detail);
    this.responseListeners.forEach((callback) => callback(frame));
  };

  public init() {
    window.addEventListener(
      EVENT_MESSAGE_RESPONSE_CS_TO_INJ,
      this.responseEventHandler
    );
  }

  public destroy() {
    window.removeEventListener(
      EVENT_MESSAGE_RESPONSE_CS_TO_INJ,
      this.responseEventHandler
    );
  }

  public send(frame: RpcCallerFrame): void {
    log.debug("Sending frame ➡️", frame);
    const evt = new CustomEvent(EVENT_SEND_MESSAGE_INJ_TO_CS, {
      detail: frame,
      bubbles: true,
      composed: true,
    });
    window.dispatchEvent(evt);
  }

  public onResponse(callback: (frame: RpcResponseFrame) => void): void {
    this.responseListeners.push(callback);
  }
}
