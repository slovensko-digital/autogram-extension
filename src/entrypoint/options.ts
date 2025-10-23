import browser from "webextension-polyfill";
import {
  getOptions,
  isExtensionEnabled,
  isRestorePointEnabled,
} from "../options/content";
import { createLogger } from "../log";

const log = createLogger("ag-ext.ent.options");

log.debug("options");

// Saves options to chrome.storage
function save_options() {
  const extensionEnabled = (
    document.getElementById("extensionEnabled") as HTMLInputElement
  ).checked;

  const restorePointEnabled = (
    document.getElementById("restorePointEnabled") as HTMLInputElement
  ).checked;

  browser.storage.local
    .set({
      options: {
        extensionEnabled,
        restorePointEnabled,
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
  log.debug("restoring options");

  getOptions().then((options) => {
    (document.getElementById("extensionEnabled") as HTMLInputElement).checked =
      options.extensionEnabled;

    (
      document.getElementById("restorePointEnabled") as HTMLInputElement
    ).checked = options.restorePointEnabled;
  });
}
document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save")?.addEventListener("click", save_options);

navigator.permissions
  .query({ name: "local-network-access" } as unknown as PermissionDescriptor)
  .then((result) => {
    console.log("Local network access permission state:", result.state);
    console.log(result);
  });
