import {
  apiClient,
  AutogramDesktopIntegrationInterface,
  AutogramDocument,
  BatchEndResponseBody,
  BatchStartResponseBody,
  ServerInfo,
  SignatureParameters,
  SignResponseBody,
} from "./autogram-api/lib/apiClient";
import { isSafari } from "./utils";

/**
 * Default direct implementation of {@link AutogramDesktopIntegrationInterface}
 * that communicates with the Autogram desktop application running on
 * the user's local machine.
 *
 * Connects to `http://localhost` by default. On Safari, where mixed
 * content blocks plain HTTP, it falls back to
 * `https://loopback.autogram.slovensko.digital` instead.
 *
 * The typical signing flow is:
 * 1. {@link getLaunchURL} — get a deep-link URL to launch / wake the
 *    desktop app.
 * 2. {@link waitForStatus} — wait until the app reports it is ready.
 * 3. {@link sign} — submit the document and receive the signed result.
 *
 * This class is the default channel used by `CombinedClient`. The
 * browser extension replaces it with `AutogramDesktopChannel`, which
 * routes calls through the content-script ↔ injected-script message
 * bridge instead of calling the local HTTP server directly.
 */
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
  startBatch(
    totalNumberOfDocuments: number,
    abortController?: AbortController
  ): Promise<BatchStartResponseBody> {
    return this.apiClient.startBatch(
      totalNumberOfDocuments,
      abortController ?? null
    );
  }
  endBatch(
    batchId: string,
    abortController?: AbortController
  ): Promise<BatchEndResponseBody> {
    return this.apiClient.endBatch(batchId, abortController ?? null);
  }
  sign(
    document: AutogramDocument,
    signatureParameters?: SignatureParameters,
    payloadMimeType?: string,
    batchId?: string,
    abortController?: AbortController
  ): Promise<SignResponseBody> {
    return this.apiClient.sign(
      document,
      signatureParameters,
      payloadMimeType,
      batchId ?? null,
      abortController ?? null
    );
  }
}
