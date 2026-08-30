import { createAutogramClient, CombinedClient } from "autogram-sdk/with-ui";
import { AutogramError } from "autogram-sdk";
import {
  AutogramDesktopChannel,
  AvmChannelWeb,
  WebChannelCaller,
} from "./channel/web";
import { ExtensionOptions } from "../../options/default";
import { createLogger } from "../../log";

const log = createLogger("ag-ext.native-autogram-intercept");

/**
 * Local HTTP API the Autogram desktop app listens on — also the address
 * some portals (nove.slovensko.sk's message composer) talk to directly
 * from their own bundled JS, entirely independent of `window.ditec`. See
 * `apiClient-*.js` on message-constructor-web.slovensko.sk: an axios
 * instance with this as `baseURL`, calling `GET /info`, `POST /sign` and
 * `POST`/`DELETE /batch` with the exact wire shapes of
 * `autogram-sdk`'s `apiClient()`.
 */
const LOCAL_SERVER_ORIGIN = "http://localhost:37200";

/**
 * Narrow view of `Window` covering only what this module patches. Some
 * @types package in this project redeclares the DOM `Window` interface
 * without `fetch`/`XMLHttpRequest`, so the real `Window` type can't be
 * used here — see the investigation notes on this change.
 */
interface InterceptableWindow {
  fetch: typeof fetch;
  XMLHttpRequest: typeof XMLHttpRequest;
}

interface DesktopDocument {
  content: string;
  filename?: string;
}

interface SignRequestBody {
  batchId?: string;
  document: DesktopDocument;
  parameters?: Record<string, unknown>;
  payloadMimeType: string;
}

/**
 * The `CombinedClient` (with-UI signing dialog) is expensive to create
 * (mounts `<autogram-root>`) and stateful (signature index, restore
 * callbacks) — build it once, lazily, only if the portal's native
 * "Autogram" signing method is actually used.
 */
let clientPromise: Promise<CombinedClient> | null = null;

function getClient(
  extensionOptions: ExtensionOptions
): Promise<CombinedClient> {
  if (!clientPromise) {
    const webChannelCaller = new WebChannelCaller();
    webChannelCaller.init();
    clientPromise = createAutogramClient({
      mobileChannel: new AvmChannelWeb(webChannelCaller),
      desktopChannel: new AutogramDesktopChannel(webChannelCaller),
      pairingEnabled: extensionOptions.notifyPairedDevices,
    });
  }
  return clientPromise;
}

function isTargetUrl(url: string): boolean {
  return url.startsWith(`${LOCAL_SERVER_ORIGIN}/`);
}

function pathOf(url: string): string {
  return url.slice(LOCAL_SERVER_ORIGIN.length).split("?")[0];
}

async function handleInfo(): Promise<{ status: number; body: unknown }> {
  // Always "READY": we don't probe a real local app, we *are* the
  // signing backend from the portal's point of view.
  return {
    status: 200,
    body: { version: "autogram-extension", status: "READY" },
  };
}

/**
 * Multi-document (batch) signing isn't supported by the with-UI signing
 * flow yet — `autogram-sdk`'s `SigningFlow.sign()` has no `batchId`
 * parameter, so there is no way to drive a batched ceremony through the
 * dialog. Reject clearly instead of silently mis-signing or hanging.
 */
function batchUnsupportedResponse(): { status: number; body: unknown } {
  return {
    status: 501,
    body: {
      message:
        "Batch signing more than one document at a time is not yet " +
        "supported by the Autogram extension.",
    },
  };
}

async function handleSign(
  body: SignRequestBody,
  extensionOptions: ExtensionOptions
): Promise<{ status: number; body: unknown }> {
  if (body.batchId) {
    return batchUnsupportedResponse();
  }
  try {
    const client = await getClient(extensionOptions);
    // Legacy positional form: its result shape ({content, signedBy,
    // issuedBy}) is exactly the portal's expected SignResponseBody.
    const result = await client.sign(
      body.document,
      body.parameters ?? {},
      body.payloadMimeType,
      false
    );
    return { status: 200, body: result };
  } catch (e) {
    if (
      AutogramError.is(e, "user-cancelled") ||
      AutogramError.is(e, "aborted")
    ) {
      // Matches the real desktop app: a 204 means "cancelled".
      return { status: 204, body: null };
    }
    log.error("native autogram sign failed", e);
    const message = e instanceof Error ? e.message : String(e);
    return { status: 500, body: { message } };
  }
}

