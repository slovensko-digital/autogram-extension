# Refactor handoff — remaining work, step by step

This document describes exactly how to finish the API refactor on branch
`pom/rearchitect-api`. It is written to be executable without additional
context. Read [API-PROPOSAL.md](./API-PROPOSAL.md) first for the design
rationale; this file is the "how", that one is the "why".

## Current state (as of this document)

| Phase | Status | Commit |
| --- | --- | --- |
| 1. Bug fixes (shadowed exception, swallowed `getSignature` errors) | ✅ committed | `1b0bc68` |
| 2. `AutogramError` + codes + serialization (SDK 0.2.0) | ✅ committed | `1b0bc68` |
| 3. `MobileClient` / `SignatureRequest` / `RestorePointStore` (SDK 0.3.0) | ✅ committed | `dbf7341` |
| 4. Typed RPC layer for the extension bridge | ✅ code complete, verified, **uncommitted** | — |
| 5. Flow/UI split + options-object facade | ❌ not started | — |
| 6. Unified document model + entry-point reorg | ❌ not started | — |

Verified at time of writing: `npm run typecheck`, `npm run build`,
`npm test` (SDK: 43 tests in `errors.test.ts`, `mobile.test.ts`,
`rpc.test.ts`; extension: 11 tests) — all green. `npm run lint` was NOT
yet run for phase 4.

## Ground rules (apply to every step)

1. **Never change external API surfaces**: the generated files
   `autogram-sdk/src/autogram-api/lib/autogram-api.generated.ts` and
   `autogram-sdk/src/avm-api/lib/avm-api.generated.ts` (regenerate via npm
   scripts only, never edit), and the Ditec `dSigXades*` adapter method
   signatures in `autogram-extension/src/dbridge_js/ditecx/dsig-*.ts`
   (they mirror Ditec D.Signer; portals call them).
2. **Backwards compatibility**: every public SDK export existing today
   must keep working. New APIs are added; old ones get `@deprecated`
   JSDoc, never deleted (until a major version, which is out of scope).
3. **Classify errors with `AutogramError.is(e, code?)`**, never
   `instanceof`, whenever the error may have crossed `postMessage`.
