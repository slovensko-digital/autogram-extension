import browser from "webextension-polyfill";
import { defaultOptionsStorage } from "./default";

export async function isExtensionEnabled(): Promise<boolean> {
  const data = await browser.storage.local.get(defaultOptionsStorage);
  console.log(data);
  return data.options.extensionEnabled;
}
