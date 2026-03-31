import browser from "webextension-polyfill";
import { toSVG as bwipToSvg } from "@bwip-js/generic";
import { get, set } from "idb-keyval";
import { AutogramVMobileIntegration } from "autogram-sdk";
import { getOptions } from "../options/content";
import { createLogger } from "../log";
import { getAvmIntegrationRegistrationInfo } from "../util";

const log = createLogger("ag-ext.ent.options");
const avmIntegration = new AutogramVMobileIntegration({
  get,
  set,
});

const QR_REFRESH_INTERVAL_MS = 4 * 60 * 1000;
let qrRefreshTimer: ReturnType<typeof setTimeout> | null = null;
let qrIsOutdated = false;

log.debug("options");

// Saves options to chrome.storage
function save_options() {
  const extensionEnabled = (
    document.getElementById("extensionEnabled") as HTMLInputElement
  ).checked;

  const restorePointEnabled = (
    document.getElementById("restorePointEnabled") as HTMLInputElement
  ).checked;

  const notifyPairedDevices = (
    document.getElementById("notifyPairedDevices") as HTMLInputElement
  ).checked;

  browser.storage.local
    .set({
      options: {
        extensionEnabled,
        restorePointEnabled,
        notifyPairedDevices,
      },
    })
    .then(function () {
      // Update status to let user know options were saved.
      const status = document.getElementById("status");
      if (status) {
        status.textContent = browser.i18n.getMessage("optionsSaved");
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

    (
      document.getElementById("notifyPairedDevices") as HTMLInputElement
    ).checked = options.notifyPairedDevices;
  });
}

function renderQrCode(selector: string, value: string) {
  const container = document.getElementById(selector);
  if (!container) {
    return;
  }

  container.innerHTML = bwipToSvg({
    bcid: "qrcode",
    text: value,
    scale: 6,
    width: 100,
    height: 100,
  });
}

function scheduleQrRefresh() {
  if (qrRefreshTimer !== null) {
    clearTimeout(qrRefreshTimer);
  }
  qrRefreshTimer = setTimeout(() => {
    qrRefreshTimer = null;
    if (document.visibilityState === "visible") {
      void showPairingQrCode();
    } else {
      qrIsOutdated = true;
      const pairingQrImage = document.getElementById("pairingQrImage");
      if (pairingQrImage) {
        pairingQrImage.style.opacity = "0.3";
      }
    }
  }, QR_REFRESH_INTERVAL_MS);
}

async function showPairingQrCode() {
  const pairingQrStatus = document.getElementById("pairingQrStatus");
  const pairingQrUrl = document.getElementById(
    "pairingQrUrl"
  ) as HTMLTextAreaElement | null;

  if (!pairingQrStatus || !pairingQrUrl) {
    return;
  }

  pairingQrStatus.textContent = "Pripravujem párovací QR kód...";

  try {
    await avmIntegration.loadOrRegister(
      await getAvmIntegrationRegistrationInfo()
    );
    const pairingUrl = await avmIntegration.getPairingQrCodeUrl();
    pairingQrUrl.value = pairingUrl;
    qrIsOutdated = false;
    const pairingQrImage = document.getElementById("pairingQrImage");
    if (pairingQrImage) {
      pairingQrImage.style.opacity = "";
    }
    renderQrCode("pairingQrImage", pairingUrl);
    pairingQrStatus.textContent = "Párovací QR kód je pripravený.";
    scheduleQrRefresh();
  } catch (error) {
    log.error("Failed to prepare pairing QR code", error);
    const pairingQrImage = document.getElementById("pairingQrImage");
    if (pairingQrImage) {
      pairingQrImage.innerHTML = "";
    }
    pairingQrUrl.value = "";
    pairingQrStatus.textContent =
      "Nepodarilo sa pripraviť párovací QR kód. Skúste to znova.";
  }
}

async function copyPairingUrl() {
  const pairingQrStatus = document.getElementById("pairingQrStatus");
  const pairingQrUrl = document.getElementById(
    "pairingQrUrl"
  ) as HTMLTextAreaElement | null;

  if (!pairingQrStatus || !pairingQrUrl || !pairingQrUrl.value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(pairingQrUrl.value);
    pairingQrStatus.textContent = "Párovacia URL bola skopírovaná.";
  } catch (error) {
    log.error("Failed to copy pairing URL", error);
    pairingQrStatus.textContent = "Nepodarilo sa skopírovať párovaciu URL.";
  }
}

function openPairingUrl() {
  const pairingQrStatus = document.getElementById("pairingQrStatus");
  const pairingQrUrl = document.getElementById(
    "pairingQrUrl"
  ) as HTMLTextAreaElement | null;

  if (!pairingQrStatus || !pairingQrUrl || !pairingQrUrl.value) {
    return;
  }

  window.open(pairingQrUrl.value, "_blank", "noopener,noreferrer");
}

async function loadPairedDevices() {
  const container = document.getElementById("pairedDevicesList");
  const status = document.getElementById("pairedDevicesStatus");
  if (!container || !status) {
    return;
  }

  status.textContent = "Načítavam zariadenia...";
  container.replaceChildren();

  try {
    await avmIntegration.loadOrRegister(
      await getAvmIntegrationRegistrationInfo()
    );
    const devices = await avmIntegration.getDevices();

    status.textContent = "";

    if (devices.length === 0) {
      status.textContent = "Žiadne párované zariadenia.";
      return;
    }

    for (const device of devices) {
      const li = document.createElement("li");
      li.className = "device-item";

      const name = document.createElement("span");
      name.className = "device-name";
      name.textContent = device.displayName;

      const platform = document.createElement("span");
      platform.className = "device-platform";
      platform.textContent = device.platform;

      li.append(name, platform);
      container.appendChild(li);
    }
  } catch (error) {
    log.error("Failed to load paired devices", error);
    status.textContent = "Nepodarilo sa načítať zariadenia.";
  }
}

function initPairingQrControls() {
  document
    .getElementById("copyPairingUrl")
    ?.addEventListener("click", () => void copyPairingUrl());
  document
    .getElementById("openPairingUrl")
    ?.addEventListener("click", openPairingUrl);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && qrIsOutdated) {
      void showPairingQrCode();
    }
  });

  void showPairingQrCode();
}

function initOptionsPage() {
  restore_options();
  initPairingQrControls();
  void loadPairedDevices();
}

document.addEventListener("DOMContentLoaded", initOptionsPage);
document.getElementById("save")?.addEventListener("click", save_options);
