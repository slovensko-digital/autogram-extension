import {
  MobileClient,
  MobileIntegrationBackend,
  RequestToken,
  RestorePointStore,
  SignatureRequest,
  toSignedObject,
} from "./mobile";
import type {
  DBInterface,
  GetDocumentResult,
  SignedDocument,
} from "./avm-api/lib/apiClient";

const TOKEN: RequestToken = {
  guid: "doc-guid",
  encryptionKey: "doc-key",
  lastModified: "Mon, 01 Jun 2026 00:00:00 GMT",
};

const SIGNED_DOCUMENT: SignedDocument = {
  filename: "hello.txt.asice",
  mimeType: "application/vnd.etsi.asic-e+zip",
  content: "c2lnbmVk",
  signers: [
    { signedBy: "CN=John Smith", issuedBy: "CN=SVK eID ACA2" },
    { signedBy: "CN=Jane Smith", issuedBy: "CN=SVK eID ACA2" },
  ],
};

function fakeBackend(
  overrides: Partial<MobileIntegrationBackend> = {}
): MobileIntegrationBackend & { calls: Array<[string, unknown[]]> } {
  const calls: Array<[string, unknown[]]> = [];
  const record =
    <T>(name: string, result: T) =>
    (...args: unknown[]) => {
      calls.push([name, args]);
      return Promise.resolve(result);
    };
  return {
    calls,
    loadOrRegister: record("loadOrRegister", undefined),
    addDocument: record("addDocument", TOKEN),
    getQrCodeUrl: record("getQrCodeUrl", "https://avm/qr-code?guid=doc-guid"),
    getPairingQrCodeUrl: record("getPairingQrCodeUrl", "https://avm/pair"),
    sendNotification: record("sendNotification", undefined),
    checkDocumentStatus: record("checkDocumentStatus", {
      status: "pending",
    } as GetDocumentResult),
    waitForSignature: record("waitForSignature", SIGNED_DOCUMENT),
    getDevices: record("getDevices", []),
    ...overrides,
  };
}

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

describe("MobileClient.requestSignature", () => {
  const documentToSign = {
    document: { content: "hello", filename: "hello.txt" },
    payloadMimeType: "text/plain",
  };

  test("uploads the document and notifies paired devices by default", async () => {
    const backend = fakeBackend();
    const client = new MobileClient(backend);
    const request = await client.requestSignature(documentToSign);
    expect(request.token).toEqual(TOKEN);
    expect(backend.calls.map(([name]) => name)).toEqual([
      "addDocument",
      "sendNotification",
    ]);
  });

  test("skips the notification when notifyDevices is false", async () => {
    const backend = fakeBackend();
    const client = new MobileClient(backend);
    await client.requestSignature(documentToSign, { notifyDevices: false });
    expect(backend.calls.map(([name]) => name)).toEqual(["addDocument"]);
  });
});

describe("MobileClient.resumeRequest", () => {
  test("recreates a request from a valid token", () => {
    const client = new MobileClient(fakeBackend());
    expect(client.resumeRequest(TOKEN)).toBeInstanceOf(SignatureRequest);
  });

  test("returns null for missing or invalid tokens", () => {
    const client = new MobileClient(fakeBackend());
    expect(client.resumeRequest(null)).toBeNull();
    expect(client.resumeRequest(undefined)).toBeNull();
    expect(
      client.resumeRequest({ guid: null, encryptionKey: null, lastModified: null })
    ).toBeNull();
  });
});

describe("SignatureRequest", () => {
  test("qrCodeUrl does not pair the device unless asked", async () => {
    const backend = fakeBackend();
    const request = new SignatureRequest(backend, TOKEN);
    await request.qrCodeUrl();
    await request.qrCodeUrl({ pairDevice: true });
    expect(backend.calls).toEqual([
      ["getQrCodeUrl", [TOKEN, false]],
      ["getQrCodeUrl", [TOKEN, true]],
    ]);
  });

  test("status maps backend document states", async () => {
    const states: Array<[GetDocumentResult, string]> = [
      [{ status: "pending" }, "pending"],
      [{ status: "signed", document: SIGNED_DOCUMENT }, "signed"],
      [{ status: "not found" }, "expired"],
    ];
    for (const [backendResult, expected] of states) {
      const backend = fakeBackend({
        checkDocumentStatus: async () => backendResult,
      });
      const request = new SignatureRequest(backend, TOKEN);
      const status = await request.status();
      expect(status.state).toBe(expected);
      if (status.state === "signed") {
        expect(status.document).toEqual(SIGNED_DOCUMENT);
      }
    }
  });

  test("waitForSignature resolves with the signed document", async () => {
    const request = new SignatureRequest(fakeBackend(), TOKEN);
    await expect(request.waitForSignature()).resolves.toEqual(SIGNED_DOCUMENT);
  });

  test("waitForSignature maps aborts to AutogramError('aborted')", async () => {
    const backend = fakeBackend({
      waitForSignature: (_doc, abortController) =>
        new Promise((_resolve, reject) => {
          abortController.signal.addEventListener("abort", () =>
            reject(new Error("Aborted"))
          );
        }),
    });
    const request = new SignatureRequest(backend, TOKEN);
    const abortController = new AbortController();
    const pending = request.waitForSignature({
      signal: abortController.signal,
    });
    abortController.abort("closed");
    await expect(pending).rejects.toMatchObject({ code: "aborted" });
  });

  test("waitForSignature rejects immediately on an already-aborted signal", async () => {
    const request = new SignatureRequest(fakeBackend(), TOKEN);
    const abortController = new AbortController();
    abortController.abort();
    await expect(
      request.waitForSignature({ signal: abortController.signal })
    ).rejects.toMatchObject({ code: "aborted" });
  });
});

