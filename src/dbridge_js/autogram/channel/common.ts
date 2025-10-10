import { AVMGetDocumentsResponse } from "autogram-sdk";

import { z } from "zod";

export const EVENT_SEND_MESSAGE_INJ_TO_CS = "autogram-send-message-injected-to-content-script" as const;
export const EVENT_MESSAGE_RESPONSE_CS_TO_INJ = "autogram-message-response-content-script-to-injected" as const;

export const ZChannelMessage = z.object({
  id: z.string(),
  method: z.string(),
  args: z.any().nullable(),
  app: z.union([z.literal("autogram"), z.literal("avm")]),
});
export type ChannelMessage = z.infer<typeof ZChannelMessage>;

export const ZChannelResponse = z.object({
  id: z.string(),
  result: z.any(),
  error: z.any(),
});

export const ZGetQrCodeUrlResponse = z.string();
export type GetQrCodeUrlResponse = z.infer<typeof ZGetQrCodeUrlResponse>;

export const ZWaitForSignatureResponse = AVMGetDocumentsResponse;
export type WaitForSignatureResponse = z.infer<
  typeof ZWaitForSignatureResponse
>;

/* Autogram Desktop */
export const ZGetLaunchUrlResponse = z.string();
export const ZWaitForStatusResponse = z.object({
  status: z.literal("READY").optional(),
  version: z.string().optional(),
});

export const ZSignResponse = z.object({
  content: z.string(),
  signedBy: z.string().default(""),
  issuedBy: z.string().default(""),
});

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
