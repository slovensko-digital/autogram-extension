import { SigningMethod } from "./types";

export const EVENT_SIGN = "autogram-sign";

export const EVENT_SHOW_QR_CODE = "autogram-show-qr-code";

export class EventChoice extends CustomEvent<{ method: SigningMethod }> {
  constructor(method: SigningMethod) {
    super("autogram-choice", {
      detail: { method },
      bubbles: true,
      composed: true,
    });
  }
}

export class EventClose extends CustomEvent<null> {
  constructor() {
    super("autogram-close", {
      detail: null,
      bubbles: true,
      composed: true,
    });
  }
}

export class EventRestorePointResult extends CustomEvent<boolean> {
  constructor(useRestorePoint: boolean) {
    super("autogram-restore-point-result", {
      detail: useRestorePoint,
      bubbles: true,
      composed: true,
    });
  }
}

/** The "pair this computer" step of the QR screen was opened or left. */
export class EventPairingStep extends CustomEvent<{ open: boolean }> {
  constructor(open: boolean) {
    super("autogram-pairing-step", {
      detail: { open },
      bubbles: true,
      composed: true,
    });
  }
}

export class EventRetryMobileNotification extends CustomEvent<null> {
  constructor() {
    super("autogram-retry-mobile-notification", {
      detail: null,
      bubbles: true,
      composed: true,
    });
  }
}
