# API redesign proposal / roadmap

Status: agreed direction (2026-07); implemented incrementally.
Phase 1 (bug fixes) and Phase 2 (errors) shipped in SDK 0.2.0.

Fixed external surfaces that this proposal must not change:

- **Autogram desktop HTTP API** (OpenAPI, `autogram-api.generated.ts`)
- **Autogram v Mobile server API** (OpenAPI, `avm-api.generated.ts`)
- **Ditec D.Signer/D.Bridge JS API** that the extension overrides on
  government portals (`ditec.dSigXadesJs`, `ditec.dSigXadesBpJs`, …)

Everything else — SDK public API, extension internals — is in scope.

## Problems being addressed

1. **Hidden state machine in the mobile channel.**
   `AutogramVMobileIntegrationInterfaceStateful` requires
   `loadOrRegister → addDocument → getQrCodeUrl → waitForSignature → reset`
   in order, with "the current document" as invisible state. Downstream
   costs: the background worker re-keys that state by sender and persists
   it to survive MV3 suspension; restore points are implemented twice with
   different semantics; two parallel interfaces exist for the same thing.
2. **Two document models, two result models.** Desktop signs
   `{content, filename}` + separate `payloadMimeType`; AVM nests
   `{document, parameters, payloadMimeType}`. Desktop returns
   `{content, signedBy, issuedBy}`; AVM returns
   `{filename, mimeType, content, signers[]}` and the SDK flattens it,
   discarding `mimeType`, `filename` and all but the last signer.
3. **Hostile signatures.** `CombinedClient.init` takes four positional
   arguments; `sign` has a boolean flag in position four; `AbortController`
   is passed (instead of `AbortSignal` in an options bag) in arbitrary
   positional slots.
4. **The extension bridge is hand-written three times per method**
   (injected caller + zod response schema, content passthrough, background
   executor + zod args schema), with stringly-typed method names and
   already-drifted schemas.
5. **Errors did not survive serialization.** Fixed in 0.2.0
   (`AutogramError` with codes + `toJSON`/`fromJSON`/`is`).
6. **UI and flow logic are fused** in `CombinedClient`, making the flow
   untestable without custom elements and forcing the `with-ui` entry-point
   split.

## Target design

### Core types (SDK)

```typescript
interface DocumentToSign {
  content: string;
  mimeType: string;                  // belongs to the document, not the sign() call
  encoding?: "utf-8" | "base64";     // replaces the ";base64" mimetype suffix magic
  filename?: string;
}

interface SignedDocument {
  content: string;
  mimeType: string;
  filename?: string;
  encoding: "utf-8" | "base64";
  signatures: Array<{ signedBy?: string; issuedBy?: string }>; // never flattened
}
```

Both backends produce `SignedDocument`; adapters to the legacy generated
shapes live at the edges. The current `SignedObject` remains as a
compatibility alias until the flip.

### Mobile: pairing is long-lived, signature requests are per-document

Grounding in the AVM server model (see avm-server README): the server is
per-document stateless — each document has its own GUID + encryption key,
the QR code encodes exactly that pair, documents auto-delete after 24 h,
and there is no server-side session grouping documents. "Scan once, sign
many" exists only through the optional device pairing: the first QR embeds
an integration JWT which pairs the device, and every subsequent document
reaches the phone via a `sign-request` push notification. Pairing is
optional; unpaired signing (one scan per document) must keep working —
that is the protocol, not an SDK limitation.

```typescript
interface MobileClient {
  register(info?: RegistrationInfo): Promise<void>;   // idempotent load-or-register
  pairedDevices(): Promise<PairedDevice[]>;
  pairingQrCodeUrl(): Promise<string>;

  requestSignature(doc: DocumentToSign, params?: SignatureParameters): Promise<SignatureRequest>;
  resumeRequest(token: RequestToken): Promise<SignatureRequest | null>;
}

interface SignatureRequest {
  /** JSON-serializable {guid, encryptionKey, lastModified}; persist for restore. */
  readonly token: RequestToken;
  qrCodeUrl(opts?: { pairDevice?: boolean }): Promise<string>;
  notifyDevices(): Promise<void>;                      // push to already-paired devices
  status(): Promise<"pending" | "signed" | "expired">;
  waitForSignature(opts?: { signal?: AbortSignal }): Promise<SignedDocument>;
}
```

