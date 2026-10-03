import { decodeJwt } from "jose";
import { AvmSimpleChannel } from "./channel-avm";
import { supportsNotifications } from "./flow";
import type { DBInterface } from "./avm-api/lib/apiClient";

function memoryDb(): DBInterface & { data: Map<IDBValidKey, unknown> } {
  const data = new Map<IDBValidKey, unknown>();
  return {
    data,
    set: async (key, value) => {
      data.set(key, value);
    },
    get: async <T>(key: IDBValidKey) => data.get(key) as T | undefined,
  };
}

describe("AvmSimpleChannel", () => {
  const realFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  test("implements the notifications capability", () => {
    expect(supportsNotifications(new AvmSimpleChannel())).toBe(true);
  });

  test("uses the injected storage for the integration identity", async () => {
    const storage = memoryDb();
    storage.data.set(
      "keyPair",
      await crypto.subtle.generateKey(
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["sign", "verify"]
      )
    );
    storage.data.set("integrationGuid", "stored-guid");

    const requests: Request[] = [];
    globalThis.fetch = jest.fn(async (input, init) => {
      requests.push(new Request(input, init));
      return new Response("[]", {
        headers: { "Content-Type": "application/json" },
      });
    });

    const channel = new AvmSimpleChannel({ storage });
    // identity found in storage: no registration request
    await channel.loadOrRegister({ platform: "test" });
    expect(requests).toHaveLength(0);

    await expect(channel.getPairedDevices()).resolves.toEqual([]);
    expect(requests).toHaveLength(1);
    expect(requests[0].url).toMatch(/\/integration-devices$/);
    const jwt = requests[0].headers
      .get("Authorization")!
      .replace("Bearer ", "");
    expect(decodeJwt(jwt).sub).toBe("stored-guid");
  });
});
