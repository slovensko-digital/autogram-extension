import type {
  AutogramDesktopIntegrationInterface,
  AutogramDocument,
  BatchEndResponseBody,
  SignResponseBody,
  SignatureParameters,
  DesktopSigningState,
  DesktopSigningStateConsumer,
} from "./autogram-api/index";
import { AutogramDesktopSimpleChannel } from "./channel-desktop";
import {
  AutogramAppNotInstalledException,
  AutogramAppVersionTooLowException,
  UserCancelledSigningException,
} from "./errors";
import { createLogger } from "./log";
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
};

export class DesktopClient {
  constructor(
    private clientDesktopIntegration: AutogramDesktopIntegrationInterface = new AutogramDesktopSimpleChannel()
  ) {}

  async sign(
    document: AutogramDocument,
    signatureParameters?: SignatureParameters,
    payloadMimeType?: string,
    options?: DesktopSignOptions
  ): Promise<SignResponseBody> {
    const onStateChange =
      options?.onStateChange ?? options?.onDesktopStateChange;
    const abortController = options?.abortController;

    await this.launch(abortController, onStateChange);
    onStateChange?.({ type: "waitingForSignature" });

    return this.clientDesktopIntegration
      .sign(
        document,
        signatureParameters,
        payloadMimeType,
        options?.batchId,
        abortController ?? undefined
      )
      .catch((error) => {
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
      });
  }

  // signV1 exists in Autogram versions > 2.8.0 and is not supported by older versions. sign() should be used for maximum compatibility - single document signing. If Autgoram od an older version is running, signV1 will throw an error which should be handled by the caller (e.g. by falling back to sign() or showing a message to the user). signV1 is intended to be used with newer Autogram versions and supports multiple document signing and additional parameters.
  async signV1(
    documents: [],
    parameters: {},
    options?: DesktopSignOptions
  ): Promise<SignResponseBody> {
    const onStateChange = options?.onStateChange ?? options?.onDesktopStateChange;
    const abortController = options?.abortController;

    await this.launch(abortController, onStateChange, { minimumAppVersion: "2.8.0" });
    onStateChange?.({ type: "waitingForSignature" });

    return this.clientDesktopIntegration
      .signV1(
        documents,
        parameters,
        options?.batchId,
        abortController ?? undefined
      )
      .catch((error) => {
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
      });
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

  async launch(
    abortController?: AbortController,
    onStateChange?: DesktopSigningStateConsumer,
    options?: { minimumAppVersion?: string }
  ): Promise<void> {
    onStateChange?.({ type: "checkingApp" });

    try {
      const info = await this.clientDesktopIntegration.info();
      if (info.status !== "READY") {
        throw new Error("Wait for server");
      }
      log.info(`Autogram ${info.version} is ready`);

      if (options?.minimumAppVersion && info.version) {
        log.info(`Minimum app version required: ${options.minimumAppVersion}, detected version: ${info.version}`);
        if (info.version === "dev")
          return; // skip version check for dev builds, as they may not follow semver format

        const [majorInfo] = info.version.split(".");
        const [majorRequired] = options.minimumAppVersion.split(".");
        if (Number(majorInfo) < Number(majorRequired)) {
          onStateChange?.({ type: "appVersionTooLow", requiredVersion: options.minimumAppVersion, detectedVersion: info.version });
          throw new AutogramAppVersionTooLowException(options.minimumAppVersion, info.version);
        }
      } else {
        log.info("No minimum app version specified, skipping version check")
      }

      return;
    } catch (error) {
      log.error("Desktop readiness check failed", error);

      if (error instanceof AutogramAppVersionTooLowException) {
        throw error;
      }
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

    try {
      const info = await this.clientDesktopIntegration.waitForStatus(
        "READY",
        APP_LAUNCH_READY_TIMEOUT_SECONDS,
        APP_LAUNCH_READY_POLL_DELAY_SECONDS,
        abortController
      );
      launchFinished = true;
      log.info(`Autogram ${info.version} is ready`);

      if (options?.minimumAppVersion && info.version) {
        log.info(`Minimum app version required: ${options.minimumAppVersion}, detected version: ${info.version}`);
        if (info.version === "dev")
          return; // skip version check for dev builds, as they may not follow semver format

        const [majorInfo] = info.version.split(".");
        const [majorRequired] = options.minimumAppVersion.split(".");
        if (Number(majorInfo) < Number(majorRequired)) {
          onStateChange?.({ type: "appVersionTooLow", requiredVersion: options.minimumAppVersion, detectedVersion: info.version });
          throw new AutogramAppVersionTooLowException(options.minimumAppVersion, info.version);
        }
      } else {
        log.info("No minimum app version specified, skipping version check")
      }
    } catch (error) {
      launchFinished = true;
      if (abortController?.signal.aborted) {
        throw error;
      }
      log.error("Waiting for desktop app readiness failed", error);
      onStateChange?.({ type: "appNotInstalled" });
      throw new AutogramAppNotInstalledException();
    }
  }

  static stateType(_state: DesktopSigningState): _state is DesktopSigningState {
    return true;
  }
}