import { paths } from "./avm-api.generated";
import fetch from "cross-fetch";
import z from "zod";
import { get as idbGet, set as idbSet } from "idb-keyval";
import { SignJWT } from "jose";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return window.btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
}

function randomUUID() {
  return globalThis.crypto.randomUUID();
}

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class AutogramVMobileIntegration {
  apiClient: AutogramVMobileIntegrationApiClient;

  keyPair: CryptoKeyPair | null = null;
  pushKey: CryptoKey | null = null;
  integrationGuid: string | null = null;

  subtleCrypto: SubtleCrypto | null = null;

  documentGuid: string | null = null;
  documentKey: string | null = null;
  documentLastModified: string | null = null;

  constructor() {
    this.apiClient = new AutogramVMobileIntegrationApiClient();
  }

  async loadSubtleCrypto() {
    // We are doing this because of testing in jest jsdom
    if (!this.subtleCrypto) {
      const browserSubtle = globalThis.crypto.subtle;
      if (browserSubtle) {
        this.subtleCrypto = browserSubtle;
        return;
      }

      try {
        const crypto = await import("crypto");
        // @ts-expect-error crypto
        this.subtleCrypto = crypto.webcrypto.subtle;
        return;
      } catch (e) {
        throw new Error("SubtleCrypto not available");
      }
    }
  }

  exportRawBase64(key: CryptoKey): Promise<string> {
    return this.subtleCrypto.exportKey("raw", key).then(arrayBufferToBase64);
  }

  async loadOrRegister() {
    this.loadSubtleCrypto();
    // load
    this.keyPair = await this.getKeyPairFromDb();
    this.pushKey = await this.getPushKeyFromDb();
    this.integrationGuid = await this.getIntegrationGuidFromDb();
    console.log(this.keyPair, this.pushKey);

    if (!this.keyPair || !this.pushKey || !this.integrationGuid) {
      await this.register();
    }

    console.log("keys init", {
      public: await this.getPublicKeyStr(),
      push: await this.getPushKeyStr(),
      guid: this.integrationGuid,
    });
  }

  async getIntegrationBearerToken() {
    return new SignJWT({
      aud: "device",
      sub: this.integrationGuid,
      exp: Math.floor(Date.now() / 1000) + 60,
    })
      .setProtectedHeader({ alg: "ES256" })
      .setJti(randomUUID())
      .setSubject(this.integrationGuid)
      .setAudience("device")
      .setExpirationTime("24h")
      .sign(this.keyPair.privateKey);
  }

  async getQrCodeUrl() {
    if (!this.integrationGuid) {
      throw new Error("Integration guid missing");
    }

    if (!this.documentGuid || !this.documentKey) {
      console.log({
        guid: this.documentGuid,
        key: this.documentKey,
      });
      throw new Error("Document guid or key missing");
    }

    const integration = await this.getIntegrationBearerToken();
    console.log("Integration JWT", integration);

    return this.apiClient.qrCodeUrl({
      guid: this.documentGuid,
      key: this.documentKey,
      pushkey: await this.getPushKeyStr(),
      integration: integration,
    });
  }

  async register() {
    if (this.keyPair && this.pushKey && this.integrationGuid) {
      throw new Error("Already registered.");
    }

    await this.generateKeys();

    const publicKey = await this.getPublicKeyStr();
    const pushKey = await this.getPushKeyStr();

    console.log("Registering integration", publicKey, pushKey);

    const res = await this.apiClient.registerIntegration({
      platform: "extension",
      displayName: "Autogram Extension",
      publicKey:
        "-----BEGIN PUBLIC KEY-----\n" +
        publicKey +
        "\n-----END PUBLIC KEY-----",
      pushkey: pushKey,
    });

    this.integrationGuid = res.guid;
    await this.saveIntegrationGuid(res.guid);

    console.log("Integration registered", res);
  }

  async generateKeys() {
    console.log("Generating keys");
    // ES256
    const keyPair = await this.subtleCrypto.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      true,
      ["sign", "verify"]
    );
    console.log("Key pair generated", keyPair);
    await this.saveKeyPair(keyPair);
    this.keyPair = keyPair;

    // AES256
    const pushKey = await this.subtleCrypto.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
    console.log("Push key generated", pushKey);
    await this.savePushKey(pushKey);
    this.pushKey = pushKey;

    console.log("Keys generated", this.keyPair, this.pushKey);
  }

  private async saveKeyPair(keyPair: CryptoKeyPair) {
    return idbSet("keyPair", keyPair); // TODO: toto je zle, lebo zapisujeme v kontexte webu, nie rozsirenia
  }

  private async getKeyPairFromDb(): Promise<CryptoKeyPair | null> {
    return idbGet("keyPair").then((keyPair) => {
      if (keyPair) {
        return keyPair;
      }
      return null;
    });
  }

  private async savePushKey(pushKey: CryptoKey) {
    return idbSet("pushKey", pushKey);
  }

  private async getPushKeyFromDb(): Promise<CryptoKey | null> {
    return idbGet("pushKey").then((pushKey) => {
      if (pushKey) {
        return pushKey;
      }
      return null;
    });
  }

  private async saveIntegrationGuid(guid: string) {
    return idbSet("integrationGuid", guid);
  }

  private async getIntegrationGuidFromDb(): Promise<string | null> {
    return idbGet("integrationGuid").then((guid) => {
      if (guid) {
        return guid;
      }
      return null;
    });
  }

  async getPublicKeyStr() {
    if (!this.keyPair) {
      throw new Error("Key pair missing");
    }
    return this.subtleCrypto
      .exportKey("spki", this.keyPair.publicKey)
      .then(arrayBufferToBase64);
  }

  async getPushKeyStr() {
    if (!this.pushKey) {
      throw new Error("Push key missing");
    }
    return this.exportRawBase64(this.pushKey);
  }

  async addDocument(
    document: paths["/documents"]["post"]["requestBody"]["content"]["application/json"]
  ) {
    await this.initDocumentKey();
    const res = await this.apiClient.postDocuments(
      document,
      await this.getIntegrationBearerToken(),
      this.documentKey
    );
    this.documentGuid = res.guid;
    this.documentLastModified = res.lastModified;
  }

  async initDocumentKey() {
    const documentKey = await this.subtleCrypto.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
    this.documentKey = await this.exportRawBase64(documentKey);
  }

  async waitForSignature() {
    if (!this.documentGuid || !this.documentKey || !this.documentLastModified) {
      console.log({
        guid: this.documentGuid,
        key: this.documentKey,
        lastModified: this.documentLastModified,
      })
      throw new Error("Document guid, key or last-modified missing");
    }
    while (true) {
      const doc = await this.apiClient.getDocument(
        { guid: this.documentGuid },
        this.documentKey,
        this.documentLastModified
      );
      if (doc.status === "signed") {
        return doc.document;
      } else if (doc.status === "pending") {
        console.log("Document pending");
      }
      await wait(1000);
    }
  }

  reset() {
    this.documentGuid = null;
    this.documentKey = null;
    this.documentLastModified = null;
  }
}