describe("toSignedObject", () => {
  test("joins all signers", () => {
    expect(toSignedObject(SIGNED_DOCUMENT)).toEqual({
      content: "c2lnbmVk",
      signedBy: "CN=John Smith, CN=Jane Smith",
      issuedBy: "CN=SVK eID ACA2, CN=SVK eID ACA2",
    });
  });

  test("tolerates missing signers", () => {
    expect(
      toSignedObject({ ...SIGNED_DOCUMENT, signers: undefined })
    ).toEqual({ content: "c2lnbmVk", signedBy: "", issuedBy: "" });
  });
});

describe("RestorePointStore", () => {
  test("saves the current token when no restore point exists", async () => {
    const db = memoryDb();
    const store = new RestorePointStore(db, new MobileClient(fakeBackend()));
    const result = await store.use("rp-1", TOKEN);
    expect(result).toEqual({ outcome: "none" });
    expect(db.data.get("restorePoint:rp-1")).toEqual(TOKEN);
  });

  test("does nothing without a restore point or current token", async () => {
    const db = memoryDb();
    const store = new RestorePointStore(db, new MobileClient(fakeBackend()));
    const result = await store.use("rp-1", null);
    expect(result).toEqual({ outcome: "none" });
    expect(db.data.size).toBe(0);
  });

  test("returns the signed object and cleans up when the document is signed", async () => {
    const db = memoryDb();
    await db.set("restorePoint:rp-1", TOKEN);
    const backend = fakeBackend({
      checkDocumentStatus: async () => ({
        status: "signed",
        document: SIGNED_DOCUMENT,
      }),
    });
    const store = new RestorePointStore(db, new MobileClient(backend));
    const result = await store.use("rp-1", null);
    expect(result).toEqual({
      outcome: "signed",
      token: TOKEN,
      signedObject: toSignedObject(SIGNED_DOCUMENT),
    });
    expect(db.data.get("restorePoint:rp-1")).toBeUndefined();
  });

  test("returns the token to resume waiting when the document is pending", async () => {
    const db = memoryDb();
    await db.set("restorePoint:rp-1", TOKEN);
    const store = new RestorePointStore(db, new MobileClient(fakeBackend()));
    const result = await store.use("rp-1", null);
    expect(result).toEqual({ outcome: "pending", token: TOKEN });
  });

  test("treats expired documents as no restore point", async () => {
    const db = memoryDb();
    await db.set("restorePoint:rp-1", TOKEN);
    const backend = fakeBackend({
      checkDocumentStatus: async () => ({ status: "not found" }),
    });
    const store = new RestorePointStore(db, new MobileClient(backend));
    expect(await store.use("rp-1", null)).toEqual({ outcome: "none" });
  });

  test("swallows status check failures", async () => {
    const db = memoryDb();
    await db.set("restorePoint:rp-1", TOKEN);
    const backend = fakeBackend({
      checkDocumentStatus: async () => {
        throw new Error("network down");
      },
    });
    const store = new RestorePointStore(db, new MobileClient(backend));
    expect(await store.use("rp-1", null)).toEqual({ outcome: "none" });
  });

  test("dereferences the legacy string-pointer format", async () => {
    // Extension background workers < 0.3 stored a pointer to the db key
    // holding the document reference instead of the token itself.
    const db = memoryDb();
    await db.set("autogram:avm:restorePoint:rp-1", "autogram:avm:documentRef:42|0");
    await db.set("autogram:avm:documentRef:42|0", TOKEN);
    const store = new RestorePointStore(
      db,
      new MobileClient(fakeBackend()),
      "autogram:avm:restorePoint:"
    );
    const result = await store.use("rp-1", null);
    expect(result).toEqual({ outcome: "pending", token: TOKEN });
  });

  test("respects the configured key prefix", async () => {
    const db = memoryDb();
    const store = new RestorePointStore(
      db,
      new MobileClient(fakeBackend()),
      "autogram:avm:restorePoint:"
    );
    await store.use("rp-1", TOKEN);
    expect(db.data.get("autogram:avm:restorePoint:rp-1")).toEqual(TOKEN);
  });
});