async function route(
  method: string,
  url: string,
  parseBody: () => Promise<unknown>,
  extensionOptions: ExtensionOptions
): Promise<{ status: number; body: unknown }> {
  const path = pathOf(url);
  if (method === "GET" && path === "/info") {
    return handleInfo();
  }
  if (method === "POST" && path === "/sign") {
    return handleSign((await parseBody()) as SignRequestBody, extensionOptions);
  }
  if ((method === "POST" || method === "DELETE") && path === "/batch") {
    return batchUnsupportedResponse();
  }
  log.warn("Unhandled native autogram request", method, url);
  return { status: 404, body: { message: "Not found" } };
}

function installFetchIntercept(
  targetWindow: InterceptableWindow,
  extensionOptions: ExtensionOptions
): void {
  const originalFetch = targetWindow.fetch.bind(targetWindow);
  targetWindow.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    if (!isTargetUrl(url)) {
      return originalFetch(input, init);
    }
    const method = (init?.method ?? "GET").toUpperCase();
    const parseBody = async () =>
      init?.body ? JSON.parse(init.body as string) : undefined;
    return route(method, url, parseBody, extensionOptions).then(
      ({ status, body }) =>
        new Response(body === null ? null : JSON.stringify(body), {
          status,
          headers: { "Content-Type": "application/json" },
        })
    );
  }) as typeof fetch;
}

/**
 * axios (used by message-constructor-web.slovensko.sk) defaults to the
 * XHR adapter in a browser context, not fetch — so `fetch` alone would
 * miss it. This subclass only intercepts `open`/`send`/`setRequestHeader`
 * for the target origin; everything else (property reads, event
 * listeners inherited from `XMLHttpRequest`) behaves normally because the
 * instance is a real `XMLHttpRequest`.
 */
function installXhrIntercept(
  targetWindow: InterceptableWindow,
  extensionOptions: ExtensionOptions
): void {
  const RealXHR = targetWindow.XMLHttpRequest;

  class InterceptingXHR extends RealXHR {
    private targetMode = false;
    private method = "GET";
    private url = "";
    private requestBody: string | undefined;

    open(method: string, url: string | URL, ...rest: unknown[]): void {
      this.method = method.toUpperCase();
      this.url = url.toString();
      this.targetMode = isTargetUrl(this.url);
      if (this.targetMode) {
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (super.open as any)(method, url, ...rest);
    }

    setRequestHeader(name: string, value: string): void {
      if (this.targetMode) {
        return;
      }
      super.setRequestHeader(name, value);
    }

    send(body?: Document | XMLHttpRequestBodyInit | null): void {
      if (!this.targetMode) {
        super.send(body);
        return;
      }
      this.requestBody = typeof body === "string" ? body : undefined;
      const parseBody = async () =>
        this.requestBody ? JSON.parse(this.requestBody) : undefined;
      route(this.method, this.url, parseBody, extensionOptions).then(
        ({ status, body: responseBody }) => this.respond(status, responseBody),
        (error) => this.respond(500, { message: String(error) })
      );
    }

    private respond(status: number, body: unknown): void {
      const text = body === null ? "" : JSON.stringify(body);
      const define = (prop: string, value: unknown) =>
        Object.defineProperty(this, prop, { value, configurable: true });
      define("readyState", 4);
      define("status", status);
      define("statusText", "");
      define("responseText", text);
      define("response", text);
      this.dispatchEvent(new Event("readystatechange"));
      this.dispatchEvent(new Event("load"));
      this.dispatchEvent(new Event("loadend"));
    }
  }

  targetWindow.XMLHttpRequest =
    InterceptingXHR as unknown as typeof XMLHttpRequest;
}

/**
 * Installs the interceptor that lets the portal's native "Autogram"
 * signing method (see the switcher next to "Podpísať" on
 * message-constructor-web.slovensko.sk) run through our full with-UI
 * signing client instead of talking to a real local desktop app.
 *
 * Scoped to sites that opt in via `Site.interceptNativeAutogram` in
 * `supported-sites.ts` — this must not run on sites where `window.ditec`
 * replacement is the only integration we want.
 */
export function installNativeAutogramIntercept(
  targetWindow: InterceptableWindow,
  extensionOptions: ExtensionOptions
): void {
  log.debug("Installing native autogram intercept");
  installFetchIntercept(targetWindow, extensionOptions);
  installXhrIntercept(targetWindow, extensionOptions);
}