4. **Every phase ships with docs**: update `docs/API.md` (reference),
   `docs/MIGRATION.md` (new top section), `docs/API-PROPOSAL.md` (mark
   the phase ✅ with a short note), bump the minor version in
   `autogram-sdk/package.json`, and commit with a descriptive message
   ending in `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.
5. **Verification loop after any SDK change** (run from the repo root):

   ```bash
   npm run build:sdk     # extension tests resolve autogram-sdk from dist/, not src/
   npm run typecheck     # extension typechecks SDK *sources* via tsconfig paths
   npm test
   npm run lint
   ```

   Note the asymmetry: typecheck uses `../autogram-sdk/src` (paths
   mapping), tests use `../autogram-sdk/dist` (node resolution). A stale
   `dist/` makes tests test old code — always rebuild the SDK first.
6. **Toolchain gotchas** (already configured, don't undo):
   - The extension tsconfig targets ES5. ts-jest configs override
     `target: "ES2022"` because ES5-downleveled `class extends Error`
     breaks `instanceof`. Don't write `for..of` over `Map`/`Set` in SDK
     files (extension typechecks them under ES5) — use `.forEach`.
   - `autogram-extension/jest.setup.cjs` polyfills `TextEncoder` for
     jsdom; `autogram-sdk/jest.config.cjs` ignores the parked
     live-network test `avm-api/lib/apiClient.test.ts`.
   - Run jest from inside the package directory (`autogram-sdk/` or
     `autogram-extension/`), not the repo root (the root has no jest
     config and picks up babel, which cannot parse TS).

---

## Step 0 — finish phase 4 (≈30 min)

Phase 4 replaced the hand-written three-layer extension bridge with a
typed RPC layer. What exists:

- `autogram-sdk/src/rpc.ts` — frames (`ZRpcRequestFrame`,
  `ZRpcAbortFrame`, `ZRpcResponseFrame`), `defineRpcService`,
  `createRpcClient` (typed proxy with per-method timeout + AbortSignal →
  abort frames), `createRpcHandler` (validating dispatcher exposing
  `context.signal`/`context.requestId`/`context.senderId`),
  `serializeRpcError`. Exported from `index.ts`/`index-all.ts`. Tested in
  `src/rpc.test.ts` (12 tests).
- `autogram-extension/src/dbridge_js/autogram/channel/services.ts` — the
  single source of truth: `avmService` and `autogramService` method
  tables (zod args/result schemas, timeouts, Slovak timeout messages).
- `channel/web.ts` — `AutogramDesktopChannel`/`AvmChannelWeb` are now
  thin `createRpcClient` proxies; `WebChannelCaller` is the
  CustomEvent-based `RpcClientTransport`.
- `channel/content.ts` — passthrough unchanged in role; validates
  `ZRpcCallerFrame`/`ZRpcResponseFrame`; keepalive `hello` frame is
  `{id:"hello", service:"avm", method:"hello", payload:null}` (the
  background early-returns on `method === "hello"`).
- `background-worker.ts` — `BackgroundWorker` routes frames to
  `createRpcHandler(avmService, avmExecutor.impl)` /
  `createRpcHandler(autogramService, autogramExecutor.impl)`; abort
  frames go to all handlers; port disconnect calls
  `handler.abortSender(senderId)` plus `avm.abortSenderRequests` (for
  waits resumed outside a request context). The MV3
  resume-after-suspension mechanism (`dbKeyWaitingForSignature`,
  `resumeWaitingForSignature`, `browser.alarms` 120-min timeout) is
  preserved; it now uses `context.requestId` as the message id.

Behavior changes already in the code (mention in MIGRATION.md):

- Desktop `sign`, `waitForStatus`, `startBatch`, `endBatch` are now
  abortable across the bridge (previously the AbortController was
  silently dropped).
- `batchId` is now forwarded on desktop `sign` (previously dropped).
- The signature-parameters schema now matches the generated OpenAPI type:
  `level` is optional, `fsFormId` is no longer stripped.
- The wire format between injected/content/background changed — all three
  ship in one extension release, so there is no cross-version concern.
- The AVM `abortWaitForSignature` wire method is gone (generic abort
  frames replace it).

To do:

1. `npm run lint` from the root; fix any findings in the new/rewritten
   files only.
2. `docs/API.md`: retitle to 0.4.x; add a short "RPC bridge (advanced)"
   section documenting `defineRpcService`/`createRpcClient`/
   `createRpcHandler`/`RpcClientTransport` — one paragraph + one code
   example is enough; mark it "for embedders that bridge the SDK across
   execution contexts".
3. `docs/MIGRATION.md`: new "0.3.0 → 0.4.0" top section listing the
   bullets above; state explicitly that web-page SDK consumers are
   unaffected.
4. `docs/API-PROPOSAL.md`: mark phase 4 ✅ (mirror the phase 3 entry
   style).
5. Bump `autogram-sdk/package.json` version to `0.4.0`.
6. Commit everything (`git add -A`).
7. **Recommend to the user a manual smoke test** before phase 5: load the
   built extension (`npm run build`, load `autogram-extension/dist-mv3`
   or per DEVELOPERS.md) in Chrome, open the example page
   (`npm run example-extension-usage`), run `fullUsage()` from the
   console, and exercise: desktop signing path, mobile QR path, closing
   the dialog mid-flow (abort), and a page reload during mobile signing
   (restore point). Unit tests cannot vouch for the bridge end-to-end.

---

## Step 1 — phase 5: flow/UI split + options facade (the big one)

Goal: extract the signing *flow logic* out of `CombinedClient`
(`autogram-sdk/src/with-ui.ts`) into a headless, unit-testable
controller, leaving the Lit UI as a subscriber. **The public behavior and
API of `CombinedClient` must not change.** The event stream stays
`@internal` — do not document it in API.md as stable.

### 1a. Move `SigningMethod` out of the UI module

`SigningMethod` currently lives in `src/injected-ui/types.ts`. The flow
controller must not import UI modules (that would drag custom-element
side effects into headless code). Move the enum to `src/types.ts` and
re-export it from `src/injected-ui/types.ts` (keep the old import path
working).

### 1b. Create `src/flow.ts` (headless — no DOM, no Lit imports)

```typescript
import type { AutogramVMobileIntegrationInterfaceStateful } from "./avm-api/lib/apiClient";
import type { AutogramDesktopIntegrationInterface, DesktopSigningState,
              AutogramDocument, SignatureParameters } from "./autogram-api/lib/apiClient";
