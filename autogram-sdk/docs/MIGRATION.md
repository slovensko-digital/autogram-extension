# Migration guide

## 0.6.x → 0.7.0

**Breaking.** The SDK now speaks the Autogram desktop `POST /api/v1/sign`
model everywhere, which can sign several documents into one ASiC-E container.
Every legacy call shape is removed: one call form, one parameters shape.
Older Autogram versions (< 2.8.0) and Autogram v mobile still work. The SDK
converts to the legacy `POST /sign` internally.

### `sign()` has one form

`CombinedClient.sign` and `DesktopClient.sign` both take
`sign(documents, parameters?, options?)`:

- `documents` is a `DocumentToSign` or an array of them. An array means one
  shared ASiC-E container (Autogram desktop >= 2.8.0 only).
- `parameters` are the v1 `SignatureParameters` (see the table below).
- Both return a `SignedDocumentResult`.

**Before (0.6.x legacy positional form, removed):**

```typescript
const { content, signedBy, issuedBy } = await client.sign(
  { content, filename },
  { level: "XAdES_BASELINE_B", container: "ASiC_E", autoLoadEform: true },
  "application/xml;base64",
  true // decodeBase64
);
```

**After, mechanically (one-line migration helper):**

```typescript
import { fromLegacySignArgs, toLegacySignedObject } from "autogram-sdk";

const { documents, parameters, presentation } = fromLegacySignArgs(
  { content, filename },
  { level: "XAdES_BASELINE_B", container: "ASiC_E", autoLoadEform: true },
  "application/xml;base64"
);
const result = await client.sign(documents, parameters, { presentation });
const { content, signedBy, issuedBy } = toLegacySignedObject(result);
// decodeBase64 is gone: Base64.decode(content) yourself if you need it
```

`fromLegacySignArgs` applies the old defaults when `parameters` or
`payloadMimeType` are omitted (`XAdES_BASELINE_B` with the PDF/A check,
`application/xml`). If you already have a `DocumentToSign` and only the
parameters are legacy-shaped, use `fromLegacySignatureParameters(legacy)`.
It returns `{ parameters, xdcParameters, presentation }`.

**After, idiomatically:**

```typescript
const { content, mimeType, signatures } = await client.sign(
  {
    content,
    filename,
    mimeType: "application/xml",
    encoding: "base64",
    xdcParameters: { autoLoadEform: true },
  },
  { form: "XAdES", container: "ASiC_E" }
);
```

### Parameter mapping

| 0.6.x (legacy `SignatureParameters`) | 0.7.0 |
| --- | --- |
| `level: "XAdES_BASELINE_B"` | `form: "XAdES"` (profile `BASELINE_B` is the default) |
| `level: "PAdES_BASELINE_T"` | `form: "PAdES", profile: "BASELINE_T"` |
| `level: "BASELINE_B"` (already signed documents) | `profile: "BASELINE_B"` |
| `autoLoadEform`, `identifier`, `containerXmlns`, `embedUsedSchemas`, `schema`, `schemaIdentifier`, `transformation*` | same names, on the **document**: `document.xdcParameters` |
| `fsFormId` | `document.xdcParameters.fsFormIdentifier` |
| `visualizationWidth` | `options.presentation.visualizationWidth` |
| `container`, `packaging`, `digestAlgorithm`, `en319132`, `*Canonicalization`, `checkPDFACompliance` | unchanged |
| — | new: `requireQualifiedCertificate`, `checkPDFEmbeddedAttachments` (Autogram >= 2.8.0, desktop only) |
| `payloadMimeType: "application/pdf;base64"` | `document.mimeType: "application/pdf"`, `document.encoding: "base64"` |

Passing legacy-only keys (`level`, `fsFormId`, `visualizationWidth`, XDC
fields) in `parameters` throws. Every v1 parameter is optional, so
TypeScript accepts a legacy-shaped variable there. Without the throw,
Autogram would silently ignore those keys.

### `DesktopClient.sign`

