import browser from "webextension-polyfill";
import { isExtensionEnabled } from "../options/content";

console.log("options");

// Saves options to chrome.storage
function save_options() {
  const extensionEnabled = (
    document.getElementById("extensionEnabled") as HTMLInputElement
  ).checked;
  browser.storage.local
    .set({
      options: {
        extensionEnabled,
      },
    })
    .then(function () {
      // Update status to let user know options were saved.
      const status = document.getElementById("status");
      if (status) {
        status.textContent = "Options saved.";
        setTimeout(function () {
          status.textContent = "";
        }, 750);
      }
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  console.log("restoring options");
  isExtensionEnabled().then((extensionEnabled) => {
    (document.getElementById("extensionEnabled") as HTMLInputElement).checked =
      extensionEnabled;
  });
}
document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save")?.addEventListener("click", save_options);