import { DesktopClient } from "./desktop-client";
import { SigningMethod } from "./types";
import type { SignedObject } from "./types";

/** @internal — not a stable public API yet (see API-PROPOSAL.md phase 5) */
export type SigningState =
  | { type: "choosing-method" }
  | { type: "desktop"; state: DesktopSigningState }
  | { type: "mobile"; state: "preparing" }
  | { type: "mobile"; state: "qr-ready"; signingUrl: string; pairingUrl: string }
  | { type: "mobile-on-mobile"; state: "url-ready"; signingUrl: string }
  | { type: "restorable" }
  | { type: "done" }
  | { type: "cancelled" }
  | { type: "error"; message: string };

/** What the flow needs from a UI. CombinedClient implements this with the Lit dialog. */
export interface SigningFlowDelegate {
  /** Show the method chooser; resolve the choice, reject with
      UserCancelledSigningException when closed. On mobile devices the
      implementation may resolve immediately with mobileOnMobile. */
  chooseMethod(): Promise<SigningMethod>;
  /** Push a state update; also hand over the AbortController that cancels
      the current step so close buttons can abort it. */
  onState(state: SigningState, abortController: AbortController): void;
  /** Ask the user to confirm restoring a previous session. */
  confirmRestorePoint(): Promise<boolean>;
}

export class SigningFlow {
  constructor(
    private desktop: AutogramDesktopIntegrationInterface,
    private mobile: AutogramVMobileIntegrationInterfaceStateful,
    private delegate: SigningFlowDelegate,
    private options: { platform: string; displayName?: string }
  ) {}

  async sign(document: AutogramDocument, params: SignatureParameters,
             payloadMimeType: string,
             opts?: { onDesktopStateChange?: (s: DesktopSigningState) => void }
  ): Promise<SignedObject> { /* moved logic, see below */ }

