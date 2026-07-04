import type {
  AutogramDesktopIntegrationInterface,
  AutogramDocument,
  SignResponseBody,
  SignatureParameters,
  DesktopSigningState,
  DesktopSigningStateConsumer,
} from "./autogram-api/index";
import { AutogramDesktopSimpleChannel } from "./channel-desktop";
import {
  AutogramAppNotInstalledException,
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

  async launch(
    abortController?: AbortController,
    onStateChange?: DesktopSigningStateConsumer
  ): Promise<void> {
    onStateChange?.({ type: "checkingApp" });

    try {
      const info = await this.clientDesktopIntegration.info();
      if (info.status !== "READY") {
        throw new Error("Wait for server");
      }
      log.info(`Autogram ${info.version} is ready`);
      return;
    } catch (error) {
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

    try {
      const info = await this.clientDesktopIntegration.waitForStatus(
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
  }

  static stateType(_state: DesktopSigningState): _state is DesktopSigningState {
    return true;
  }
}