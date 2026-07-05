import { del, get, set } from "idb-keyval";
import {
  AutogramVMobileClientApiClient,
  AutogramVMobileIntegration,
  createDeviceJwt,
  type AVMDeviceIntegrationsResponse,
  type AVMDocumentToSign,
  type AVMDocumentDataToSignResponse,
  type AVMDocumentVisualizationResponse,
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

type SigningParameters = NonNullable<AVMDocumentToSign["parameters"]>;
type SignatureLevel = NonNullable<SigningParameters["level"]>;
type SignatureContainer = NonNullable<SigningParameters["container"]>;
type DevicePlatform = "android" | "ios";
type DeviceRequest = {
  guid: string;
  key: string;
  integrationToken: string | null;
  source: string;
};
type PushInboxItem = {
  id: string;
  title: string;
  body: string;
  source: string;
  receivedAt: string;
  rawPayload?: unknown;
};
type PushWorkerMessage =
  | {
      type: "avm-push-sync";
      items: PushInboxItem[];
    }
  | {
      type: "avm-push-received";
      item: PushInboxItem;
    }
  | {
      type: "avm-push-activate";
      item: PushInboxItem;
    };

const integration = new AutogramVMobileIntegration({
  get,
  set,
});
const mobileApiClient = new AutogramVMobileClientApiClient();

const deviceKeys = {
  guid: "avmDeviceGuid",
  keyPair: "avmDeviceKeyPair",
  pushKey: "avmDevicePushKey",
  registrationId: "avmDeviceRegistrationId",
};

let documentRef: AVMIntegrationDocument | null = null;
let waitAbortController: AbortController | null = null;
let deviceKeyPair: CryptoKeyPair | null = null;
let deviceGuid: string | null = null;
let devicePushKey: string | null = null;
let deviceRegistrationId: string | null = null;
let currentDeviceRequest: DeviceRequest | null = null;
let currentDeviceDataToSign: AVMDocumentDataToSignResponse | null = null;
let pushInbox: PushInboxItem[] = [];
let pushWorkerRegistration: ServiceWorkerRegistration | null = null;
let pushWorkerBound = false;
let testSignerPrivateKey: CryptoKey | null = null;

const TEST_SIGNER_CERTIFICATE_BASE64_DER =
  "MIIDbTCCAlWgAwIBAgIUJjb31j60fS42yFeZtPYGb43rVgswDQYJKoZIhvcNAQELBQAwRjELMAkGA1UEBhMCU0sxGTAXBgNVBAoMEEF1dG9ncmFtIEV4YW1wbGUxHDAaBgNVBAMME0Jyb3dzZXIgVGVzdCBTaWduZXIwHhcNMjYwNzA1MTkwMzA4WhcNMzYwNzAyMTkwMzA4WjBGMQswCQYDVQQGEwJTSzEZMBcGA1UECgwQQXV0b2dyYW0gRXhhbXBsZTEcMBoGA1UEAwwTQnJvd3NlciBUZXN0IFNpZ25lcjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANx1SHbsMqvlLBMj7sOJWwPS7umhb74mS+gWzdVTq6imkfjl/ZvMeqRD4sHW10i2o58QbuEeQZtNZL0FV4RUc9MIA9pzMS+XAbGQTSg2HGxeBsN+JDwQJG9wiQt9xUOSfOZQGegodw7LJkkucAFEDquK3ph/1gwmd4GEsCnnP5EffIX3g6FFutmg5Li8JC6jibMLfd7v7rKMdF58zJinusUrsFOVAIIxiYkENmmOokE21ofJuDwkJ7lZa2aa2ZuJTm1vTGk8wThtDIULkWzwk1I11btTdOX523ekjQElUcwMUVRL+hAK4ln2p/ZPR1oaU9zH+4Gk5P0/ZX0PqB4bGdsCAwEAAaNTMFEwHQYDVR0OBBYEFJZZrHJPrtQwVg1M9xh8CzFUYC0vMB8GA1UdIwQYMBaAFJZZrHJPrtQwVg1M9xh8CzFUYC0vMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBAMVurtsyBOHCMYSzkQMvo/y84h+D83LVnu5a4P9yh+AZ9N1etUvGC9EZwTuQOGFVaIJFSsLx8VI4pgX63Ob9F1fqPVdaDunWouP06m/TCdZ10oHxyAxOL5t08sRjWTHXvUEU9EdWXfP9Ucf7cWZDx7xbrVpisTdw5g3AlkGyBrBVk+tLk5t1937nDcXmHCfqx01k3QTzTbn1rOWxG0lbntDS516RBaCAQpDEQqp2HMZnqSKi39OmHZJAHZ3ZU2Ho49KYEGg97V1Fu5YFzd9NMBSbfc6OqfkBZG4bmMXG/P08aucWiEsbyH+/gD69or+vM4yqhe9usoHGGBBu3wUPiD8=";
const TEST_SIGNER_PRIVATE_KEY_PKCS8_BASE64 =
  "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDcdUh27DKr5SwTI+7DiVsD0u7poW++JkvoFs3VU6uoppH45f2bzHqkQ+LB1tdItqOfEG7hHkGbTWS9BVeEVHPTCAPaczEvlwGxkE0oNhxsXgbDfiQ8ECRvcIkLfcVDknzmUBnoKHcOyyZJLnABRA6rit6Yf9YMJneBhLAp5z+RH3yF94OhRbrZoOS4vCQuo4mzC33e7+6yjHRefMyYp7rFK7BTlQCCMYmJBDZpjqJBNtaHybg8JCe5WWtmmtmbiU5tb0xpPME4bQyFC5Fs8JNSNdW7U3Tl+dt3pI0BJVHMDFFUS/oQCuJZ9qf2T0daGlPcx/uBpOT9P2V9D6geGxnbAgMBAAECggEAKW0Uh9xMjUaMKLCY3j+CTc6mPFqsn8Ocgek/FnYZjKB4T5gQNuWOqi1jf986JxzC1FIHM+A2ndNGOcq2LlScSyx3ZOY+eN3cYJxoE0VPxAFLLhMXBf5WimZQKkug9NijBbhJlfl8ndgIwrmqLGK4iv2WZHupIjFcRYdEfytII6G4oWOgCnUKvgzxPwv5TYfPVRwoZTFlUf82ryFMzPKOvOqZHDu6D2da9jFVDf/ddJy+Dwd/jkvs0p3jWi1QjZNqjPVmXk199h6itHx2agiwETZQaAHYcGqqRlpN+YxNpvKvI2YG1yN76ET/6J+JtT0oyz4udUnEo3zqqm/l1VJqEQKBgQD6bGIcXhrVytTpv7LuQC3fz7Ny7GZTZoY7s8tmyDrg0ycY1649KJAoQQb2ve1B0ikw1aAeHqnIMQmpJY8bimOGci0J2ylo575WjjC9c8fXJ9jd1ajTueKHCnWMvJmJgeTCsrOWCt80zNwbGsbekP+ks+Re5KLSY3b/OxHOsqK32QKBgQDhXhLZErW16NMFbeD6smwqoLBBTMKjJYOzyPB4Ci/Io+QUS+1IyItxAY33nQ9VfVSPj9ScIsTVA1bDz9KKWX1AxVDd7ZkGYNfFIwEZpKe5hwwiEZCYGnYGI8qHCYYqYaM4nDU1M/T2v+kiXsbejWJRW4Hv0QjvIbOmcVWL+zDi0wKBgAdEifxkxsaZomA+TgUYG7y5HG4jajzVZuPoreiHux23QxU3fTkNKlHgwUD79hzI6qUeLg1xul+y/KLKEkMsWwMV4TS+BY+j2iRM8CEvcQdPgr29a67pYCenKA4zkwkomekEoq2iFyRDJcgrmMXw01qGVgRjAk600ElL/5JOIObRAoGBANkrXvxBFEtcNWTo8kCCiMs3F0GFp5WxQ82Ol3MFVfCBRfrtA5X8cqqN9fEjLzCRWlgRIK7orkYaNpTwghEBlTpCKeAB4lEMJ0B3r8q3KU0VvvJhfLWl4g+ek742xku21KNrm7ZOAAN7ATw2mmrBUXnWtUqUY4iUMFr2oZoHj58zAoGBAKZ4cfPISF9JrecMb5vFmEfEociVAAQvjkptp2oix2Dtqz/W1leI7d1jg8l8VYNewo3W4qcj2OzZzFW3MHJ38HYx1RUdDnShGBKOjp1/1/P/ExHpZ8m1P6o9XeuYjtwXXHecmFM+EDxX4zaHt/WhuNtPB8F1qp8I0nP4AQu3Jc2g";

function currentBaseUrl() {
  return ($("baseUrl").el as HTMLInputElement).value.trim();
}

function currentDeviceDisplayName() {
  return (
    ($("deviceDisplayName").el as HTMLInputElement).value.trim() ||
    "Example browser device"
  );
}

function currentDevicePlatform() {
  return ($("devicePlatform").el as HTMLSelectElement).value as DevicePlatform;
}

function applyBaseUrl() {
  const baseUrl = currentBaseUrl();
  integration.setBaseUrl(baseUrl);
  mobileApiClient.baseUrl = baseUrl;
}

function logEvent(message: string) {
  appendLog("eventLog", `[${new Date().toLocaleTimeString()}] ${message}`);
}

function setStatus(message: string) {
  setText("statusOutput", message);
}

function logDevice(message: string) {
  appendLog(
    "deviceEventLog",
    `[${new Date().toLocaleTimeString()}] ${message}`
  );
}

function setDeviceStatus(message: string) {
  setText("deviceStatusOutput", message);
}

function setPushStatus(message: string) {
  setText("pushStatusOutput", message);
}

async function loadOrRegisterIntegration() {
  applyBaseUrl();
  setStatus("Loading integration state...");
  logEvent(`Using AVM server ${integration.getBaseUrl()}`);
  await integration.loadOrRegister({
    platform: "web",
    displayName: "AVM example integration",
  });
  const state = {
    baseUrl: integration.getBaseUrl(),
    integrationGuid: integration.getIntegrationGuid(),
    persistedKeys: true,
  };
  $("integrationState").j = state;
  setStatus("Integration ready.");
  logEvent(`Integration ready: ${integration.getIntegrationGuid()}`);
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

async function loadOrRegisterDevice() {
  applyBaseUrl();
  setDeviceStatus("Loading device state...");
  await loadPersistedDeviceState();

  if (!deviceKeyPair) {
    deviceKeyPair = await generateDeviceKeyPair();
    await set(deviceKeys.keyPair, deviceKeyPair);
    logDevice("Generated a new device key pair.");
  }

  if (!devicePushKey) {
    devicePushKey = await generatePushKey();
    await set(deviceKeys.pushKey, devicePushKey);
    logDevice("Generated a push encryption key for the simulated device.");
  }

  if (!deviceRegistrationId) {
    deviceRegistrationId = `browser-${globalThis.crypto.randomUUID()}`;
    await set(deviceKeys.registrationId, deviceRegistrationId);
  }

  if (!deviceGuid) {
    setDeviceStatus("Registering device...");
    const response = await mobileApiClient.postDevice({
      platform: currentDevicePlatform(),
      registrationId: deviceRegistrationId,
      displayName: currentDeviceDisplayName(),
      publicKey: await exportPublicKeyPem(deviceKeyPair.publicKey),
      pushkey: devicePushKey,
    });

    if (!response.guid) {
      throw new Error("Device registration succeeded without a GUID.");
    }

    deviceGuid = response.guid;
    await set(deviceKeys.guid, deviceGuid);
    logDevice(`Device registered with GUID ${deviceGuid}.`);
  } else {
    logDevice(`Reusing registered device ${deviceGuid}.`);
  }

  await refreshPairedIntegrations();
  setDeviceStatus("Device ready.");
}

async function resetDeviceState() {
  await Promise.all([
    del(deviceKeys.guid),
    del(deviceKeys.keyPair),
    del(deviceKeys.pushKey),
    del(deviceKeys.registrationId),
  ]);

  deviceKeyPair = null;
  deviceGuid = null;
  devicePushKey = null;
  deviceRegistrationId = null;
  currentDeviceRequest = null;
  currentDeviceDataToSign = null;

  $("deviceState").w = "Saved device state removed.";
  $("pairedIntegrations").w = "No paired integrations loaded yet.";
  $("incomingRequestState").w = "No request loaded yet.";
  $("incomingRequestParameters").w = "No request parameters loaded yet.";
  $("dataToSignState").w = "No dataToSign prepared yet.";
  $("deviceSignedMetadata").w = "No completed AVM document yet.";
  pushInbox = [];
  ($("pairingTokenInput").el as HTMLTextAreaElement).value = "";
  ($("incomingRequestInput").el as HTMLTextAreaElement).value = "";
  ($("signingCertificateInput").el as HTMLTextAreaElement).value = "";
  ($("signedDataInput").el as HTMLTextAreaElement).value = "";
  clearElement("incomingRequestPreview");
  clearElement("deviceSignedPreview");
  renderPushInbox();
  setDeviceStatus("Device state reset.");
  logDevice("Cleared persisted device GUID, key pair, and push key.");
}

async function createSigningSession() {
  await ensureIntegrationReady();
  const payload = await buildDocumentToSign();
  setStatus("Uploading document...");
  logEvent(`Uploading ${payload.document.filename || "unnamed document"}.`);
  documentRef = await integration.addDocument(payload);
  $('documentState').j = documentRef;
  if (!documentRef) {
    throw new Error('Document upload finished without a document reference.');
  }
  logEvent(`Document uploaded with GUID ${documentRef.guid}.`);

  await integration.sendNotification(documentRef);
  logEvent('Push notification sent to paired devices.');

  const qrUrl = await integration.getQrCodeUrl(documentRef, true);
  const qrUrlNoJwt = await integration.getQrCodeUrl(documentRef, false);
  setQrUrl(qrUrl);
  setQrUrlNoJwt(qrUrlNoJwt);
  setStatus('Signing session created.');
}

async function waitForSignature() {
  if (!documentRef) {
    throw new Error("Create a signing session before waiting for signature.");
  }

  waitAbortController?.abort("New wait started");
  waitAbortController = new AbortController();
  setStatus('Waiting for signature...');
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

async function pairDeviceFromInput() {
  await ensureDeviceReady();
  const rawInput = ($("pairingTokenInput").el as HTMLTextAreaElement).value.trim();
  if (!rawInput) {
    throw new Error("Paste an integration token or AVM URL first.");
  }

  const pairingToken = extractIntegrationToken(rawInput);
  if (!pairingToken) {
    throw new Error("The provided value does not contain an integration token.");
  }

  const request = tryParseDeviceRequest(rawInput);

  setDeviceStatus("Pairing device with integration...");
  await mobileApiClient.postDeviceIntegrations(
    { integrationPairingToken: pairingToken },
    await generateCurrentDeviceJwt()
  );
  await refreshPairedIntegrations();

  if (request) {
    currentDeviceRequest = request;
    ($("incomingRequestInput").el as HTMLTextAreaElement).value = request.source;
    $("incomingRequestState").j = request;
  }

  setDeviceStatus("Pairing stored on AVM server.");
  logDevice("Device paired with the supplied integration token.");
}

async function loadIncomingRequest() {
  const rawInput = ($("incomingRequestInput").el as HTMLTextAreaElement).value.trim();
  if (!rawInput) {
    throw new Error("Paste an AVM URL or query string first.");
  }
  await hydrateIncomingRequest(rawInput);
}

async function loadIncomingRequestFromLocation() {
  const currentUrl = window.location.href;
  await hydrateIncomingRequest(currentUrl);
  ($("incomingRequestInput").el as HTMLTextAreaElement).value = currentUrl;
}

async function hydrateIncomingRequest(rawInput: string) {
  const parsed = parseDeviceRequest(rawInput);
  currentDeviceRequest = parsed;
  currentDeviceDataToSign = null;

  if (parsed.integrationToken) {
    ($("pairingTokenInput").el as HTMLTextAreaElement).value = parsed.source;
  }

  $("incomingRequestState").j = parsed;
  $("dataToSignState").w = "No dataToSign prepared yet.";
  $("deviceSignedMetadata").w = "No completed AVM document yet.";
  clearElement("deviceSignedPreview");
  setDeviceStatus("Loading visualization and signing parameters...");

  const [visualization, parameters] = await Promise.all([
    mobileApiClient.getDocumentVisualization(
      { guid: parsed.guid },
      parsed.key
    ),
    mobileApiClient.getDocumentSignatureParameters(
      { guid: parsed.guid },
      parsed.key
    ),
  ]);

  renderVisualization(visualization);
  $("incomingRequestParameters").j = parameters;
  setDeviceStatus("Incoming request loaded.");
  logDevice(`Loaded AVM request for document ${parsed.guid}.`);
}

async function prepareDataToSign() {
  if (!currentDeviceRequest) {
    throw new Error("Load an incoming request before preparing dataToSign.");
  }

  const signingCertificate =
    ($("signingCertificateInput").el as HTMLTextAreaElement).value.trim();
  if (!signingCertificate) {
    throw new Error("Paste the signing certificate first.");
  }

  setDeviceStatus("Preparing dataToSign...");
  currentDeviceDataToSign = await mobileApiClient.postDocumentDataToSign(
    { guid: currentDeviceRequest.guid },
    {
      signingCertificate,
      addTimestamp: ($("addTimestamp").el as HTMLInputElement).checked,
    },
    currentDeviceRequest.key
  );

  $("dataToSignState").j = currentDeviceDataToSign;
  setDeviceStatus("dataToSign prepared.");
  logDevice("Prepared AVM dataToSign structure.");
}

function useBuiltInTestSigner() {
  ($("signingCertificateInput").el as HTMLTextAreaElement).value =
    TEST_SIGNER_CERTIFICATE_BASE64_DER;
  logDevice("Loaded built-in browser test signing certificate.");
}

async function getTestSignerPrivateKey() {
  if (testSignerPrivateKey) {
    return testSignerPrivateKey;
  }

  testSignerPrivateKey = await globalThis.crypto.subtle.importKey(
    "pkcs8",
    base64ToArrayBuffer(TEST_SIGNER_PRIVATE_KEY_PKCS8_BASE64),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  return testSignerPrivateKey;
}

async function signPreparedDataToSignWithTestSigner() {
  if (!currentDeviceDataToSign) {
    throw new Error("Prepare dataToSign before generating a test signature.");
  }

  const privateKey = await getTestSignerPrivateKey();
  const signatureBuffer = await globalThis.crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    privateKey,
    base64ToArrayBuffer(currentDeviceDataToSign.dataToSign)
  );

  ($("signedDataInput").el as HTMLTextAreaElement).value =
    arrayBufferToBase64(signatureBuffer);
  logDevice("Generated signedData using the built-in browser test signer.");
}

async function completeRequestWithTestSigner() {
  useBuiltInTestSigner();
  await prepareDataToSign();
  await signPreparedDataToSignWithTestSigner();
  await submitSignedResponse();
}

async function submitSignedResponse() {
  if (!currentDeviceRequest) {
    throw new Error("Load an incoming request before submitting a response.");
  }
  if (!currentDeviceDataToSign) {
    throw new Error("Prepare dataToSign before submitting the signed response.");
  }

  const signedData = ($("signedDataInput").el as HTMLTextAreaElement).value.trim();
  if (!signedData) {
    throw new Error("Paste the Base64 signedData value first.");
  }

  setDeviceStatus("Submitting signed response to AVM...");
  const signedDocument = await mobileApiClient.postDocumentSign(
    { guid: currentDeviceRequest.guid },
    {
      signedData,
      dataToSignStructure: currentDeviceDataToSign,
    },
    currentDeviceRequest.key
  );

  const normalizedSignedDocument: AVMSignedDocument = {
    filename: signedDocument.filename,
    mimeType: signedDocument.mimeType,
    content: signedDocument.content,
    signers: [
      {
        signedBy: signedDocument.signedBy,
        issuedBy: signedDocument.issuedBy,
      },
    ],
  };

  renderSignedDocument(
    normalizedSignedDocument,
    "deviceSignedMetadata",
    "deviceSignedPreview"
  );
  setDeviceStatus("Signed response accepted by AVM.");
  logDevice("AVM returned the completed signed document.");
}

async function initializePushInbox() {
  const registration = await ensurePushWorker();

  if (Notification.permission === "default") {
    const permission = await Notification.requestPermission();
    if (permission === "denied") {
      setPushStatus(
        "Browser push inbox registered, but notification permission is denied."
      );
      await refreshPushInbox();
      return;
    }
  }

  setPushStatus(
    `Browser push inbox ready. Notification permission: ${Notification.permission}.`
  );
  registration.active?.postMessage({ type: "avm-push-get-notifications" });
}

async function refreshPushInbox() {
  const registration = await ensurePushWorker();
  registration.active?.postMessage({ type: "avm-push-get-notifications" });
  setPushStatus(
    `Requested inbox refresh. Notification permission: ${Notification.permission}.`
  );
}

async function clearPushInbox() {
  const registration = await ensurePushWorker();
  registration.active?.postMessage({ type: "avm-push-clear-notifications" });
  pushInbox = [];
  renderPushInbox();
  setPushStatus("Cleared browser push inbox.");
}

async function activatePushNotification(notificationId: string) {
  const item = pushInbox.find((candidate) => candidate.id === notificationId);
  if (!item) {
    throw new Error("Selected push notification was not found in the inbox.");
  }
  if (!item.source) {
    throw new Error("Selected push notification does not contain an AVM URL.");
  }

  ($("incomingRequestInput").el as HTMLTextAreaElement).value = item.source;
  await hydrateIncomingRequest(item.source);
  setDeviceStatus(`Activated push notification ${item.title}.`);
  logDevice(`Activated push notification ${item.id}.`);
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
  if (!integration.getIntegrationGuid()) {
    await loadOrRegisterIntegration();
  }
}

async function ensureDeviceReady() {
  if (!deviceGuid) {
    await loadOrRegisterDevice();
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

function base64ToArrayBuffer(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
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
  const url = await integration.getPairingQrCodeUrl();
  const pairEl = $("pairingQrImage").el as HTMLElement;
  const pairUrl = $("pairingQrUrl").el as HTMLTextAreaElement;
  pairEl.hidden = false;
  pairUrl.value = url;
  renderQrCode("pairingQrImage", url);
}

function hidePairingQr() {
  const pairEl = $("pairingQrImage").el as HTMLElement;
  const pairUrl = $("pairingQrUrl").el as HTMLTextAreaElement;
  pairEl.hidden = true;
  pairEl.replaceChildren();
  pairUrl.value = "";
}

function renderSignedDocument(
  signedDocument: AVMSignedDocument,
  metadataSelector = "signedMetadata",
  previewSelector = "signedPreview"
) {
  $(metadataSelector).j = {
    filename: signedDocument.filename,
    mimeType: signedDocument.mimeType,
    signers: signedDocument.signers,
  };

  clearElement(previewSelector);
  const previewRoot = $(previewSelector).el;
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

function renderVisualization(visualization: AVMDocumentVisualizationResponse) {
  clearElement("incomingRequestPreview");
  const previewRoot = $("incomingRequestPreview").el;
  previewRoot.appendChild(
    showSignedPreview({
      mimeType: visualization.mimeType,
      content: visualization.content,
    })
  );

  if (visualization.filename) {
    const caption = document.createElement("div");
    caption.className = "muted";
    caption.textContent = `Visualization filename: ${visualization.filename}`;
    previewRoot.appendChild(caption);
  }
}

function renderPushInbox() {
  const container = $("pushNotificationList").el;
  container.replaceChildren();

  if (!pushInbox.length) {
    const empty = document.createElement("p");
    empty.className = "muted";
    empty.textContent = "No push notifications received yet.";
    container.appendChild(empty);
    return;
  }

  for (const item of pushInbox) {
    const article = document.createElement("article");
    article.className = "notification-item";

    const header = document.createElement("header");
    const title = document.createElement("h3");
    title.textContent = item.title;
    const time = document.createElement("time");
    time.dateTime = item.receivedAt;
    time.textContent = new Date(item.receivedAt).toLocaleString();
    header.append(title, time);

    const body = document.createElement("p");
    body.textContent = item.body;

    article.append(header, body);

    if (item.source) {
      const source = document.createElement("pre");
      source.textContent = item.source;
      article.appendChild(source);

      const actions = document.createElement("div");
      actions.className = "button-row";

      const activateButton = document.createElement("button");
      activateButton.className = "secondary";
      activateButton.textContent = "Activate";
      activateButton.addEventListener("click", () => {
        void activatePushNotification(item.id);
      });
      actions.appendChild(activateButton);
      article.appendChild(actions);
    }

    container.appendChild(article);
  }
}

function renderDeviceState(
  pairedIntegrations: AVMDeviceIntegrationsResponse = []
) {
  $("deviceState").j = {
    baseUrl: currentBaseUrl(),
    deviceGuid,
    registrationId: deviceRegistrationId,
    platform: currentDevicePlatform(),
    displayName: currentDeviceDisplayName(),
    persistedKeys: Boolean(deviceKeyPair && devicePushKey),
    pairedIntegrations: pairedIntegrations.length,
  };
}

async function generateCurrentDeviceJwt() {
  if (!deviceGuid || !deviceKeyPair) {
    throw new Error("Device not ready");
  }
  return createDeviceJwt(deviceGuid, deviceKeyPair);
}

async function refreshPairedIntegrations() {
  const pairedIntegrations = await mobileApiClient.getDeviceIntegrations(
    await generateCurrentDeviceJwt()
  );
  $("pairedIntegrations").j = pairedIntegrations;
  renderDeviceState(pairedIntegrations);
}

async function ensurePushWorker() {
  if (!supportsPushInbox()) {
    setPushStatus("Push API is not available in this browser.");
    throw new Error("Push API is not available in this browser.");
  }

  if (!pushWorkerBound) {
    navigator.serviceWorker.addEventListener("message", onPushWorkerMessage);
    pushWorkerBound = true;
  }

  if (pushWorkerRegistration) {
    return pushWorkerRegistration;
  }

  const registration = await navigator.serviceWorker.register("./push-sw.js");
  pushWorkerRegistration = await navigator.serviceWorker.ready;
  setPushStatus(
    `Browser push inbox registered. Notification permission: ${Notification.permission}.`
  );

  if (registration.active && !pushWorkerRegistration.active) {
    pushWorkerRegistration = registration;
  }

  return pushWorkerRegistration;
}

function supportsPushInbox() {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function onPushWorkerMessage(event: MessageEvent<PushWorkerMessage>) {
  const data = event.data;
  if (!data) {
    return;
  }

  if (data.type === "avm-push-sync") {
    pushInbox = sortPushInbox(data.items);
    renderPushInbox();
    return;
  }

  if (data.type === "avm-push-received") {
    pushInbox = sortPushInbox(upsertPushInboxItem(pushInbox, data.item));
    renderPushInbox();
    setPushStatus(`Received push notification: ${data.item.title}.`);
    logDevice(`Received push notification ${data.item.id}.`);
    return;
  }

  if (data.type === "avm-push-activate") {
    pushInbox = sortPushInbox(upsertPushInboxItem(pushInbox, data.item));
    renderPushInbox();
    void activatePushNotification(data.item.id);
  }
}

function upsertPushInboxItem(items: PushInboxItem[], nextItem: PushInboxItem) {
  const withoutExisting = items.filter((item) => item.id !== nextItem.id);
  return [nextItem, ...withoutExisting];
}

function sortPushInbox(items: PushInboxItem[]) {
  return [...items].sort((left, right) =>
    right.receivedAt.localeCompare(left.receivedAt)
  );
}

async function loadPersistedDeviceState() {
  const [storedGuid, storedKeyPair, storedPushKey, storedRegistrationId] =
    await Promise.all([
      get<string>(deviceKeys.guid),
      get<CryptoKeyPair>(deviceKeys.keyPair),
      get<string>(deviceKeys.pushKey),
      get<string>(deviceKeys.registrationId),
    ]);

  deviceGuid = storedGuid ?? null;
  deviceKeyPair = storedKeyPair ?? null;
  devicePushKey = storedPushKey ?? null;
  deviceRegistrationId = storedRegistrationId ?? null;
  renderDeviceState();
}

async function generateDeviceKeyPair() {
  return globalThis.crypto.subtle.generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    true,
    ["sign", "verify"]
  );
}

async function generatePushKey() {
  const key = await globalThis.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
  return arrayBufferToBase64(
    await globalThis.crypto.subtle.exportKey("raw", key)
  );
}

async function exportPublicKeyPem(key: CryptoKey) {
  const base64Key = arrayBufferToBase64(
    await globalThis.crypto.subtle.exportKey("spki", key)
  );
  return `-----BEGIN PUBLIC KEY-----\n${base64Key}\n-----END PUBLIC KEY-----`;
}

function extractIntegrationToken(input: string) {
  const deviceRequest = tryParseDeviceRequest(input);
  if (deviceRequest) {
    return deviceRequest.integrationToken;
  }

  const trimmed = input.trim();
  const url = tryParseUrl(trimmed);
  if (url) {
    const token = url.searchParams.get("integration");
    if (token) return token;
  }

  const searchInput = trimmed.startsWith("?") ? trimmed.slice(1) : trimmed;
  const integrationParam = new URLSearchParams(searchInput).get("integration");
  if (integrationParam) return integrationParam;

  return normalizeJwt(trimmed);
}

function parseDeviceRequest(input: string): DeviceRequest {
  const parsed = tryParseDeviceRequest(input);
  if (!parsed) {
    throw new Error("The provided value does not contain guid and key parameters.");
  }
  return parsed;
}

function tryParseDeviceRequest(input: string): DeviceRequest | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const directUrl = tryParseUrl(trimmed);
  if (directUrl) {
    const parsed = parseRequestFromSearchParams(directUrl.searchParams, trimmed);
    if (parsed) {
      return parsed;
    }
  }

  const searchInput = trimmed.startsWith("?") ? trimmed.slice(1) : trimmed;
  const searchParams = new URLSearchParams(searchInput);
  return parseRequestFromSearchParams(searchParams, trimmed);
}

function parseRequestFromSearchParams(
  searchParams: URLSearchParams,
  source: string
) {
  const guid = searchParams.get("guid");
  const key = searchParams.get("key");

  if (!guid || !key) {
    return null;
  }

  return {
    guid,
    key,
    integrationToken: searchParams.get("integration"),
    source,
  };
}

function normalizeJwt(input: string) {
  const trimmed = input.trim();
  return trimmed.split(".").length === 3 ? trimmed : null;
}

function tryParseUrl(input: string) {
  try {
    return new URL(input);
  } catch {
    return null;
  }
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
  globalThis["loadOrRegisterDevice"] = runAction(loadOrRegisterDevice, true);
  globalThis["resetDeviceState"] = runAction(resetDeviceState, true);
  globalThis["pairDeviceFromInput"] = runAction(pairDeviceFromInput, true);
  globalThis["loadIncomingRequest"] = runAction(loadIncomingRequest, true);
  globalThis["loadIncomingRequestFromLocation"] = runAction(
    loadIncomingRequestFromLocation,
    true
  );
  globalThis["prepareDataToSign"] = runAction(prepareDataToSign, true);
  globalThis["useBuiltInTestSigner"] = runAction(
    async () => useBuiltInTestSigner(),
    true
  );
  globalThis["signPreparedDataToSignWithTestSigner"] = runAction(
    signPreparedDataToSignWithTestSigner,
    true
  );
  globalThis["completeRequestWithTestSigner"] = runAction(
    completeRequestWithTestSigner,
    true
  );
  globalThis["submitSignedResponse"] = runAction(submitSignedResponse, true);
  globalThis["initializePushInbox"] = runAction(initializePushInbox, true);
  globalThis["refreshPushInbox"] = runAction(refreshPushInbox, true);
  globalThis["clearPushInbox"] = runAction(clearPushInbox, true);
}

function runAction(action: () => Promise<void>, useDeviceStatus = false) {
  return async () => {
    try {
      await action();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected error";
      if (useDeviceStatus) {
        setDeviceStatus(message);
        logDevice(`Error: ${message}`);
      } else {
        setStatus(message);
        logEvent(`Error: ${message}`);
      }
      console.error(error);
    }
  };
}

function preloadIncomingRequestFromLocation() {
  const currentUrl = window.location.href;
  const request = tryParseDeviceRequest(currentUrl);
  if (!request) {
    return;
  }

  ($("incomingRequestInput").el as HTMLTextAreaElement).value = currentUrl;
  if (request.integrationToken) {
    ($("pairingTokenInput").el as HTMLTextAreaElement).value = currentUrl;
  }

  globalThis["loadIncomingRequestFromLocation"]();
}

async function bootstrapPushInbox() {
  if (!supportsPushInbox()) {
    setPushStatus("Push API is not available in this browser.");
    renderPushInbox();
    return;
  }

  try {
    await ensurePushWorker();
    await refreshPushInbox();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to initialize push inbox.";
    setPushStatus(message);
  }
}

bindFileInput();
installGlobalFunctions();
applyBaseUrl();
useBuiltInTestSigner();
preloadIncomingRequestFromLocation();
void bootstrapPushInbox();
