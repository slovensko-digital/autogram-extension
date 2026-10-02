/**
 * Characterization tests: pin the HTTP requests the desktop API client sends
 * to the legacy Autogram endpoints (`/info`, `/sign`, `/batch`) and how it
 * interprets the responses. Older Autogram versions only speak this protocol,
 * so it must not change.
 */
import fetch from "cross-fetch";
import { apiClient } from "./apiClient";
import { AutogramError } from "../../errors";

jest.mock("cross-fetch", () => ({ __esModule: true, default: jest.fn() }));

const fetchMock = fetch as unknown as jest.Mock;

function respond(status: number, body?: unknown) {
  fetchMock.mockResolvedValueOnce({
    status,
    json: () =>
      body === undefined
        ? Promise.reject(new SyntaxError("Unexpected end of JSON input"))
        : Promise.resolve(body),
  });
}

function lastRequest() {
  const [url, init] = fetchMock.mock.calls.at(-1)!;
  return {
    url: url as string,
    init: init as RequestInit,
    body: init?.body ? JSON.parse(init.body as string) : undefined,
  };
}

const client = () =>
  apiClient({ disableSecurity: true, requestsOrigin: "*" });

beforeEach(() => fetchMock.mockReset());

describe("signLegacy: POST /sign", () => {
  test("sends document, parameters and payloadMimeType", async () => {
    const response = { content: "c2ln", signedBy: "CN=A", issuedBy: "CN=B" };
    respond(200, response);

    const result = await client().signLegacy(
      { content: "JVBERg==", filename: "a.pdf" },
      { level: "PAdES_BASELINE_B", checkPDFACompliance: false },
      "application/pdf;base64"
    );

    expect(result).toEqual(response);
    const { url, init, body } = lastRequest();
    expect(url).toBe("http://localhost:37200/sign");
    expect(init).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    expect(init.signal).toBeUndefined();
    expect(body).toEqual({
      document: { content: "JVBERg==", filename: "a.pdf" },
      parameters: { level: "PAdES_BASELINE_B", checkPDFACompliance: false },
      payloadMimeType: "application/pdf;base64",
    });
  });

  test("applies the historical defaults", async () => {
    respond(200, { content: "x", signedBy: "", issuedBy: "" });
    await client().signLegacy({ content: "<a/>" });
    expect(lastRequest().body).toEqual({
      document: { content: "<a/>" },
      parameters: { level: "XAdES_BASELINE_B", checkPDFACompliance: true },
      payloadMimeType: "application/xml",
    });
  });

  test("sends batchId and the abort signal when given", async () => {
    respond(200, { content: "x", signedBy: "", issuedBy: "" });
    const abortController = new AbortController();
    await client().signLegacy(
      { content: "<a/>" },
      { level: "XAdES_BASELINE_B" },
      "application/xml",
      "batch-1",
      abortController
    );
    const { init, body } = lastRequest();
    expect(body.batchId).toBe("batch-1");
    expect(init.signal).toBe(abortController.signal);
  });

  test("maps 204 to user cancellation", async () => {
    respond(204);
    await expect(client().signLegacy({ content: "<a/>" })).rejects.toMatchObject({
      code: "user-cancelled",
    });
  });

  test("returns error bodies as-is (no status check besides 204)", async () => {
    const errorBody = { code: "SIGNING_FAILED", message: "boom" };
    respond(400, errorBody);
    await expect(client().signLegacy({ content: "<a/>" })).resolves.toEqual(errorBody);
  });
});

describe("batch endpoints", () => {
  test("POST /batch starts a batch", async () => {
    respond(200, { batchId: "b1" });
    await expect(client().startBatch(3)).resolves.toEqual({ batchId: "b1" });
    const { url, init, body } = lastRequest();
    expect(url).toBe("http://localhost:37200/batch");
    expect(init.method).toBe("POST");
    expect(body).toEqual({ totalNumberOfDocuments: 3 });
  });

  test("POST /batch maps 204 to user cancellation", async () => {
    respond(204);
    const error = await client().startBatch(3).catch((e) => e);
    expect(AutogramError.is(error, "user-cancelled")).toBe(true);
  });

  test("DELETE /batch ends a batch", async () => {
    respond(200, { status: "FINISHED" });
    await expect(client().endBatch("b1")).resolves.toEqual({ status: "FINISHED" });
    const { url, init, body } = lastRequest();
    expect(url).toBe("http://localhost:37200/batch");
    expect(init.method).toBe("DELETE");
    expect(body).toEqual({ batchId: "b1" });
  });
});

describe("GET /info and launch URL", () => {
  test("info reads /info without caching", async () => {
    respond(200, { status: "READY", version: "2.7.6" });
    await expect(client().info()).resolves.toEqual({ status: "READY", version: "2.7.6" });
    expect(lastRequest().url).toBe("http://localhost:37200/info");
    expect(lastRequest().init).toEqual({ cache: "no-store" });
  });

  test("launch URL", async () => {
    await expect(client().getLaunchURL()).resolves.toBe(
      "autogram://listen?protocol=http&port=37200&host=localhost&origin=*&language=sk"
    );
  });
});
