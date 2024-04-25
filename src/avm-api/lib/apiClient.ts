import { paths } from "./avm-api.generated";
import fetch from "cross-fetch";
import z from "zod";

export class AutogramVMobileIntegration {
  apiClient: AutogramVMobileIntegrationApiClient;
  constructor() {
    this.apiClient = new AutogramVMobileIntegrationApiClient();
  }

  register() {
    return this.apiClient.registerIntegration({
      platform: "extension",
      displayName: "Autogram Extension",
      publicKey: this.getPublicKey(),
      pushkey: this.getPushKey(),
    });
  }

  getPublicKey() {
    return "-----";
  }

  getPushKey() {
    return "-----";
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
  ) {
    return fetch(this.baseUrl + this._registerIntegration, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).then((res) => PostIntegrationResponse.parse(res.json()));
  }

  _getIntegrationDevices = "/integration-devices" as const;
  getIntegrationDevices() {
    return fetch(this.baseUrl + this._getIntegrationDevices, {
      method: "GET",
    }).then((res) => GetIntegrationDevicesResponseBody.parse(res.json()));
  }

  _signRequest = "/sign-request" as const;
  signRequest(
    data: paths[typeof this._signRequest]["post"]["requestBody"]["content"]["application/json"]
  ) {
    return fetch(this.baseUrl + this._signRequest, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
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