The `(document, parameters, payloadMimeType, options)` overload is removed.
`DesktopClient.sign` now takes `DocumentToSign`s like `CombinedClient` and
returns a `SignedDocumentResult` (use `toLegacySignedObject()` for the old
`{ content, signedBy, issuedBy }`). `batchId` stays in `options` and only
works with a single document. `options.presentation` is new. `launch()` now
resolves with the server info and accepts `{ minimumAppVersion }`.

### Renamed types

| 0.6.x | 0.7.0 |
| --- | --- |
| `DesktopSignatureParameters` (legacy shape) | `DesktopLegacySignatureParameters` |
| `DesktopAutogramDocument` (legacy shape) | `DesktopLegacyAutogramDocument` |
| — | `DesktopSignatureParameters`, `DesktopAutogramDocument` now name the `/api/v1/sign` types; new `DesktopXDCParameters`, `DesktopPresentationParameters`, `DesktopSignRequestBody` |

In `autogram-sdk/autogram-api` the unprefixed `AutogramDocument` and
`SignatureParameters` are now the v1 types. The legacy ones are
`LegacyAutogramDocument` and `LegacySignatureParameters`.

### Desktop API client and custom desktop channels

The low-level `POST /sign` method is renamed `sign` → **`signLegacy`**. This
affects `apiClient()` (`desktopApiClient`), `AutogramDesktopSimpleChannel`
and `AutogramDesktopIntegrationInterface`. The arguments are unchanged.
Custom channels must rename the method.

`AutogramDesktopIntegrationInterface` gains an **optional** `signV1(body)`
(`POST /api/v1/sign`). Channels that implement only `signLegacy` keep
working for single documents. Multi-document requests then fail with
`not-supported`. `DesktopSignResponseBody` gains optional `mimeType` and
`filename` (Autogram >= 2.8.0). `fromDesktopResponse` prefers them over the
inferred MIME type.

### New error codes and state

- `app-version-too-low` (`AutogramAppVersionTooLowException`, with
  `requiredVersion`/`detectedVersion`): the desktop app is older than
  2.8.0 and the request needs it.
- `not-supported` (`MultiDocumentSigningOnMobileException` and others):
  the signing method cannot fulfil the request, for example multiple
  documents on a mobile device, or v1-only checks with Autogram v mobile.
- `DesktopSigningState` gains `{ type: "appVersionTooLow", requiredVersion,
  detectedVersion }`. Exhaustive `switch`es over it need a new case.

## 0.5.0 → 0.6.0

No breaking changes. A unified document/result model is introduced; the
old positional `sign` form still works and returns the old shape.

### Unified `sign` form

**Before (0.5.x, still supported):**

```typescript
const { content, signedBy, issuedBy } = await client.sign(
  { content, filename },
  parameters,
  "application/pdf;base64",   // MIME type + encoding as a suffix
  true                        // decodeBase64
);
```

**After (0.6.0):**

```typescript
const { content, mimeType, signatures } = await client.sign(
  { content, mimeType: "application/pdf", encoding: "base64", filename },
  parameters,
  { signal, onState }
);
```

Differences:

- The MIME type and encoding move onto the document
  (`{ mimeType, encoding }`); the `";base64"` suffix and the
  `decodeBase64` flag are gone from the new form.
- The result is a `SignedDocumentResult` that keeps **every** signer
  (`signatures: [{ signedBy, issuedBy }, ...]`) and the artifact
  `mimeType` — the old form flattened to the last signer only.
- `options.signal` (an `AbortSignal`) cancels the signing step.

The SDK detects which form you called by the third argument: a `string`
selects the deprecated positional form (unchanged behavior, returns
`SignedObject`), otherwise the unified form is used.

Conversion helpers are exported from `autogram-sdk`:
`toPayloadMimeType`, `fromDesktopResponse`, `fromAvmSignedDocument`,
`toLegacySignedObject`.

### New entry-point alias

`autogram-sdk/ui` is added as an alias of `autogram-sdk/with-ui` (same
module). `with-ui` keeps working.

`SignedObject`, `DocumentToSign`, `SignedDocumentResult` and the
converters are all exported from the package root.

