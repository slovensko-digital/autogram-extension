import browser from "webextension-polyfill";
import { defaultOptionsStorage } from "./default";
import { createLogger } from "../log";

const log = createLogger("ag-ext.options");

export async function getOptions(): Promise<
  typeof defaultOptionsStorage.options
> {
  const data = await browser.storage.local.get(defaultOptionsStorage);
  log.debug(data);
  return data.options;
}

// export async function setSigningMethod(signingMethod: string): Promise<void> {
//   const options = await getOptions();
//   options.signingMethod = signingMethod;
//   await browser.storage.local.set({ options });
// }