Multi-document UI flow: first-ever document shows the QR with
`pairDevice: true`; when `pairedDevices()` is non-empty, later documents
call `notifyDevices()` and show "check your phone" with the QR as
fallback (plus a retry-notification button).

Wins:

- Restore points become "persist `request.token`, call `resumeRequest`
  later" — both current divergent implementations collapse.
- The background worker stores tokens by sender instead of the
  documentRef + waitingForSignature record dance; MV3 resume is
  `resumeRequest(storedToken)`.
- Multiple in-flight documents work naturally (one request each).
- If AVM later adds a true multi-document envelope, it slots in as
  `requestSignatures(docs[]) → SignatureRequest` without a model change.

### Desktop client hygiene

```typescript
interface DesktopClient {
  info(): Promise<ServerInfo>;
  launch(opts?: { signal?: AbortSignal; onState?: (s: SigningState) => void }): Promise<void>;
  sign(doc: DocumentToSign, params?: SignatureParameters,
       opts?: { signal?: AbortSignal; batchId?: string; onState?: (s: SigningState) => void }
  ): Promise<SignedDocument>;
  startBatch(count: number, opts?: { signal?: AbortSignal }): Promise<Batch>; // Batch = { id, end() }
}
```

`AbortSignal` in an options bag everywhere;
`waitForStatus(status, { timeoutMs, pollMs, signal })`; drop the no-op
`stateType()`; drop the `onStateChange`/`onDesktopStateChange` alias pair.

### Flow/UI split — internal seam, not a public extension point

Integrators will keep using the built-in dialog, so the split is for
maintainability and testability, not for custom UIs:

- One public class (today's `CombinedClient`); public surface stays
  "`sign()` plus a few knobs".
- Internally: a **flow controller** (pure async logic: choose method →
  drive desktop or mobile path → produce `SignedDocument`) and the **Lit
  root**, connected by a `SigningState` event stream plus one input
  (`chooseMethod(): Promise<SigningMethod>`, which the UI resolves — the
  seam already exists as `ui.startSigning()`).
- One state union covering both paths (today only desktop reports state;
  the mobile path is driven by direct UI method calls):

```typescript
type SigningState =
  | { type: "choosing-method" }
  | { type: "desktop"; state: "checking" | "launching" | "maybe-not-installed" | "waiting" }
  | { type: "mobile";  state: "uploading" | "qr-ready" | "waiting"; qrUrl?: string; pairingUrl?: string }
  | { type: "restorable"; restoreKey: string }
  | { type: "done" } | { type: "cancelled" } | { type: "error"; error: AutogramError };
```

- The event stream stays `@internal`/undocumented; exposing it later is
  cheap, retracting a public API is not.
- Payoffs: the flow controller becomes unit-testable without
  jsdom/custom-elements; the custom-element side effect stays quarantined
  in the UI module.
- `resetSignRequestCallback`, `getSignatureIndex`, and
  `signerIdentificationListeners` leave the SDK; the Ditec adapter tracks
  its own signature counter.

### Facade

```typescript
const client = await createAutogramClient({ /* transports, registration */ });

const signed = await client.sign(doc, params, {
  signal,
  method: "desktop" | "mobile",   // optional: skip the chooser
  restoreKey: "…",                // optional: replaces useRestorePoint choreography
});
```

Entry points after the flip (replacing the `index` / `index-all` /
`with-ui` drift):

```
autogram-sdk            → types, errors, headless clients
autogram-sdk/ui         → client with built-in dialog (custom-element side effects live here only)
autogram-sdk/desktop    → low-level generated desktop API client
autogram-sdk/mobile     → low-level AVM API client + device-side client
autogram-sdk/transport  → transport interfaces + RPC helpers (below)
```

### Extension bridge: keep the layers, single-source the wire format

The three layers exist for real platform reasons (page JS cannot use
`chrome.runtime`, Firefox needs `cloneInto`, MV3 workers suspend, only
content scripts hold the port). What varies per boundary stays as small
transport adapters implementing `send(frame)` / `onFrame(cb)` over a plain
JSON frame:

```
{ id, service, method, payload } | { id, ok, payload } | { id, abort }
```

What does not vary is written once — a method table per service (name,
zod args schema, zod result schema, cancellable?, timeout):

```typescript
const avmRpc = defineRpc("avm", {
  requestSignature: { args: ZRequestSignatureArgs, result: ZRequestToken },
  waitForSignature: { args: ZRequestToken, result: ZSignedDocument, cancellable: true, timeoutMs: null },
  // ...
});
```

- Injected side: `createRpcClient(avmRpc, transport)` → typed proxy
  (replaces the per-method send/timeout/parse/error boilerplate in
  `channel/web.ts`).
- Content script: stays a dumb passthrough.
- Background: `createRpcHandler(avmRpc, implementation)` — validation,
  `AutogramError.toJSON()` envelope, dispatch, and per-request
  `AbortController` tracking (the `{ id, abort }` frame makes *all* long
  calls cancellable, replacing the hand-rolled `abortWaitForSignature`
  and the silently-dropped desktop aborts).
- The serialization constraint is enforced by construction: schemas only
  admit JSON-safe shapes, so per-method `cloneInto`/stringify concerns
  disappear.
- Acceptance test for the design: adding a new method = one entry in the
  method table + its background implementation, zero edits elsewhere.

Explicit non-goal: a pluggable transport framework. Three concrete
adapters, one method table.

### Ditec adapter layer

The `dSigXades*` surface is fixed, but internally `ImplementationInterface`
becomes promise-based; the Ditec `{onSuccess, onError}` convention is
shimmed once at the adapter edge (a rejected promise always reaches
`onError`, making swallowed-error bugs structurally hard to write).
`SignRequest` + the filetype strategies stay, emitting the unified
`DocumentToSign`.

## Phasing

1. ✅ **Bug fixes** (shipped): shadowed `AutogramSdkException` in the
   extension web channel; `getSignature` swallowing errors instead of
   calling `onError` (now maps to Ditec error codes via `toDitecError`).
2. ✅ **Errors** (0.2.0): `AutogramError` + codes + `toJSON`/`fromJSON`/`is`;
   bridge uses them; `with-ui` ↔ `avm-api` cycle broken via core `types.ts`.
3. **Mobile signature requests**: `SignatureRequest` wrapper over
   `AutogramVMobileIntegration` (already ref-explicit); reimplement
   `AvmSimpleChannel` and the background `AvmExecutor` on request tokens;
   delete both `useRestorePoint` implementations in favor of token
   persistence; surface `pairedDevices()` to the UI for the
   notify-vs-scan decision.
4. **RPC layer**: method tables + `createRpcClient`/`createRpcHandler`;
   rewrite `channel/web.ts` and `background-worker.ts` against them;
   generic abort frames.
5. **Flow/UI split + facade**: extract the flow controller and the unified
   `SigningState`; introduce `createAutogramClient`; keep
   `CombinedClient.init()` as a deprecated wrapper for one release.
6. **Unified document model flip + entry-point reorganization**: switch
   public signatures to `DocumentToSign`/`SignedDocument`; deprecated
   aliases for one release; delete `index-all.ts`.

Each phase must ship with an updated [API.md](./API.md) and a
[MIGRATION.md](./MIGRATION.md) section.
