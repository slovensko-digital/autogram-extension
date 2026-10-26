import { decodeJwt, jwtVerify } from "jose";
import { AutogramVMobileIntegration, type DBInterface } from "./apiClient";

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

/** Web Locks stand-in: runs requests one after another */
function fifoLocks() {
  let tail: Promise<unknown> = Promise.resolve();
  return {
    request: <T>(_name: string, fn: () => Promise<T>): Promise<T> => {
      const run = tail.then(fn);
      tail = run.catch(() => undefined);
      return run;
    },
  };
}

const REG_INFO = { platform: "test", displayName: "Test" };

function pairingTokenOf(url: string) {
  return new URL(url).searchParams.get("integration")!;
}

describe("integration registration", () => {
  const realFetch = globalThis.fetch;
  let registrations: number;

  beforeEach(() => {
    registrations = 0;
    globalThis.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/integrations")) {
        const guid = `guid-${++registrations}`;
        // response arrives later, so concurrent registrations overlap
        await new Promise((r) => setTimeout(r, 5));
        return Response.json({ guid });
      }
      return Response.json([]);
    }) as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = realFetch;
    delete (globalThis.navigator as { locks?: unknown }).locks;
  });

  test("init does not register; device list is empty without a request", async () => {
    const avm = new AutogramVMobileIntegration(memoryDb());
    await avm.init(REG_INFO);

    await expect(avm.getDevices()).resolves.toEqual([]);
    expect(avm.getIntegrationGuid()).toBeNull();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test("concurrent calls on one instance register once", async () => {
    const db = memoryDb();
    const avm = new AutogramVMobileIntegration(db);
    await avm.init(REG_INFO);

    const [first, second, devices] = await Promise.all([
      avm.getPairingQrCodeUrl(),
      avm.getPairingQrCodeUrl(),
      avm.getDevices(),
    ]);

    expect(registrations).toBe(1);
    expect(devices).toEqual([]);
    for (const url of [first, second]) {
      expect(decodeJwt(pairingTokenOf(url)).sub).toBe(
        db.data.get("integrationGuid")
      );
    }
  });

  test("instances sharing the database register once under the lock", async () => {
    Object.defineProperty(globalThis.navigator, "locks", {
      value: fifoLocks(),
      configurable: true,
    });
    const db = memoryDb();
    // e.g. extension options page and background worker
    const optionsPage = new AutogramVMobileIntegration(db);
    const worker = new AutogramVMobileIntegration(db);
    await Promise.all([optionsPage.init(REG_INFO), worker.init(REG_INFO)]);

    const urls = await Promise.all([
      optionsPage.getPairingQrCodeUrl(),
      worker.getPairingQrCodeUrl(),
    ]);

    expect(registrations).toBe(1);
    const savedGuid = db.data.get("integrationGuid");
    const savedKeyPair = db.data.get("keyPair") as CryptoKeyPair;
    for (const url of urls) {
      // signed with the saved key for the saved GUID: the server accepts it
      const { payload } = await jwtVerify(
        pairingTokenOf(url),
        savedKeyPair.publicKey
      );
      expect(payload.sub).toBe(savedGuid);
      expect(payload.aud).toBe("device");
    }
  });
});
