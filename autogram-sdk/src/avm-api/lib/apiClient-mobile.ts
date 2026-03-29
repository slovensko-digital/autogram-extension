import { components, paths } from "./avm-api.generated";
import fetch from "cross-fetch";
import z from "zod";
import { SignJWT } from "jose";
import { createLogger } from "../../log";

export async function createDeviceJwt(
  guid: string,
  keyPair: CryptoKeyPair
): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256" })
    .setJti(globalThis.crypto.randomUUID())
    .setSubject(guid)
    .setExpirationTime("15min")
    .sign(keyPair.privateKey);
}

/**
 * ???
 * Probably used for testing(?)
 * @category Autogram V Mobile
 */
export class AutogramVMobileSimulation {
  apiClient: AutogramVMobileClientApiClient;
  guid: string;
  encryptionKey: string;
  log = createLogger("ag-sdk:AutogramVMobileSimulation");

  constructor() {
    this.apiClient = new AutogramVMobileClientApiClient();
  }

  parseUrl(urlString: string) {
    const url = new URL(urlString);
    const guid = url.searchParams.get("guid");
    const encryptionKey = url.searchParams.get("key");
    const integrationJwt = url.searchParams.get("integration");

    this.log.debug({ guid, key: encryptionKey, integrationJwt });
    if (!guid || !encryptionKey) {
      throw new Error("Invalid URL");
    }
    this.guid = guid;
    this.encryptionKey = encryptionKey;
  }

  visualizeDocument() {
    this.log.debug("Document visualized", this.guid, this.encryptionKey);

    return this.apiClient
      .getDocumentVisualization({ guid: this.guid }, this.encryptionKey)
      .then((res) => {
        this.log.debug("Document visualization", res);
        return res;
      });
  }

  async signDocument() {
    const signatureParameters =
      await this.apiClient.getDocumentSignatureParameters(
        { guid: this.guid },
        this.encryptionKey
      );
    this.log.debug("Signature parameters", signatureParameters);

    // const dataToSign = {
    //   dataToSign: signatureParameters.dataToSign,
    //   signingTime: signatureParameters.signingTime,
    //   signingCertificate: signatureParameters.signingCertificate,
    // };
  }
}

/**
 * Client for simulating mobile app. Not used in extension or similar integrations
 */
export class AutogramVMobileClientApiClient {
  baseUrl: string;
  log = createLogger("ag-sdk:AutogramVMobileClientApiClient");

  constructor() {
    this.baseUrl = "https://autogram.slovensko.digital/api/v1";
  }

  // App (mobile) API

  _postDevice = "/devices" as const;
  async postDevice(
    data: NonNullable<
      paths[typeof this._postDevice]["post"]["requestBody"]
    >["content"]["application/json"]
  ) {
    const response = await fetch(this.baseUrl + this._postDevice, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return this.readJsonOrThrow(response, PostDeviceResponse);
  }

  _getDeviceIntegrations = "/device-integrations" as const;
  async getDeviceIntegrations(bearerToken: string) {
    const response = await fetch(this.baseUrl + this._getDeviceIntegrations, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + bearerToken,
      },
    });

