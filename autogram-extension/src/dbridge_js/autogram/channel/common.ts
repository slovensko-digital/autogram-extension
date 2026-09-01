/**
 * Names of the CustomEvents carrying RPC frames between the injected
 * script (page context) and the content script. Frame shapes and method
 * schemas live in `services.ts`; the generic frame plumbing comes from
 * `autogram-sdk` (`ZRpcCallerFrame` / `ZRpcResponseFrame`).
 */

export const EVENT_SEND_MESSAGE_INJ_TO_CS =
  "autogram-send-message-injected-to-content-script" as const;
export const EVENT_MESSAGE_RESPONSE_CS_TO_INJ =
  "autogram-message-response-content-script-to-injected" as const;

declare global {
  /**
   * used in firefox extension to allow sending detail over extension interface
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent#Firing_from_privileged_code_to_non-privileged_code
   *
   * https://stackoverflow.com/a/46081249/3782248
   *
   */
  const cloneInto:
    | undefined
    | ((obj: unknown, window: Window, opts?: unknown) => unknown);
}