  async useRestorePoint(restorePoint: string): Promise<SignedObject | null> { /* moved */ }
}
```

Move into `SigningFlow.sign`, verbatim where possible, the bodies of
these `CombinedClient` private methods (they are in `with-ui.ts`):
`signBasedOnUserChoice`, `getSignatureDesktop`, `getSignatureMobile`,
`getSignatureMobileOnMobile`, `getSignatureMobileUiData`,
`getSignatureMobileAvmUrl`, `getSignatureMobileSignDocument`. Replace
every `this.ui.X(...)` call with a `delegate.onState(...)` emission:

| current UI call | replacement state |
| --- | --- |
| `ui.startSigning()` | `delegate.chooseMethod()` |
| `ui.desktopSigning(abortController)` | `onState({type:"desktop", state:{type:"checkingApp"}}, ac)` |
| `ui.updateDesktopSigningState(s)` | `onState({type:"desktop", state: s}, ac)` |
| `ui.showQRCode(url, pairingUrl, ac)` | `onState({type:"mobile", state:"qr-ready", signingUrl, pairingUrl}, ac)` |
| `ui.openMobileOnMobile(url, ac)` | `onState({type:"mobile-on-mobile", state:"url-ready", signingUrl:url}, ac)` |
| `ui.hide(); ui.reset()` after success | `onState({type:"done"}, ac)` |
| `ui.maybeRestoreRestorePoint()` | `delegate.confirmRestorePoint()` |

Things that must NOT move into the flow (they stay in `CombinedClient`):

- `window.open(url, "_blank", "noopener")` for mobile-on-mobile — the
  delegate does that when it receives the `mobile-on-mobile` state
  (headless code must not touch `window`).
- The `decodeBase64` content transformation and the error-branch
  UI calls (`signingCancelled`, `showError`) in the `sign()` catch block.
- `signerIdentificationListeners`, `signatureIndex`,
  `resetSignRequestCallback`, `setResetSignRequestCallback` — deprecated
  plumbing used by the extension's `autogram-implementation.ts`
  (`getSignatureIndex`, `setResetSignRequestCallback`); keep them on
  `CombinedClient` untouched.
- `onRetryMobileNotification` wiring (`ui.onRetryMobileNotification =
  ...sendNotification`) stays in `CombinedClient`.

### 1c. Rewrite `CombinedClient` as delegate + wrapper

`CombinedClient.init(...)` keeps its exact signature and behavior
(creates `<autogram-root>`, waits for load). Internally it constructs a
`SigningFlow` and implements `SigningFlowDelegate`:

- `chooseMethod()` → `this.ui.startSigning()` (the mobile-device
  auto-selection already lives there — leave it).
- `onState(state, ac)` → a single `switch` that calls the existing
  `AutogramRoot` methods (`desktopSigning`, `updateDesktopSigningState`,
  `showQRCode`, `openMobileOnMobile` + `window.open`, `hide`/`reset` on
  `done`).
- `confirmRestorePoint()` → `this.ui.maybeRestoreRestorePoint()`.

`CombinedClient.sign(...)` keeps its signature: it calls
`flow.sign(...)`, applies `decodeBase64`, and keeps its existing
try/catch (the `AutogramError.is` branches for `user-cancelled`,
`aborted`, `app-not-installed`, generic).

### 1d. Options-object factory

Add to `with-ui.ts`:

```typescript
export interface AutogramClientOptions {
  mobileChannel?: AutogramVMobileIntegrationInterfaceStateful;
  desktopChannel?: AutogramDesktopIntegrationInterface;
  onResetSignRequest?: () => void;
  enableNotifications?: boolean;
  platform?: string;
  displayName?: string;
}
export async function createAutogramClient(options?: AutogramClientOptions): Promise<CombinedClient>
```

It simply forwards to `CombinedClient.init(...)`. Mark
`CombinedClient.init`'s positional form `@deprecated` in JSDoc (do not
remove it). Export `createAutogramClient` and `AutogramClientOptions`
from `with-ui.ts` and re-export from `index-all.ts`.

### 1e. Tests (`src/flow.test.ts`, node environment)

Use fakes: a `SigningFlowDelegate` recording states with a controllable
`chooseMethod`, a fake desktop channel (the
`AutogramDesktopIntegrationInterface` methods used: `info`,
`getLaunchURL`, `waitForStatus`, `sign`), and a fake mobile channel
(`loadOrRegister`, `addDocument`, `getQrCodeUrl`, `getPairingQrCodeUrl`,
`waitForSignature`, `reset`, `useRestorePoint`, `sendNotification`,
`init`). Cover at least:

1. desktop path: chooseMethod→reader resolves; flow emits
   desktop states in order; resolves with the fake's SignResponseBody.
2. mobile path: emits `preparing` then `qr-ready` with both URLs;
   resolves with the flattened signed object (last-signer fallback
   `"Používateľ Autogramu"` — copy the existing behavior exactly).
3. mobile-on-mobile path: emits `url-ready`; no `window` access.
4. cancellation: `chooseMethod` rejecting with
   `UserCancelledSigningException` propagates (code `user-cancelled`).
5. `useRestorePoint`: returns the restored object only when the channel
   returns one AND `confirmRestorePoint()` resolves true.

Regression guard: run the whole loop from Ground rule 5. Also check the
extension still typechecks — it consumes `CombinedClient` via
`autogram-implementation.ts`.

### 1f. Docs + release

- API.md: document `createAutogramClient` options form as the preferred
  init; note `CombinedClient.init` positional form is deprecated. Do NOT
  document `SigningFlow`/`SigningState` as public (one line: "internal,
  subject to change").
- MIGRATION.md: "0.4.0 → 0.5.0" section (deprecation only, no breakage).
- API-PROPOSAL.md: phase 5 ✅. Version `0.5.0`. Commit.

---

## Step 2 — phase 6: unified document model + entry points

### 2a. Unified types (add to `src/types.ts`)

```typescript
export interface DocumentToSign {
  content: string;
  mimeType: string;                 // WITHOUT the ";base64" suffix hack
  encoding?: "utf-8" | "base64";    // default "utf-8"
  filename?: string;
}
export interface SignedDocumentResult {   // name avoids clash with avm-api SignedDocument
  content: string;
  mimeType: string;
  encoding: "utf-8" | "base64";
  filename?: string;
  signatures: Array<{ signedBy?: string; issuedBy?: string }>;
}
```

Conversion helpers in `types.ts` (pure, unit-test them):

- `toWireDesktop(doc)` → `{ document: {content, filename}, payloadMimeType }`
  where `payloadMimeType = doc.encoding === "base64" ? doc.mimeType + ";base64" : doc.mimeType`.
- `fromDesktopResponse(resp)` → `SignedDocumentResult` with
  `signatures: [{signedBy, issuedBy}]`, `mimeType:
  "application/vnd.etsi.asic-e+zip"` unless known otherwise, `encoding: "base64"`.
- `fromAvmSignedDocument(doc)` → keeps ALL signers and the real
  mimeType/filename (this is the fidelity currently lost by flattening).

### 2b. New sign overload

On `CombinedClient` (and `SigningFlow`) add:

```typescript
sign(document: DocumentToSign, parameters?: SignatureParameters,
     options?: { signal?: AbortSignal;
                 onState?: (s: DesktopSigningState) => void }): Promise<SignedDocumentResult>;
