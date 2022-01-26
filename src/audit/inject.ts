import { logMessageEventId } from "../constants";
import { LogMessage } from "./types";

export function logMessage(obj: LogMessage) {
  const event = new CustomEvent(logMessageEventId, { bubbles: true, detail: obj });
  document.dispatchEvent(event);
}
