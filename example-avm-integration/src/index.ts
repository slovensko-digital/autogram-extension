import { del, get, set } from "idb-keyval";
import {
  AutogramVMobileIntegration,
  type AVMDocumentToSign,
  type AVMIntegrationDocument,
  type AVMSignedDocument,
} from "autogram-sdk";
import {
  $,
  appendLog,
  clearElement,
  downloadSignedDocument,
  renderQrCode,
  setText,
  showSignedPreview,
} from "./ui";

type IntegrationInternals = {
  apiClient: {
    baseUrl: string;
    qrCodeRegisterIntegrationUrl(integrationJwt: string): string;
  };
  integrationGuid: string | null;
  getIntegrationBearerToken(withDevice?: boolean): Promise<string>;
};

type SigningParameters = NonNullable<AVMDocumentToSign["parameters"]>;
type SignatureLevel = NonNullable<SigningParameters["level"]>;
type SignatureContainer = NonNullable<SigningParameters["container"]>;

const integration = new AutogramVMobileIntegration({
  get,
  set,
});
const integrationInternals = integration as unknown as IntegrationInternals;

let documentRef: AVMIntegrationDocument | null = null;
let waitAbortController: AbortController | null = null;

function currentBaseUrl() {
  return ($("baseUrl").el as HTMLInputElement).value.trim();
}

function applyBaseUrl() {
  integrationInternals.apiClient.baseUrl = currentBaseUrl();
}

function logEvent(message: string) {
  appendLog("eventLog", `[${new Date().toLocaleTimeString()}] ${message}`);
}

function setStatus(message: string) {
  setText("statusOutput", message);
}

async function loadOrRegisterIntegration() {
  applyBaseUrl();
  setStatus("Loading integration state...");
  logEvent(`Using AVM server ${integrationInternals.apiClient.baseUrl}`);
  await integration.loadOrRegister();
  const state = {
    baseUrl: integrationInternals.apiClient.baseUrl,
    integrationGuid: integrationInternals.integrationGuid,
    persistedKeys: true,
  };
  $("integrationState").j = state;
  setStatus("Integration ready.");
  logEvent(`Integration ready: ${integrationInternals.integrationGuid}`);
  await showPairingQr();
}

async function resetIntegrationState() {
  await Promise.all([del("keyPair"), del("integrationGuid")]);
  documentRef = null;
  waitAbortController?.abort("Integration reset");
  waitAbortController = null;
  $("integrationState").w = "Saved integration state removed.";
  $("documentState").w = "No document uploaded yet.";
  $("signedMetadata").w = "No signed document yet.";
  setText("qrUrl", "");
  setText("qrUrlNoJwt", "");
  hideQrImage();
  hidePairingQr();
  clearElement("signedPreview");
  setStatus("Integration state reset.");
  logEvent("Cleared persisted integration key pair and GUID.");
}

async function createSigningSession() {
  await ensureIntegrationReady();
  const payload = await buildDocumentToSign();
  setStatus("Uploading document...");
  logEvent(`Uploading ${payload.document.filename || "unnamed document"}.`);
  documentRef = await integration.addDocument(payload);
  $("documentState").j = documentRef;

  const qrUrl = await integration.getQrCodeUrl(documentRef, true);
  const qrUrlNoJwt = await integration.getQrCodeUrl(documentRef, false);
  setQrUrl(qrUrl);
  setQrUrlNoJwt(qrUrlNoJwt);
  setStatus("Signing session created.");
  if (!documentRef) {
    throw new Error("Document upload finished without a document reference.");
  }
  logEvent(`Document uploaded with GUID ${documentRef.guid}.`);
}

async function waitForSignature() {
  if (!documentRef) {
    throw new Error("Create a signing session before waiting for signature.");
  }

  waitAbortController?.abort("New wait started");
  waitAbortController = new AbortController();
  setStatus("Waiting for signature. Push request was sent to paired devices.");
  logEvent("Waiting for signed document.");

  const signedDocument = await integration.waitForSignature(
    documentRef,
    waitAbortController
  );

  renderSignedDocument(signedDocument);
  setStatus("Signed document received.");
  logEvent("Signed document downloaded from AVM server.");
}

