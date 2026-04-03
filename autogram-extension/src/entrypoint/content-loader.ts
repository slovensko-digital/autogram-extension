console.log("Autogram content loader starting");
// Content scripts in MV3 are loaded as classic scripts.
// Load the module bundle at runtime via extension URL to avoid static ESM imports.
const contentModuleUrl = chrome.runtime.getURL("autogram-contentModule.bundle.js");

console.log("Autogram content loader loading module from", contentModuleUrl);

import(contentModuleUrl).catch((error) => {
  console.error("Autogram content loader failed to import module", error);
});