```

Implement by detecting the argument shape (new form has `mimeType` on the
document and no third positional string). Keep the old positional
signature working unchanged and mark it `@deprecated`. Do the same for
`DesktopClient.sign` (options-bag with `signal` preferred over
`abortController`).

### 2c. Entry-point reorganization

- `autogram-sdk/package.json` `exports`: add `"./ui"` mapping to the same
  files as `"./with-ui"` (keep `"./with-ui"` working). Check
  `autogram-sdk/tsdown.config.ts` — if entries are listed explicitly, an
  alias export needs no new entry; if a new entry file is required,
  create `src/ui.ts` that re-exports `./with-ui`.
- Do NOT delete `index-all.ts` if the IIFE build (script-tag usage,
  `dist/index-all.iife.js`, used by demo2.html and documented in the
  README) depends on it — check `tsdown.config.ts` first. If it must
  stay, just make it a re-export of `index.ts` plus `CombinedClient` to
  stop the drift.

### 2d. Consumers, docs, release

- Update `README.md` and `example-extension-usage`/`demo.ts` snippets to
  the new `sign(DocumentToSign)` form.
- The extension (`autogram-implementation.ts`, `sign-request.ts`) may
  keep using the old form — migrating it is optional and can be a
  separate commit (lower risk); if migrating, `SignRequest.document` /
  `payloadMimeType` getters should produce a `DocumentToSign`.
- API.md rewrite of the signing sections around the new types;
  MIGRATION.md "0.5.0 → 0.6.0" with before/after for `sign`;
  API-PROPOSAL.md phase 6 ✅. Version `0.6.0`. Commit.

---

## Known parked items (do not silently drop)

- `CombinedClientOptions.enableNotifications` is accepted but never read
  (`with-ui.ts`). Either wire it (skip `notifyDevices` in the mobile
  path) or document it as ignored — decide during phase 5.
- Surfacing `pairedDevices()` in the dialog ("check your phone" vs QR)
  needs a new `avmService` method (`pairedDevices: {args: z.null(),
  result: ZDevices}`), an `AvmExecutor.impl` entry calling
  `this.client.pairedDevices()`, an `AvmChannelWeb` passthrough, and a
  `SigningState` extension — natural follow-up after phase 5; agreed
  with the user but not committed to a phase.
- `AvmChannelWeb.loadOrRegister()` ignores its `regInfo` parameter by
  design (the background worker supplies its own registration info via
  `getAvmIntegrationRegistrationInfo()`); the interface signature demands
  the parameter. Cleaning this up is blocked on changing
  `AutogramVMobileIntegrationInterfaceStateful`, which phase 5/6 may
  deprecate wholesale.
- The parked SDK integration test
  `avm-api/lib/apiClient.test.ts` (live network, missing dev deps
  `fake-indexeddb`/`core-js`/`cross-fetch`) — out of scope.
- `WebChannelCaller.destroy()` removes listeners correctly now, but
  nothing calls it — pre-existing, out of scope.

## Manual smoke-test checklist (run after step 0 and after phase 5)

1. `npm run build`; load the extension from `autogram-extension/dist`
   (see `autogram-extension/DEVELOPERS.md` for the exact directory and
   manifest version) into Chrome.
2. `npm run example-extension-usage`, open the served page.
3. Desktop path: `fullUsage()` in the console → choose "reader" → the
   desktop app launches (or the not-installed hint shows after ~6 s).
4. Mobile path: choose mobile → QR code renders; cancel via the close
   button → the page receives a Ditec error with code 1 (cancelled), no
   error dialog.
5. Restore point: enable it in extension options, start mobile signing,
   reload the page mid-wait, sign the document from the AVM side (or the
   simulator in `example-avm-integration`), re-trigger signing → the
   restore dialog offers the finished signature.
6. Firefox at least once before release (cloneInto path in
   `content.ts`).
