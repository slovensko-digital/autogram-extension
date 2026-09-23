import type {
  AutogramDesktopIntegrationInterface,
  AutogramDocument,
  BatchEndResponseBody,
  ServerInfo,
  SignResponseBody,
  SignatureParameters,
  SignV1Document,
  SignV1PresentationParameters,
  SignV1SignatureParameters,
  DesktopSigningState,
  DesktopSigningStateConsumer,
} from "./autogram-api/index";
import { AutogramDesktopSimpleChannel } from "./channel-desktop";
import {
  AutogramAppNotInstalledException,
  AutogramAppVersionTooLowException,
  AutogramSdkException,
  UserCancelledSigningException,
} from "./errors";
import { createLogger } from "./log";
import {
  SIGN_V1_MIN_APP_VERSION,
  normalizeSignArgs,
  signRequestToLegacy,
  supportsSignV1,
  unsupportedLegacyParameters,
  versionSatisfies,
  type SignRequest,
} from "./sign-request";
import { waitForWindowBlur } from "./utils";

const log = createLogger("ag-sdk.DesktopClient");
const APP_LAUNCH_HINT_TIMEOUT_MS = 6300;
const APP_LAUNCH_READY_TIMEOUT_SECONDS = 20;
const APP_LAUNCH_READY_POLL_DELAY_SECONDS = 1;

export type DesktopSignOptions = {
  onStateChange?: DesktopSigningStateConsumer;
  onDesktopStateChange?: DesktopSigningStateConsumer;
  abortController?: AbortController;
  batchId?: string;
  /** How Autogram presents the documents before signing (Autogram >= 2.8.0; mapped to `visualizationWidth` for older versions). */
  presentation?: SignV1PresentationParameters;
};

export class DesktopClient {
  constructor(
    private clientDesktopIntegration: AutogramDesktopIntegrationInterface = new AutogramDesktopSimpleChannel()
  ) {}

  /**
   * Signs one or more documents. Multiple documents are signed together into a single ASiC_E
   * container ("spoločná autorizácia dokumentov").
   *
   * Autogram >= 2.8.0 is used via `POST /api/v1/sign`. Older versions fall back to the legacy
   * `POST /sign` endpoint, which supports one document only – signing multiple documents with an
   * older Autogram emits the `appVersionTooLow` state and throws {@link AutogramAppVersionTooLowException}.
   */
  sign(
    documents: SignV1Document | SignV1Document[],
    parameters?: SignV1SignatureParameters,
    options?: DesktopSignOptions
  ): Promise<SignResponseBody>;
  /**
   * @deprecated Legacy call shape of the `/sign` endpoint (`payloadMimeType` and XDC parameters
   * outside the document). Converted to the v1 shape internally; prefer the `documents` overload.
   * The overload is detected at runtime by the absence of `mimeType` on the document.
   */
  sign(
    document: AutogramDocument,
    signatureParameters?: SignatureParameters,
    payloadMimeType?: string,
    options?: DesktopSignOptions
  ): Promise<SignResponseBody>;
  async sign(
    first: SignV1Document | SignV1Document[] | AutogramDocument,
    second?: SignV1SignatureParameters | SignatureParameters,
    third?: string | DesktopSignOptions,
    fourth?: DesktopSignOptions
  ): Promise<SignResponseBody> {
    const { request, options } = normalizeSignArgs(first, second, third, fourth);
    return this.signRequest(request, options);
  }

  private async signRequest(
    request: SignRequest,
    options?: DesktopSignOptions
  ): Promise<SignResponseBody> {
    const onStateChange = options?.onStateChange ?? options?.onDesktopStateChange;
    const abortController = options?.abortController;

    if (options?.batchId && request.documents.length > 1) {
      throw new AutogramSdkException(
        "batchId cannot be used when signing multiple documents into a single container"
      );
    }

    const info = await this.launch(abortController, onStateChange);
    const useV1 = supportsSignV1(info.version);

    if (!useV1) {
      const unsupported = [
        ...(request.documents.length > 1 ? ["signing multiple documents into a single container"] : []),
        ...unsupportedLegacyParameters(request.parameters),
      ];
      if (unsupported.length > 0) {
        const detectedVersion = info.version ?? "unknown";
        log.error(`Autogram ${detectedVersion} does not support: ${unsupported.join(", ")}`);
        onStateChange?.({ type: "appVersionTooLow", requiredVersion: SIGN_V1_MIN_APP_VERSION, detectedVersion });
        throw new AutogramAppVersionTooLowException(SIGN_V1_MIN_APP_VERSION, detectedVersion);
      }
    }

    onStateChange?.({ type: "waitingForSignature" });
    log.info(
      `Signing ${request.documents.length} document(s) via ${useV1 ? "/api/v1/sign" : "/sign"} (Autogram ${info.version ?? "unknown"})`
    );

    let result: Promise<SignResponseBody>;
    if (useV1) {
      result = this.clientDesktopIntegration.signV1(
        { ...request, ...(options?.batchId ? { batchId: options.batchId } : {}) },
        abortController ?? undefined
      );
    } else {
      const legacy = signRequestToLegacy(request);
      result = this.clientDesktopIntegration.sign(
        legacy.document,
        legacy.parameters,
        legacy.payloadMimeType,
        options?.batchId,
        abortController ?? undefined
      );
    }

    return result.catch((error) => this.reportSignError(error, onStateChange));
  }

