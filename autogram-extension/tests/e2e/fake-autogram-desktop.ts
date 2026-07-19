import http from "node:http";

/**
 * The Autogram desktop HTTP API port. Hardcoded in the SDK
 * (autogram-sdk/src/autogram-api/lib/apiClient.ts), so the fake must bind
 * exactly this port — quit the real Autogram app before running the tests.
 */
const AUTOGRAM_DESKTOP_PORT = 37200;

export interface FakeAutogramDesktop {
  /** Base64 content every successful /sign responds with. */
  signedContent: string;
  /** Parsed JSON bodies of the received /sign requests, in order. */
  signRequests: unknown[];
  /** "cancel" makes /sign respond 204 = user cancelled signing. */
  mode: "sign" | "cancel";
  close(): Promise<void>;
}

/**
 * Minimal stand-in for the Autogram desktop app's local HTTP server: the
 * extension's background worker polls `GET /info` for readiness and posts
 * the document to `POST /sign`. Responses carry permissive CORS headers,
 * as the real app's do — the background worker calls cross-origin.
 */
export function startFakeAutogramDesktop(): Promise<FakeAutogramDesktop> {
  const state: FakeAutogramDesktop = {
    signedContent: Buffer.from(
      "<e2e-fake-signed-container/>"
    ).toString("base64"),
    signRequests: [],
    mode: "sign",
    close: () =>
      new Promise((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve()))
      ),
  };

  const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };

  const server = http.createServer((req, res) => {
    if (req.method === "OPTIONS") {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }
    if (req.method === "GET" && req.url?.startsWith("/info")) {
      res.writeHead(200, {
        "Content-Type": "application/json",
        ...CORS_HEADERS,
      });
      res.end(JSON.stringify({ version: "e2e-fake", status: "READY" }));
      return;
    }
    if (req.method === "POST" && req.url?.startsWith("/sign")) {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        state.signRequests.push(JSON.parse(body));
        if (state.mode === "cancel") {
          // the real app responds 204 when the user closes the dialog
          res.writeHead(204, CORS_HEADERS);
          res.end();
          return;
        }
        res.writeHead(200, {
          "Content-Type": "application/json",
          ...CORS_HEADERS,
        });
        res.end(
          JSON.stringify({
            content: state.signedContent,
            signedBy: "CN=E2E Test Signer, C=SK",
            issuedBy: "CN=E2E Test CA, C=SK",
          })
        );
      });
      return;
    }
    res.writeHead(404, CORS_HEADERS);
    res.end();
  });

  return new Promise((resolve, reject) => {
    server.once("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        reject(
          new Error(
            `port ${AUTOGRAM_DESKTOP_PORT} is taken — quit the real Autogram` +
              " desktop app before running the e2e tests"
          )
        );
      } else {
        reject(error);
      }
    });
    server.listen(AUTOGRAM_DESKTOP_PORT, () => resolve(state));
  });
}
