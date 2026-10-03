// the device-side client imports cross-fetch; route it to the test's fetch
jest.mock("cross-fetch", () => ({
  __esModule: true,
  default: (...args: Parameters<typeof fetch>) => globalThis.fetch(...args),
}));

import { AutogramVMobileIntegrationApiClient } from "./apiClient";
import { AutogramVMobileClientApiClient } from "./apiClient-mobile";

describe("unpairing wire format", () => {
  const realFetch = globalThis.fetch;
  let requests: Request[];

  function respondWith(status: number) {
    requests = [];
    globalThis.fetch = jest.fn(async (input, init) => {
      requests.push(new Request(input, init));
      return new Response(null, { status });
    });
  }

  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  describe("integration side: DELETE /integration-devices/{device_id}", () => {
    const client = new AutogramVMobileIntegrationApiClient();

    test("sends the integration JWT and accepts 204", async () => {
      respondWith(204);
      await client.deleteIntegrationDevice("dev/1", "integration-jwt");

      expect(requests).toHaveLength(1);
      expect(requests[0].method).toBe("DELETE");
      expect(requests[0].url).toBe(
        "https://autogram.slovensko.digital/api/v1/integration-devices/dev%2F1"
      );
      expect(requests[0].headers.get("Authorization")).toBe(
        "Bearer integration-jwt"
      );
    });

    test("treats 404 (already unpaired) as success", async () => {
      respondWith(404);
      await expect(
        client.deleteIntegrationDevice("dev-1", "jwt")
      ).resolves.toBeUndefined();
    });

    test("throws on other errors", async () => {
      respondWith(500);
      await expect(
        client.deleteIntegrationDevice("dev-1", "jwt")
      ).rejects.toThrow("500");
    });
  });

  describe("device side: DELETE /device-integrations/{integration_id}", () => {
    test("sends the device JWT", async () => {
      respondWith(204);
      await new AutogramVMobileClientApiClient().deleteDeviceIntegration(
        "integration-guid",
        "device-jwt"
      );

      expect(requests[0].method).toBe("DELETE");
      expect(requests[0].url).toBe(
        "https://autogram.slovensko.digital/api/v1/device-integrations/integration-guid"
      );
      expect(requests[0].headers.get("Authorization")).toBe(
        "Bearer device-jwt"
      );
    });
  });
});