  private reportSignError(error: unknown, onStateChange?: DesktopSigningStateConsumer): never {
    if (error instanceof UserCancelledSigningException) {
      log.info("User cancelled signing");
      onStateChange?.({ type: "signingCancelled" });
    } else {
      log.error("sign failed", error);
      onStateChange?.({
        type: "error",
        message: (error as Error)?.message ?? String(error),
      });
    }
    throw error;
  }

  async startBatch(
    totalNumberOfDocuments: number,
    options?: Omit<DesktopSignOptions, "batchId">
  ): Promise<string> {
    const onStateChange =
      options?.onStateChange ?? options?.onDesktopStateChange;
    const abortController = options?.abortController;

    await this.launch(abortController, onStateChange);
    onStateChange?.({ type: "waitingForSignature" });

    return this.clientDesktopIntegration
      .startBatch(totalNumberOfDocuments, abortController ?? undefined)
      .then((response) => {
        if (!response.batchId) {
          throw new UserCancelledSigningException();
        }

        return response.batchId;
      })
      .catch((error) => {
        if (error instanceof UserCancelledSigningException) {
          log.info("User cancelled batch signing");
          onStateChange?.({ type: "signingCancelled" });
        } else {
          log.error("startBatch failed", error);
          onStateChange?.({
            type: "error",
            message: (error as Error)?.message ?? String(error),
          });
        }
        throw error;
      });
  }

  endBatch(
    batchId: string,
    abortController?: AbortController
  ): Promise<BatchEndResponseBody> {
    return this.clientDesktopIntegration.endBatch(
      batchId,
      abortController ?? undefined
    );
  }

  /**
   * Makes sure Autogram is running (launching it if needed) and returns its info.
   * With `minimumAppVersion` an older Autogram emits `appVersionTooLow` and throws
   * {@link AutogramAppVersionTooLowException}.
   */
  async launch(
    abortController?: AbortController,
    onStateChange?: DesktopSigningStateConsumer,
    options?: { minimumAppVersion?: string }
  ): Promise<ServerInfo> {
    onStateChange?.({ type: "checkingApp" });

    try {
      const info = await this.clientDesktopIntegration.info();
      if (info.status !== "READY") {
        throw new Error("Wait for server");
      }
      log.info(`Autogram ${info.version} is ready`);
      this.assertMinimumAppVersion(info, options?.minimumAppVersion, onStateChange);
      return info;
    } catch (error) {
      if (error instanceof AutogramAppVersionTooLowException) {
        throw error;
      }
      log.error("Desktop readiness check failed", error);
    }

    onStateChange?.({ type: "launchingApp" });

    const url = await this.clientDesktopIntegration.getLaunchURL();

    log.info(`Opening \"${url}\"`);
    window.location.assign(url);

    let launchFinished = false;
    void waitForWindowBlur(APP_LAUNCH_HINT_TIMEOUT_MS).then((didBlur) => {
      if (
        !didBlur &&
        !launchFinished &&
        !(abortController?.signal.aborted ?? false)
      ) {
        onStateChange?.({ type: "appMayNotBeInstalled" });
      }
    });

    let info: ServerInfo;
    try {
      info = await this.clientDesktopIntegration.waitForStatus(
        "READY",
        APP_LAUNCH_READY_TIMEOUT_SECONDS,
        APP_LAUNCH_READY_POLL_DELAY_SECONDS,
        abortController
      );
      launchFinished = true;
      log.info(`Autogram ${info.version} is ready`);
    } catch (error) {
      launchFinished = true;
      if (abortController?.signal.aborted) {
        throw error;
      }
      log.error("Waiting for desktop app readiness failed", error);
      onStateChange?.({ type: "appNotInstalled" });
      throw new AutogramAppNotInstalledException();
    }

    // Outside the try/catch so that an old version is not reported as "not installed"
    this.assertMinimumAppVersion(info, options?.minimumAppVersion, onStateChange);
    return info;
  }

  private assertMinimumAppVersion(
    info: ServerInfo,
    minimumAppVersion: string | undefined,
    onStateChange?: DesktopSigningStateConsumer
  ): void {
    if (!minimumAppVersion) return;
    const detectedVersion = info.version ?? "unknown";
    log.info(`Minimum app version required: ${minimumAppVersion}, detected version: ${detectedVersion}`);
    if (detectedVersion === "dev") return; // dev builds do not follow semver

    if (!versionSatisfies(detectedVersion, minimumAppVersion)) {
      onStateChange?.({ type: "appVersionTooLow", requiredVersion: minimumAppVersion, detectedVersion });
      throw new AutogramAppVersionTooLowException(minimumAppVersion, detectedVersion);
    }
  }

  static versionSatisfies(version: string, requiredVersion: string): boolean {
    return versionSatisfies(version, requiredVersion);
  }

  static stateType(_state: DesktopSigningState): _state is DesktopSigningState {
    return true;
  }
}
