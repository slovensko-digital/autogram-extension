import { AvmRegistrationInfo } from "autogram-sdk/avm-api/lib/apiClient";
import browser from "webextension-polyfill";

export async function getAvmIntegrationRegistrationInfo(): Promise<AvmRegistrationInfo> {
  const platform = "extension";
  const integrationName =
    browser.runtime.getManifest().name || "Autogram Extension";

  const platformInfo = await browser.runtime.getPlatformInfo();
  const platformName = platformInfo.os || "unknown";

  return { platform, displayName: `${integrationName} (${platformName})` };
}
