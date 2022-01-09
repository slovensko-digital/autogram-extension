import { extensionId } from "../constants";

export function logMessage(obj: any) {
  const event = new CustomEvent(extensionId, { bubbles: true, detail: obj });
  document.dispatchEvent(event);
}
