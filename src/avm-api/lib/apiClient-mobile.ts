import { components, paths } from "./avm-api.generated";
import fetch from "cross-fetch";
import z from "zod";

export class AutogramVMobileSimulation {
  apiClient: AutogramVMobileClientApiClient;
  guid: string;
  encryptionKey: string;

  constructor() {
    this.apiClient = new AutogramVMobileClientApiClient();
  }

  parseUrl(urlString: string) {
    const url = new URL(urlString);
    const guid = url.searchParams.get("guid");
    const encryptionKey = url.searchParams.get("key");
    const integrationJwt = url.searchParams.get("integration");

    console.log({ guid, key: encryptionKey, integrationJwt });
    if (!guid || !encryptionKey) {
      throw new Error("Invalid URL");
    }
    this.guid = guid;
    this.encryptionKey = encryptionKey;
  }

  visualizeDocument() {
    console.log("Document visualized", this.guid, this.encryptionKey);

    return this.apiClient
      .getDocumentVisualization({ guid: this.guid }, this.encryptionKey)
      .then((res) => {
        console.log("Document visualization", res);
        return res;
      });
  }

  async signDocument() {
    const signatureParameters =
      await this.apiClient.getDocumentSignatureParameters(
        { guid: this.guid },
        this.encryptionKey
      );
    console.log("Signature parameters", signatureParameters);

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
  constructor() {
    this.baseUrl = "https://autogram.slovensko.digital/api/v1";
  }

  // App (mobile) API

  _getDocumentVisualization = "/documents/{guid}/visualization" as const;
  getDocumentVisualization(
    params: paths[typeof this._getDocumentVisualization]["get"]["parameters"]["path"],
    documentEncryptionKey: string
  ) {
    return fetch(
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
    )
      .then((res) => res.json())
      .then(GetDocumentVisualizationResponse.parse);
  }

  _getDocumentSignatureParameters = "/documents/{guid}/parameters" as const;
  getDocumentSignatureParameters(
    params: paths[typeof this._getDocumentSignatureParameters]["get"]["parameters"]["path"],
    documentEncryptionKey: string
  ) {
    return fetch(
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
    ).then((res) => res.json() as components["schemas"]["SigningParameters"]);
  }

  _postDocumentDataToSign = "/documents/{guid}/datatosign" as const;
  postDocumentDataToSign(
    params: paths[typeof this._postDocumentDataToSign]["post"]["parameters"]["path"],
    data: NonNullable<
      paths[typeof this._postDocumentDataToSign]["post"]["requestBody"]
    >["content"]["application/json"],
    documentEncryptionKey: string
  ) {
    return fetch(
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
    )
      .then((res) => res.json())
      .then(PostDocumentDataToSignResponse.parse);
  }

  _postDocumentSign = "/documents/{guid}/sign" as const;
  postDocumentSign(
    params: paths[typeof this._postDocumentSign]["post"]["parameters"]["path"],
    data: NonNullable<
      paths[typeof this._postDocumentSign]["post"]["requestBody"]
    >["content"]["application/json"],
    documentEncryptionKey: string
  ) {
    return fetch(
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
    )
      .then((res) => res.json())
      .then(PostDocumentSignResponse.parse);
  }
}

const GetDocumentVisualizationResponse = z.object({
  mimeType: z.string(),
  filename: z.string().optional(),
  content: z.string(),
});

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