function abortWaiting() {
  if (!waitAbortController) {
    setStatus("No active wait request.");
    return;
  }
  waitAbortController.abort("Aborted by user");
  waitAbortController = null;
  setStatus("Waiting aborted.");
  logEvent("Aborted waiting for signature.");
}

async function copyQrUrl() {
  const url = ($("qrUrl").el as HTMLTextAreaElement).value;
  if (!url) {
    throw new Error("Generate an AVM URL first.");
  }
  await navigator.clipboard.writeText(url);
  logEvent("Copied AVM URL to clipboard.");
}

function openQrUrl() {
  const url = ($("qrUrl").el as HTMLTextAreaElement).value;
  if (!url) {
    throw new Error("Generate an AVM URL first.");
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

async function copyQrUrlNoJwt() {
  const url = ($("qrUrlNoJwt").el as HTMLTextAreaElement).value;
  if (!url) {
    throw new Error("Generate an AVM URL first.");
  }
  await navigator.clipboard.writeText(url);
  logEvent("Copied plain AVM URL (no JWT) to clipboard.");
}

function openQrUrlNoJwt() {
  const url = ($("qrUrlNoJwt").el as HTMLTextAreaElement).value;
  if (!url) {
    throw new Error("Generate an AVM URL first.");
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

async function ensureIntegrationReady() {
  if (!integrationInternals.integrationGuid) {
    await loadOrRegisterIntegration();
  }
}

async function buildDocumentToSign(): Promise<AVMDocumentToSign> {
  const file = ($("fileInput").el as HTMLInputElement).files?.[0];
  const level = ($("signatureLevel").el as HTMLSelectElement)
    .value as SignatureLevel;
  const containerValue = ($("signatureContainer").el as HTMLSelectElement)
    .value as SignatureContainer | "";

  if (file) {
    ($("filename").el as HTMLInputElement).value = file.name;
    if (file.type) {
      ($("mimeType").el as HTMLInputElement).value = file.type;
    }
    const serialized = await serializeFile(file);
    return {
      document: {
        filename: file.name,
        content: serialized.content,
      },
      parameters: {
        level,
        ...(containerValue ? { container: containerValue } : {}),
      },
      payloadMimeType: serialized.payloadMimeType,
    };
  }

  const filename = ($("filename").el as HTMLInputElement).value.trim();
  const mimeType = ($("mimeType").el as HTMLInputElement).value.trim();
  const content = ($("documentContent").el as HTMLTextAreaElement).value;

  if (!content) {
    throw new Error("Provide either a file or text content.");
  }

  return {
    document: {
      filename,
      content,
    },
    parameters: {
      level,
      ...(containerValue ? { container: containerValue } : {}),
    },
    payloadMimeType: mimeType || inferMimeTypeFromFilename(filename),
  };
}

async function serializeFile(file: File) {
  if (isTextLike(file)) {
    return {
      content: await file.text(),
      payloadMimeType: file.type || inferMimeTypeFromFilename(file.name),
    };
  }

  return {
    content: arrayBufferToBase64(await file.arrayBuffer()),
    payloadMimeType: `${file.type || inferMimeTypeFromFilename(file.name)};base64`,
  };
}

function isTextLike(file: File) {
  const type = file.type;
  if (type.startsWith("text/")) {
    return true;
  }
  return /\.(txt|xml|json|html|csv|md)$/i.test(file.name);
}

function inferMimeTypeFromFilename(filename: string) {
  if (/\.xml$/i.test(filename)) {
    return "application/xml";
  }
  if (/\.html?$/i.test(filename)) {
    return "text/html";
  }
  if (/\.json$/i.test(filename)) {
    return "application/json";
  }
  if (/\.pdf$/i.test(filename)) {
    return "application/pdf";
  }
  return "text/plain";
}

function arrayBufferToBase64(arrayBuffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(arrayBuffer);
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function setQrUrl(url: string) {
  const qrField = $("qrUrl").el as HTMLTextAreaElement;
  qrField.value = url;
  const qrImage = $("qrImage").el as HTMLElement;
  qrImage.hidden = false;
  renderQrCode("qrImage", url);
}

function hideQrImage() {
  for (const id of ["qrImage", "qrImageNoJwt"]) {
    const el = $(id).el as HTMLElement;
    el.hidden = true;
    el.replaceChildren();
  }
}

function setQrUrlNoJwt(url: string) {
  const qrField = $("qrUrlNoJwt").el as HTMLTextAreaElement;
  qrField.value = url;
  const qrImage = $("qrImageNoJwt").el as HTMLElement;
  qrImage.hidden = false;
  renderQrCode("qrImageNoJwt", url);
}

async function showPairingQr() {
  const jwt = await integrationInternals.getIntegrationBearerToken(true);
  const url = integrationInternals.apiClient.qrCodeRegisterIntegrationUrl(jwt);
  const pairEl = $("pairingQrImage").el as HTMLElement;
  pairEl.hidden = false;
  renderQrCode("pairingQrImage", url);
}

function hidePairingQr() {
  const pairEl = $("pairingQrImage").el as HTMLElement;
  pairEl.hidden = true;
  pairEl.replaceChildren();
}

function renderSignedDocument(signedDocument: AVMSignedDocument) {
  $("signedMetadata").j = {
    filename: signedDocument.filename,
    mimeType: signedDocument.mimeType,
    signers: signedDocument.signers,
  };

  clearElement("signedPreview");
  const previewRoot = $("signedPreview").el;
  previewRoot.appendChild(
    showSignedPreview({
      mimeType: signedDocument.mimeType,
      content: signedDocument.content,
    })
  );

  const downloadButton = document.createElement("button");
  downloadButton.className = "secondary";
  downloadButton.textContent = "Download signed file";
  downloadButton.addEventListener("click", () => {
    downloadSignedDocument({
      filename: signedDocument.filename,
      mimeType: signedDocument.mimeType,
      content: signedDocument.content,
    });
  });
  previewRoot.appendChild(downloadButton);
}

function bindFileInput() {
  ($("fileInput").el as HTMLInputElement).addEventListener("change", () => {
    const file = ($("fileInput").el as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    ($("filename").el as HTMLInputElement).value = file.name;
    if (file.type) {
      ($("mimeType").el as HTMLInputElement).value = file.type;
    } else {
      ($("mimeType").el as HTMLInputElement).value = inferMimeTypeFromFilename(
        file.name
      );
    }
    logEvent(`Selected file ${file.name}.`);
  });
}

function installGlobalFunctions() {
  globalThis["loadOrRegisterIntegration"] = runAction(loadOrRegisterIntegration);
  globalThis["resetIntegrationState"] = runAction(resetIntegrationState);
  globalThis["createSigningSession"] = runAction(createSigningSession);
  globalThis["waitForSignature"] = runAction(waitForSignature);
  globalThis["abortWaiting"] = abortWaiting;
  globalThis["copyQrUrl"] = runAction(copyQrUrl);
  globalThis["openQrUrl"] = runAction(async () => openQrUrl());
  globalThis["copyQrUrlNoJwt"] = runAction(copyQrUrlNoJwt);
  globalThis["openQrUrlNoJwt"] = runAction(async () => openQrUrlNoJwt());
}

function runAction(action: () => Promise<void>) {
  return async () => {
    try {
      await action();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error";
      setStatus(message);
      logEvent(`Error: ${message}`);
      console.error(error);
    }
  };
}

bindFileInput();
installGlobalFunctions();
applyBaseUrl();