## 0.4.0 → 0.5.0

No breaking changes. The signing flow logic was extracted from
`CombinedClient` into an internal, headless controller; the public
behavior is unchanged.

### Prefer `createAutogramClient` over `CombinedClient.init`

**Before (0.4.x):**

```typescript
const client = await CombinedClient.init(
  new MyAvmChannel(),
  new MyDesktopChannel(),
  () => {},
  { enableNotifications: true, platform: "web", displayName: "My app" }
);
```

**After (0.5.0):**

```typescript
const client = await createAutogramClient({
  mobileChannel: new MyAvmChannel(),
  desktopChannel: new MyDesktopChannel(),
  onResetSignRequest: () => {},
  platform: "web",
  displayName: "My app",
});
```

`CombinedClient.init` keeps working but is deprecated. `SigningMethod`
is now also exported from the package root (`autogram-sdk`); the old
import path (`injected-ui/types`) still re-exports it.

The internal flow controller (`src/flow.ts`) is not part of the public
API — do not import it directly.

## 0.3.0 → 0.4.0

0.4.0 adds the typed RPC layer (`defineRpcService`, `createRpcClient`,
`createRpcHandler` — see the "RPC bridge" section of [API.md](./API.md))
and rewrites the browser extension's bridge on top of it. **Web-page SDK
consumers are unaffected** — no public API changed.

For the extension (this repository):

- The injected ↔ content ↔ background wire format changed to generic RPC
  frames (`{id, service, method, payload}` / `{id, ok, payload}` /
  `{id, abort: true}`). All three scripts ship in one extension release,
  so there is no cross-version concern.
- Method schemas live in one place
  (`src/dbridge_js/autogram/channel/services.ts`); the per-method caller
  and dispatcher boilerplate in `channel/web.ts` and
  `background-worker.ts` is generated from it.
- Cancellation is generic: every request can be aborted with an abort
  frame. Desktop `sign`, `waitForStatus`, `startBatch` and `endBatch`
  are now abortable across the bridge (previously the `AbortController`
  was silently dropped). The AVM-specific `abortWaitForSignature` wire
  method is gone.
- `batchId` is now forwarded on desktop `sign` (previously dropped by
  the bridge).
- The desktop signature-parameters schema now matches the generated
  OpenAPI type: `level` is optional and `fsFormId` is no longer
  stripped by validation.

## 0.2.0 → 0.3.0

0.3.0 introduces the explicit mobile signing API (`MobileClient` /
`SignatureRequest` / `RestorePointStore`). No breaking changes — the
stateful channel interface and `AutogramVMobileIntegration` keep working —
but new code should use signature requests.

### Prefer `MobileClient` over driving `AutogramVMobileIntegration` directly

**Before (0.2.x):**

```typescript
const avm = new AutogramVMobileIntegration({ get, set });
await avm.loadOrRegister({ platform: "web", displayName: "My app" });
const docRef = await avm.addDocument(documentToSign);
const qrUrl = await avm.getQrCodeUrl(docRef);
await avm.sendNotification(docRef);
const signed = await avm.waitForSignature(docRef, abortController);
```

**After (0.3.0):**

```typescript
const mobile = new MobileClient(new AutogramVMobileIntegration({ get, set }));
await mobile.register({ platform: "web", displayName: "My app" });
const request = await mobile.requestSignature(documentToSign); // notifies paired devices
const qrUrl = await request.qrCodeUrl({ pairDevice: true });
const signed = await request.waitForSignature({ signal });
```

Differences to note:

- `waitForSignature` takes `{ signal?: AbortSignal }` instead of an
  `AbortController`, and rejects with `AutogramError` code `aborted`
  (previously a plain `Error("Aborted")`). If you matched on the message
  string, switch to `AutogramError.is(e, "aborted")`.
- `request.token` is plain JSON — persist it and call
  `mobile.resumeRequest(token)` to continue after a reload. This replaces
  hand-rolled persistence of `AvmIntegrationDocument` references (the
  shapes are identical, so existing persisted references work as tokens).

