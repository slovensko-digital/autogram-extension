# Autogram SDK — public API (0.5.x)

This documents the supported public surface of `autogram-sdk`. Anything not
listed here (internal channels, injected-ui internals, generated API types
beyond those re-exported) may change without notice.

## Entry points

| Import | Contents |
| --- | --- |
| `autogram-sdk` | Types, errors, low-level clients (`DesktopClient`, `AutogramVMobileIntegration`), generated API clients. Safe to import anywhere (no DOM side effects). |
| `autogram-sdk/with-ui` | `CombinedClient` — the full signing flow with the built-in dialog UI. Importing this module registers custom elements, so import it only in a browser page context. |
| `autogram-sdk/autogram-api` | Low-level Autogram desktop HTTP API client (generated from OpenAPI). |
| `autogram-sdk/avm-api` | Low-level Autogram v Mobile (AVM) server API client (generated from OpenAPI) and device-side client used for simulations. |

## Signing with UI: `createAutogramClient` (`autogram-sdk/with-ui`)

The recommended way to sign documents from a web page. Shows a dialog where
the user picks a signing method (desktop app / mobile app), then drives the
chosen flow.

```typescript
import { createAutogramClient } from "autogram-sdk/with-ui";

const client = await createAutogramClient();

const { content, signedBy, issuedBy } = await client.sign(
  { content: "hello world", filename: "hello.txt" },   // document
  { level: "XAdES_BASELINE_B", container: "ASiC_E" },  // signature parameters
  "text/plain",                                        // payload MIME type
  true                                                 // decode Base64 result
);
```

### `createAutogramClient(options?)`

Async factory (waits for the dialog UI element to attach). Returns a
`CombinedClient`. All options are optional:

- `mobileChannel` — implementation of `AutogramVMobileIntegrationInterfaceStateful`;
  defaults to `AvmSimpleChannel` (direct HTTPS calls to the AVM server).
- `desktopChannel` — implementation of `AutogramDesktopIntegrationInterface`;
  defaults to `AutogramDesktopSimpleChannel` (direct HTTP calls to the local
  desktop app, with a Safari loopback fallback).
- `onResetSignRequest` — called when the client resets its state.
- `enableNotifications` — send push notifications to paired mobile
  devices (default `true`).
- `platform` / `displayName` — how this integration identifies itself
  when registering with the AVM server.

Channels only need to be provided when network calls must happen in a
different execution context (the browser extension routes them through its
background worker; see the repository README).

The positional factory `CombinedClient.init(mobileChannel?,
desktopChannel?, resetSignRequestCallback?, options?)` is **deprecated**
but keeps working; it is equivalent to the options form above.

### `client.sign(document, signatureParameters, payloadMimeType, decodeBase64?, options?)`

