# Migration guide

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
