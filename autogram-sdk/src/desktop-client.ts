import type {
  AutogramDesktopIntegrationInterface,
  DesktopSigningStateConsumer,
} from "./autogram-api/index";
import {
  AutogramAppNotInstalledException,
  AutogramSdkException,
} from "./errors";
import { createLogger } from "./log";
import { waitForWindowBlur } from "./utils";

const log = createLogger("ag-sdk.DesktopClient");
const APP_LAUNCH_BLUR_TIMEOUT_MS = 1500;

export type DesktopSignOptions = {
  onDesktopStateChange?: DesktopSigningStateConsumer;
};

export class DesktopClient {
  constructor(
    private clientDesktopIntegration: AutogramDesktopIntegrationInterface
  ) {}

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
    const blurPromise = waitForWindowBlur(APP_LAUNCH_BLUR_TIMEOUT_MS);

    log.info(`Opening \"${url}\"`);
    window.location.assign(url);

    const didBlur = await blurPromise;
    if (!didBlur) {
      onStateChange?.({ type: "appNotInstalled" });
      throw new AutogramAppNotInstalledException();
    }

    try {
      const info = await this.clientDesktopIntegration.waitForStatus(
        "READY",
        100,
        5,
        abortController
      );
      log.info(`Autogram ${info.version} is ready`);
    } catch (error) {
      log.error("Waiting for desktop app readiness failed", error);
      const message = "Nepodarilo sa spustiť Autogram.";
      onStateChange?.({ type: "error", message });
      throw new AutogramSdkException(message);
    }
  }
}