# Autogram SDK — public API (0.2.x)

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

## Signing with UI: `CombinedClient` (`autogram-sdk/with-ui`)

The recommended way to sign documents from a web page. Shows a dialog where
the user picks a signing method (desktop app / mobile app), then drives the
chosen flow.

```typescript
import { CombinedClient } from "autogram-sdk/with-ui";

const client = await CombinedClient.init();

const { content, signedBy, issuedBy } = await client.sign(
  { content: "hello world", filename: "hello.txt" },   // document
  { level: "XAdES_BASELINE_B", container: "ASiC_E" },  // signature parameters
  "text/plain",                                        // payload MIME type
  true                                                 // decode Base64 result
);
```

### `CombinedClient.init(mobileChannel?, desktopChannel?, resetSignRequestCallback?, options?)`

Async factory (waits for the dialog UI element to attach).

- `mobileChannel` — implementation of `AutogramVMobileIntegrationInterfaceStateful`;
  defaults to `AvmSimpleChannel` (direct HTTPS calls to the AVM server).
- `desktopChannel` — implementation of `AutogramDesktopIntegrationInterface`;
  defaults to `AutogramDesktopSimpleChannel` (direct HTTP calls to the local
  desktop app, with a Safari loopback fallback).
- `resetSignRequestCallback` — called when the client resets its state.
- `options.enableNotifications` — send push notifications to paired mobile
  devices (default `true`).
- `options.platform` / `options.displayName` — how this integration
  identifies itself when registering with the AVM server.

Channels only need to be provided when network calls must happen in a
different execution context (the browser extension routes them through its
background worker; see the repository README).

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

## Mobile-only integration: `AutogramVMobileIntegration` (`autogram-sdk`)

Stateless-per-document client for the AVM server. Persists integration
keys through the `DBInterface` you provide (e.g. `idb-keyval`'s
`get`/`set`).

```typescript
import { AutogramVMobileIntegration } from "autogram-sdk";
import { get, set } from "idb-keyval";

const avm = new AutogramVMobileIntegration({ get, set });
await avm.loadOrRegister({ platform: "web", displayName: "My app" });

const docRef = await avm.addDocument({ document, parameters, payloadMimeType });
const qrUrl = await avm.getQrCodeUrl(docRef);      // show as QR code
await avm.sendNotification(docRef);                // notify paired devices
const signed = await avm.waitForSignature(docRef, abortController);
```

Key methods: `loadOrRegister`, `addDocument`, `getQrCodeUrl(docRef,
enableIntegration?)`, `getPairingQrCodeUrl`, `sendNotification(docRef)`,
`checkDocumentStatus(docRef)`, `waitForSignature(docRef, abortController)`,
`getDevices`, `setBaseUrl`/`getBaseUrl`, `getIntegrationGuid`.

`AvmIntegrationDocument` (`{ guid, encryptionKey, lastModified }`) is a
plain serializable reference — persist it to resume waiting for a signature
later (this is what restore points do).

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

## Stability notes

- `CombinedClient.init`'s positional signature and `sign`'s positional
  parameters are candidates for an options-object redesign; see
  [API-PROPOSAL.md](./API-PROPOSAL.md) for the roadmap.
- `AutogramVMobileIntegrationInterfaceStateful` (the channel contract used
  by `CombinedClient`) is public because the browser extension implements
  it, but its hidden-current-document design is planned to be replaced by
  explicit signature requests (see proposal). Implement it only if you are
  bridging the SDK into another execution context.
