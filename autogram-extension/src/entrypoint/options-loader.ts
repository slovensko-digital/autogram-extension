const optionsModuleUrl = chrome.runtime.getURL("autogram-optionsModule.bundle.js");

import(optionsModuleUrl).catch((error) => {
  console.error("Autogram options loader failed to import module", error);
});
