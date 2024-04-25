import { AutogramVMobileIntegrationApiClient } from "./apiClient";

describe("avm api client", () => {
  const apiClient: AutogramVMobileIntegrationApiClient =
    new AutogramVMobileIntegrationApiClient();
  beforeEach(() => {
    apiClient = new AutogramVMobileIntegrationApiClient();
  });
  test("qr code url", () => {
    apiClient.qrCodeUrl({ data: "data" });
  });
});