    return this.readJsonOrThrow(response, GetDeviceIntegrationsResponse);
  }

  _postDeviceIntegrations = "/device-integrations" as const;
  async postDeviceIntegrations(
    data: NonNullable<
      paths[typeof this._postDeviceIntegrations]["post"]["requestBody"]
    >["content"]["application/json"],
    bearerToken: string
  ) {
    const response = await fetch(this.baseUrl + this._postDeviceIntegrations, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: "Bearer " + bearerToken,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(await this.readErrorText(response));
    }
  }

  _getDocumentVisualization = "/documents/{guid}/visualization" as const;
  async getDocumentVisualization(
    params: paths[typeof this._getDocumentVisualization]["get"]["parameters"]["path"],
    documentEncryptionKey: string
  ) {
    const response = await fetch(
      this.baseUrl +
        this._getDocumentVisualization.replace("{guid}", params.guid),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Encryption-Key": documentEncryptionKey,
        },
      }
    );

    return this.readJsonOrThrow(response, GetDocumentVisualizationResponse);
  }

  _getDocumentSignatureParameters = "/documents/{guid}/parameters" as const;
  async getDocumentSignatureParameters(
    params: paths[typeof this._getDocumentSignatureParameters]["get"]["parameters"]["path"],
    documentEncryptionKey: string
  ) {
    const response = await fetch(
      this.baseUrl +
        this._getDocumentSignatureParameters.replace("{guid}", params.guid),
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Encryption-Key": documentEncryptionKey,
        },
      }
    );

    return this.readJsonOrThrow(response, GetDocumentSignatureParametersResponse);
  }

  _postDocumentDataToSign = "/documents/{guid}/datatosign" as const;
  async postDocumentDataToSign(
    params: paths[typeof this._postDocumentDataToSign]["post"]["parameters"]["path"],
    data: NonNullable<
      paths[typeof this._postDocumentDataToSign]["post"]["requestBody"]
    >["content"]["application/json"],
    documentEncryptionKey: string
  ) {
    const response = await fetch(
      this.baseUrl +
        this._postDocumentDataToSign.replace("{guid}", params.guid),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Encryption-Key": documentEncryptionKey,
        },
        body: JSON.stringify(data),
      }
    );

    return this.readJsonOrThrow(response, PostDocumentDataToSignResponse);
  }

  _postDocumentSign = "/documents/{guid}/sign" as const;
  async postDocumentSign(
    params: paths[typeof this._postDocumentSign]["post"]["parameters"]["path"],
    data: NonNullable<
      paths[typeof this._postDocumentSign]["post"]["requestBody"]
    >["content"]["application/json"],
    documentEncryptionKey: string
  ) {
    const response = await fetch(
      this.baseUrl + this._postDocumentSign.replace("{guid}", params.guid),
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Encryption-Key": documentEncryptionKey,
        },
        body: JSON.stringify(data),
      }
    );

    return this.readJsonOrThrow(response, PostDocumentSignResponse);
  }

  private async readJsonOrThrow<T>(response: Response, schema: z.ZodType<T>) {
    if (!response.ok) {
      throw new Error(await this.readErrorText(response));
    }

    return schema.parse(await response.json());
  }

  private async readErrorText(response: Response) {
    let raw = "";
    try {
      raw = await response.text();
    } catch {
      return `API Error: ${response.status} ${response.statusText}`;
    }

    if (!raw) {
      return `API Error: ${response.status} ${response.statusText}`;
    }

    try {
      const parsed = JSON.parse(raw) as { message?: string; code?: string };
      if (parsed.code && parsed.message) {
        return `${parsed.code}: ${parsed.message}`;
      }
      if (parsed.message) {
        return parsed.message;
      }
    } catch {
      return raw;
    }

    return raw;
  }
}

const PostDeviceResponse = z.object({
  guid: z.string().optional(),
});

const GetDeviceIntegrationsResponse = z.array(
  z.object({
    integrationId: z.string(), // TODO add fallback to integration_id
    platform: z.string(),
    displayName: z.string(), // TODO add fallback to display_name
  })
);


const GetDocumentVisualizationResponse = z.object({
  mimeType: z.string(),
  filename: z.string().optional(),
  content: z.string(),
});

const GetDocumentSignatureParametersResponse = z.custom<
  components["schemas"]["SigningParameters"]
>();

const PostDocumentDataToSignResponse = z.object({
  dataToSign: z.string(),
  signingTime: z.number(),
  signingCertificate: z.string(),
});

const PostDocumentSignResponse = z.object({
  filename: z.string(),
  mimeType: z.string(),
  content: z.string(),
  signedBy: z.string(),
  issuedBy: z.string(),
});

export type DeviceRegistrationResponse = z.infer<typeof PostDeviceResponse>;
export type DeviceIntegrationsResponse = z.infer<
  typeof GetDeviceIntegrationsResponse
>;
export type DocumentVisualizationResponse = z.infer<
  typeof GetDocumentVisualizationResponse
>;
export type DocumentDataToSignResponse = z.infer<
  typeof PostDocumentDataToSignResponse
>;
export type DocumentSignResponse = z.infer<typeof PostDocumentSignResponse>;