export class AutogramVMobileIntegrationApiClient {
  baseUrl: string;
  constructor() {
    this.baseUrl = "https://autogram.slovensko.digital/api/v1";
  }

  _registerIntegration = "/integrations" as const;
  registerIntegration(
    data: paths[typeof this._registerIntegration]["post"]["requestBody"]["content"]["application/json"]
  ): Promise<z.infer<typeof PostIntegrationResponse>> {
    const requestBody = JSON.stringify(data);
    const url = this.baseUrl + this._registerIntegration;
    console.log("Registering integration", { url, requestBody });
    return (
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      })
        .then(async (res) => {
          const text = await res.text();
          console.log("Integration registration response", {
            text,
            status: res.status,
            statusText: res.statusText,
          });
          return JSON.parse(text);
        })
        // .then((res) => res.json())
        .catch((err) => {
          console.error("Integration registration failed", err);
          throw err;
        })
        .then((res) => PostIntegrationResponse.parse(res))
    );
  }

  _getIntegrationDevices = "/integration-devices" as const;
  getIntegrationDevices() {
    return fetch(this.baseUrl + this._getIntegrationDevices, {
      method: "GET",
    }).then((res) => GetIntegrationDevicesResponseBody.parse(res.json()));
  }

  _documents = "/documents" as const;
  async postDocuments(
    data: paths[typeof this._documents]["post"]["requestBody"]["content"]["application/json"],
    bearerToken: string,
    documentEncryptionKey: string
  ) {
    if (!documentEncryptionKey) {
      throw new Error("Document encryption key missing");
    }
    if (!bearerToken) {
      throw new Error("Bearer token missing");
    }
    const res = await fetch(this.baseUrl + this._documents, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + bearerToken,
        "X-Encryption-Key": documentEncryptionKey,
      },
      body: JSON.stringify(data),
    });

    if (res.status !== 200) {
      console.log("API Error", res.status, res.statusText);
      const json = await res.json();
      throw new Error(JSON.stringify(ApiErrorResponse.parse(json)));
    }
    const json = await res.json();
    return {
      ...PostDocumentsResponse.parse(json),
      lastModified: res.headers.get("Last-Modified"),
    };
  }

  _getDocument = "/documents/{guid}" as const;
  async getDocument(
    params: paths[typeof this._getDocument]["get"]["parameters"]["path"],
    documentEncryptionKey: string,
    documentLastModified?: string
  ): Promise<GetDocumentResult> {
    if (!documentEncryptionKey) {
      throw new Error("Document encryption key missing");
    }
    const res = await fetch(
      this.baseUrl + this._getDocument.replace("{guid}", params.guid),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Encryption-Key": documentEncryptionKey,
          ...(documentLastModified
            ? { "If-Modified-Since": documentLastModified }
            : null),
        },
      }
    );
    if (res.status == 304) {
      return { status: "pending" };
    }
    if (res.status != 200) {
      const error = ApiErrorResponse.parse(await res.json());
      console.error("API Error", error);
      throw new Error(JSON.stringify(error));
    }

    const resJson = await res.json();
    return {
      status: "signed",
      document: GetDocumentsResponse.parse(resJson),
    };
  }

  _signRequest = "/sign-request" as const;
  signRequest(
    data: paths[typeof this._signRequest]["post"]["requestBody"]["content"]["application/json"],
    bearerToken: string
  ) {
    return fetch(this.baseUrl + this._signRequest, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearerToken}`,
      },
      body: JSON.stringify(data),
    }).then((res) => res.json());
  }

  _getQrCodeUrl = "/qr-code" as const;
  qrCodeUrl(
    data: paths[typeof this._getQrCodeUrl]["get"]["parameters"]["query"]
  ) {
    return (
      this.baseUrl +
      this._getQrCodeUrl +
      "?" +
      new URLSearchParams(data).toString()
    );
  }
}

// Zod Types

export const PostIntegrationResponse = z.object({
  guid: z.string(),
});

export const GetIntegrationDevicesResponseBody = z.array(
  z.object({
    deviceId: z.string(),
    platform: z.string(),
    displayName: z.string(),
  })
);

export const PostDocumentsResponse = z.object({
  guid: z.string(),
});

export const ApiErrorResponse = z.object({
  code: z.string(),
  message: z.string(),
  details: z.string().optional(),
});

export const GetDocumentsResponse = z.object({
  filename: z.string(),
  mimeType: z.string(),
  content: z.string(),
  signers: z
    .array(
      z.object({
        signedBy: z.string().optional(),
        issuedBy: z.string().optional(),
      })
    )
    .optional(),
});

type GetDocumentResult =
  | {
      status: "pending";
    }
  | {
      status: "signed";
      document: z.infer<typeof GetDocumentsResponse>;
    };
