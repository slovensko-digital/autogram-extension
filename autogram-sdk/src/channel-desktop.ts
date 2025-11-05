import {
  apiClient,
  AutogramDesktopIntegrationInterface,
  AutogramDocument,
  ServerInfo,
  SignatureParameters,
  SignResponseBody,
} from "./autogram-api/lib/apiClient";
import { isSafari } from "./utils";

export class AutogramDesktopSimpleChannel
  implements AutogramDesktopIntegrationInterface
{
  private apiClient: ReturnType<typeof apiClient>;
  constructor() {
    let serverProtocol: "http" | "https" = "http";
    let serverHost = "localhost";

    // This is only useful when not using worker, since the worker does not have the https limitation.
    if (isSafari()) {
      // Quick hack - mozno je lepsie urobit to ako fallback ak nefunguje http
      serverProtocol = "https";
      serverHost = "loopback.autogram.slovensko.digital";
    }

    this.apiClient = apiClient({
      serverProtocol,
      serverHost,
      disableSecurity: true,
      requestsOrigin: "*",
    });
  }

  getLaunchURL(command?: "listen"): Promise<string> {
    return this.apiClient.getLaunchURL(command);
  }
  info(): Promise<ServerInfo> {
    return this.apiClient.info();
  }
  waitForStatus(
    status: ServerInfo["status"],
    timeout?: number,
    delay?: number,
    abortController?: AbortController
  ): Promise<ServerInfo> {
    return this.apiClient.waitForStatus(
      status,
      timeout,
      delay,
      abortController
    );
  }
  sign(
    document: AutogramDocument,
    signatureParameters?: SignatureParameters,
    payloadMimeType?: string
  ): Promise<SignResponseBody> {
    return this.apiClient.sign(document, signatureParameters, payloadMimeType);
  }
}