### Restore points unified in `RestorePointStore`

`AvmSimpleChannel.useRestorePoint` and the extension background worker now
share one implementation. Previously persisted restore points keep
working: the store reads both the token format and the extension's legacy
string-pointer format, and both call sites keep their historical key
prefixes (`restorePoint:` / `autogram:avm:restorePoint:`). Behavior
changes:

- Restore points are now deleted after a successful signed-restore (the
  background worker previously leaked them).
- The background worker now snapshots the request token at restore-point
  creation instead of storing a live pointer, so a subsequently added
  document no longer silently retargets an existing restore point.

### Deliberate aborts no longer show the error dialog

`CombinedClient.sign` treats `AutogramError` code `aborted` (user closed
the dialog, wait timeout) like a cancellation: the error is rethrown to
the caller but no error screen is shown.

## 0.1.x → 0.2.0

0.2.0 hardens error handling and untangles internal module dependencies.
No call sites *must* change — all 0.1.x exports keep working — but error
classification code *should* move to the new `AutogramError` API.

### Errors now carry machine-readable codes

Every SDK error extends the new `AutogramError` base class and carries a
`code` (`AutogramErrorCode`):

| Class (unchanged) | `code` |
| --- | --- |
| `UserCancelledSigningException` | `user-cancelled` |
| `AutogramAppNotInstalledException` | `app-not-installed` |
| `AutogramSdkException` | `unknown` (or the code passed to its new optional second constructor argument) |

**Before (0.1.x):**

```typescript
try {
  await client.sign(...);
} catch (e) {
  if (e instanceof UserCancelledSigningException) { ... }
  // fragile: fails when the error crossed postMessage or a duplicate bundle
  if ((e as Error)?.name === "UserCancelledSigningException") { ... }
}
```

**After (0.2.0):**

```typescript
import { AutogramError } from "autogram-sdk";

try {
  await client.sign(...);
} catch (e) {
  if (AutogramError.is(e, "user-cancelled")) { ... }
  else if (AutogramError.is(e, "app-not-installed")) { ... }
}
```

`AutogramError.is()` matches real instances, serialized plain objects
(`{ code, message }`), and legacy 0.1.x error names, so it is safe on
errors received from any execution context.

`instanceof` checks against the concrete classes still work within a
single bundle — nothing breaks — but new code should use `is()`.

### Serializing errors across execution contexts

If you forward SDK errors over `postMessage` (custom channel
implementations, workers), use the new round-trip helpers instead of
ad-hoc `JSON.stringify` + name matching:

```typescript
// sending side
port.postMessage({ id, error: AutogramError.is(e) ? e.toJSON() : { message: String(e) } });

// receiving side
reject(AutogramError.fromJSON(data.error));
```

`fromJSON` also understands the 0.1.x extension-bridge envelope
(`{ message, name, cause, error: { name } }`), so mixed-version
extension/SDK deployments keep working.

### `SignedObject` moved (import path only)

`SignedObject` is now defined in the dependency-free core module and
exported from the package root:

```typescript
// before
import type { SignedObject } from "autogram-sdk/with-ui";
// after (old path still re-exports it)
import type { SignedObject } from "autogram-sdk";
```

The shape is unchanged (`{ content, signedBy, issuedBy }`). This removes a
circular dependency between `with-ui` and `avm-api`; importing the type no
longer implies the custom-elements side effects of `with-ui`.

### Deprecations (still functional)

- `new AutogramSdkException(message)` — prefer
  `new AutogramError(code, message)` with a specific code.
- Catching by class name string — prefer `AutogramError.is()`.

### For the browser extension (this repository)

- The injected↔background bridge now serializes errors with
  `toJSON`/`fromJSON`; the background worker includes `code` in its error
  envelope. Older extension versions talking to a newer SDK (or vice
  versa) degrade gracefully through the legacy-name fallback.
- Ditec `onError` callbacks now receive `{ code, message }` objects with
  D.Bridge-compatible codes (`ditec.utils.ERROR_CANCELLED` etc.), mapped
  from SDK errors via `toDitecError`.
