/**
 * @jest-environment jsdom
 */

// import crypto from "crypto";
// Object.defineProperty(global.self, "crypto", {
//   value: {
//     // @ts-expect-error crypto
//     subtle: crypto.webcrypto.subtle,
//   },
// });

import { TextEncoder, TextDecoder } from "util";
Object.assign(global, { TextDecoder, TextEncoder });
// add fetch
import fetch from "cross-fetch";
Object.assign(global, { fetch });

import "core-js/stable/structured-clone";
import "fake-indexeddb/auto";
import {
  AutogramVMobileIntegration,
  AutogramVMobileIntegrationApiClient,
} from "./apiClient";
import { get, set } from "idb-keyval";

describe("avm api client", () => {
  let apiClient: AutogramVMobileIntegrationApiClient =
    new AutogramVMobileIntegrationApiClient();
  beforeEach(() => {
    apiClient = new AutogramVMobileIntegrationApiClient();
  });
  test("qr code url", () => {
    apiClient.qrCodeUrl({
      guid: "e7e95411-66a1-d401-e063-0a64dbb6b796",
      key: "EeESAfZQh9OTf5qZhHZtgaDJpYtxZD6TIOQJzRgRFgQ=",
      integration:
        "eyJhbGciOiJFUzI1NiJ9.eyJzdWIiOiI3OGQ5MWRlNy0xY2MyLTQwZTQtOWE3MS0zODU4YjRmMDMxOWQiLCJleHAiOjE3MTI5MDk3MjAsImp0aSI6IjAwZTAxN2Y1LTI4MTAtNDkyNS04ODRlLWNiN2FhZDAzZDFhNiIsImF1ZCI6ImRldmljZSJ9.7Op6W2BvbX2_mgj9dkz1IiolEsQ1Z2a0AzpS5bj4pcG3CJ4Z8j9W3RQE95wrAj3t6nmd9JaGZSlCJNSV_myyLQ",
    });
  });
});

describe("avm integration: integration tests", () => {
  test("load or register", async () => {
    const apiClient = new AutogramVMobileIntegration({
      get,
      set,
    });
    await apiClient.loadOrRegister();
  });
});