Returns `Promise<SignedObject>`. Throws `AutogramError` (see
[Errors](#errors)); user cancellation is an error with code `user-cancelled`.

- `document` — `{ content: string; filename?: string }`
- `signatureParameters` — see `SignatureParameters` (generated from the
  desktop OpenAPI spec); notable fields: `level`, `container`,
  `packaging`, `digestAlgorithm`, XML/XSD/XSLT fields for XAdES.
- `payloadMimeType` — MIME type of `document.content`. Append `;base64`
  when the content is Base64-encoded binary.
- `decodeBase64` — when `true`, the returned `content` is Base64-decoded.
- `options.onDesktopStateChange` — receives `DesktopSigningState` updates
  when the desktop path is used.

### `client.useRestorePoint(restorePoint)`

Recovers an in-progress mobile signing session after a page reload. Pass a
stable identifier (e.g. a hash of the document and page URL). Returns the
`SignedObject` if the document was signed while the page was away,
otherwise `null`. See the JSDoc on
`AutogramVMobileIntegrationInterfaceStateful.useRestorePoint` for the full
lifecycle.

## Desktop-only signing: `DesktopClient` (`autogram-sdk`)

Headless client for the desktop app (no dialog UI). Handles launching the
app, readiness polling, and mapping cancellations.

```typescript
import { DesktopClient } from "autogram-sdk";

const desktop = new DesktopClient();
const signed = await desktop.sign(document, parameters, payloadMimeType, {
  abortController,
  onStateChange: (state) => console.log(state.type),
});
```

- `desktop.sign(document, parameters?, payloadMimeType?, options?)` — sign a
  single document. `options`: `onStateChange`, `abortController`, `batchId`.
- `desktop.startBatch(totalNumberOfDocuments, options?)` — start a batch
  signing session; resolves with the `batchId` to pass to `sign`.
- `desktop.endBatch(batchId, abortController?)` — close the batch.
- `desktop.launch(abortController?, onStateChange?)` — ensure the app is
  running (called automatically by `sign`/`startBatch`).

`DesktopSigningState` (reported via `onStateChange` and shown by the
`CombinedClient` UI):

```
checkingApp → launchingApp → (appMayNotBeInstalled) → waitingForSignature
                                   ↘ appNotInstalled
signingCancelled | error
```

## Mobile-only signing: `MobileClient` (`autogram-sdk`)

The recommended headless mobile API. Long-lived state (integration keys,
device pairings) belongs to the client; each document is an independent,
resumable `SignatureRequest`.

```typescript
import { AutogramVMobileIntegration, MobileClient } from "autogram-sdk";
import { get, set } from "idb-keyval";

const mobile = new MobileClient(new AutogramVMobileIntegration({ get, set }));
await mobile.register({ platform: "web", displayName: "My app" });

const request = await mobile.requestSignature({
  document: { content, filename },
  parameters: { level: "XAdES_BASELINE_B" },
  payloadMimeType: "text/plain",
});

if ((await mobile.pairedDevices()).length > 0) {
  // paired phone gets a push notification — no QR scan needed
  // (requestSignature already notified; request.notifyDevices() re-sends)
} else {
  showQr(await request.qrCodeUrl({ pairDevice: true })); // scanning also pairs
}

const signed = await request.waitForSignature({ signal: abortSignal });
```

### `MobileClient`

- `register(info)` — load the persisted integration or register a new one
  (idempotent).
- `pairedDevices()` — devices that can be reached by push notification.
- `pairingQrCodeUrl()` — QR that pairs a device without signing anything.
- `requestSignature(documentToSign, { notifyDevices? })` — upload a
  document; notifies paired devices by default.
- `resumeRequest(token)` — recreate a `SignatureRequest` from a persisted
  token (`null` if the token is invalid).

### `SignatureRequest`

- `token` — plain JSON-serializable `{ guid, encryptionKey, lastModified }`;
  persist it to resume the request after a reload or worker restart.
- `qrCodeUrl({ pairDevice? })` — URL to show as QR; with `pairDevice` the
  scan also pairs the device for future push notifications.
- `notifyDevices()` — push notification to paired devices (failures are
  logged, never thrown — keep the QR as fallback).
- `status()` — `{ state: "pending" | "expired" }` or
  `{ state: "signed", document }` (single check, no polling).
- `waitForSignature({ signal? })` — polls until signed; rejects with
  `AutogramError` code `aborted` when the signal fires.

Documents auto-delete from the AVM server 24 hours after upload —
`status()` reports `expired` after that. Note that a QR scan is inherently
per-document (the QR encodes the document GUID + key); "scan once, sign
many" works through pairing + notifications.

### `RestorePointStore`

Persists request tokens under caller-chosen identifiers so a signing
session survives page reloads (e.g. when the OS suspends the browser while
the user signs in the mobile app):

```typescript
const store = new RestorePointStore({ get, set }, mobile);
const result = await store.use(restorePointId, currentRequest?.token ?? null);
// result.outcome: "none" | "pending" (resume waiting) | "signed" (done)
```

### Low-level: `AutogramVMobileIntegration`

Direct client for the AVM server API, used as the backend of
`MobileClient` (any `MobileIntegrationBackend` implementation works, which
is how the browser extension bridges calls to its background worker).
Key methods: `loadOrRegister`, `addDocument`, `getQrCodeUrl(docRef,
enableIntegration?)`, `getPairingQrCodeUrl`, `sendNotification(docRef)`,
`checkDocumentStatus(docRef)`, `waitForSignature(docRef, abortController)`,
`getDevices`, `setBaseUrl`/`getBaseUrl`, `getIntegrationGuid`.

## Types

### `SignedObject` (`autogram-sdk`)

Unified result of a signing operation:

```typescript
interface SignedObject {
  content: string;   // signed document, Base64 (unless decodeBase64 was used)
  signedBy: string;  // DN of the signing certificate
  issuedBy: string;  // DN of the certificate issuer
}
```

### Renamed re-exports

Backend-specific generated types are re-exported with `Desktop`/`AVM`
prefixes, e.g. `DesktopSignatureParameters`, `DesktopAutogramDocument`,
`DesktopServerInfo`, `AVMDocumentToSign`, `AVMSignedDocument`,
`AVMIntegrationDocument`. Use these when you talk to one backend directly.

## Errors

All SDK errors carry a machine-readable code and survive serialization
(e.g. `postMessage` between browser-extension contexts).

```typescript
import { AutogramError } from "autogram-sdk";

try {
  await client.sign(...);
} catch (e) {
  if (AutogramError.is(e, "user-cancelled")) {
    // user closed the dialog / cancelled in the app — not a failure
  } else if (AutogramError.is(e, "app-not-installed")) {
    // point the user to autogram.slovensko.digital
  } else {
    throw e;
  }
}
```

### `AutogramErrorCode`

| Code | Meaning |
| --- | --- |
| `user-cancelled` | User actively cancelled the signing flow |
| `aborted` | Operation aborted programmatically (AbortSignal, page close) |
| `timeout` | Operation did not finish in time |
| `app-not-installed` | Desktop app could not be launched |
| `connection-failed` | Network request to a signing backend failed |
| `protocol-error` | Unexpected response shape or bridge failure |
| `server-error` | Signing backend reported an error |
| `unknown` | Unclassified |

### `AutogramError`

- `error.code` — an `AutogramErrorCode`.
- `AutogramError.is(e, code?)` — classify an error. **Prefer this over
  `instanceof`**: it also recognizes errors that crossed a serialization
  boundary (plain `{ name, code, message }` objects) and errors from older
  SDK versions identified only by class name.
- `error.toJSON()` / `AutogramError.fromJSON(data)` — serialize an error to
  a plain object and rehydrate it on the other side of a `postMessage`
  boundary. `fromJSON` reconstructs concrete classes for known codes, so
  in-bundle `instanceof` checks keep working.

Concrete classes (kept for compatibility; all extend `AutogramError`):
`UserCancelledSigningException` (`user-cancelled`),
`AutogramAppNotInstalledException` (`app-not-installed`),
`AutogramSdkException(message, code?)` (generic, deprecated — prefer
`AutogramError` with a specific code).

## RPC bridge (advanced, for embedders)

For environments where SDK calls must cross execution contexts (the
browser extension bridges page ↔ content script ↔ background worker),
the SDK ships a typed RPC layer. A service is defined once as a method
table — zod args/result schemas plus timeout policy — and both sides are
generated from it:

```typescript
import { defineRpcService, createRpcClient, createRpcHandler } from "autogram-sdk";
import { z } from "zod";

const service = defineRpcService("my-service", {
  greet: {
    args: z.object({ name: z.string() }),
    result: z.string(),
    timeoutMs: 10_000,
    timeoutMessage: "Greeting timed out",
  },
});

// caller side — transport moves plain JSON frames (postMessage/CustomEvent/Port)
const client = createRpcClient(service, transport);
await client.greet({ name: "svet" }, { signal });   // typed, abortable

// handler side
const handler = createRpcHandler(service, {
  greet: async (args, context) => `ahoj ${args.name}`, // context.signal fires on abort
});
```

Both sides validate against the same schemas; errors cross the boundary
as serialized `AutogramError`s and are rehydrated on the caller. Client
`AbortSignal`s and timeouts emit abort frames, so the handler's
`context.signal` fires and long-running work is cancelled on the far
side too. `handler.abortSender(senderId)` cancels everything from one
caller (e.g. on port disconnect).

Most applications never need this — it exists for embedders implementing
custom channels.

## Stability notes

- The internal flow controller (`SigningFlow`, `SigningState`,
  `SigningFlowDelegate` in `src/flow.ts`) is deliberately **not** exported
  from the package root: its shape may change until the redesign settles.
  Build on `createAutogramClient` instead.
- `sign`'s positional parameters are a candidate for an options-object
  redesign; see [API-PROPOSAL.md](./API-PROPOSAL.md) for the roadmap.
- `AutogramVMobileIntegrationInterfaceStateful` (the channel contract used
  by `CombinedClient`) is public because the browser extension implements
  it, but its hidden-current-document design is planned to be replaced by
  explicit signature requests (see proposal). Implement it only if you are
  bridging the SDK into another execution context.
