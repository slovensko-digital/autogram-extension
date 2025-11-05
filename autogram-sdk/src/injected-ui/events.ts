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
