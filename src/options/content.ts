import browser from "webextension-polyfill";
import { defaultOptionsStorage } from "./default";
import { createLogger } from "../log";

const log = createLogger("ag-ext.options");

export async function isExtensionEnabled(): Promise<boolean> {
  const data = await browser.storage.local.get(defaultOptionsStorage);
  log.debug(data);
  return data.options.extensionEnabled;
}

export async function setSigningMethod(signingMethod: string): Promise<void> {
  const options = await browser.storage.local.get(defaultOptionsStorage)
  options.signingMethod = signingMethod;
  await browser.storage.local.set({options  });
}