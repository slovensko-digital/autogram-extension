# Autogram SDK - use Autogram signer from web

Autogram SDK is a TS/JS library that allows you to use the Autogram signer family (Autogram, Autogram V Mobile) from web. Not only does it provide an API to sign documents, but it also adds a UI for a consistent process of choosing the signer process (desktop/mobile).

UI is implemented using lit-element and lit-html, so it's lightweight and easy to customize and thanks to shadow DOM, it's encapsulated and it won't interfere with your styles.

## Installation

```bash
npm install autogram-sdk
```

Some dependencies (`zod`, `js-base64`, `idb-keyval`, …) are declared as peer dependencies; npm 7+ installs them automatically. The self-contained builds in [Distribution formats](#distribution-formats) have everything inlined and need no install at all.

## Entry points

The package exposes four entry points. Pick the highest-level one that fits — most applications only need `autogram-sdk/with-ui`.

| Import                     | What it contains                                                                                                                                                                       | Where it can run                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `autogram-sdk/with-ui`     | `CombinedClient` / `createAutogramClient` — the full signing flow with the built-in dialog UI for choosing between desktop and mobile signing. `autogram-sdk/ui` is an alias.            | Browser page only — importing it registers custom elements as a side effect.                            |
| `autogram-sdk`             | The headless core: `DesktopClient`, `MobileClient`, error classes (`AutogramError`, …), shared types, and the RPC helpers (`defineRpcService`, …) used to bridge contexts.               | Anywhere — pages, service workers, extension background scripts. No UI, no side effects.                |
| `autogram-sdk/autogram-api` | Low-level HTTP client (`apiClient`) for the Autogram desktop app's local server.                                                                                                        | Anywhere.                                                                                                |
| `autogram-sdk/avm-api`     | Low-level client for the Autogram v mobile (AVM) server API, including device pairing (`AutogramVMobileIntegration`) and the QR-pairing simulation helper (`AutogramVMobileSimulation`). | Anywhere.                                                                                                |

The layering: `with-ui` builds on `DesktopClient`/`MobileClient` from the core, which in turn build on `autogram-api`/`avm-api`. Drop down a level when you need your own UI (see the `DesktopClient` demo) or your own transport (see [channels](#advanced-usage--channels)).

## Distribution formats

Every entry point is built in three flavors:

| Files                                | Format                              | Dependencies                       | Intended consumer                                                                     |
| ------------------------------------ | ----------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------- |
| `dist/*.mjs`, `dist/*.js` + `.d.ts`  | ESM + CJS (the npm `exports` map)   | External (`dependencies` / `peerDependencies`) | Projects with a bundler (Vite, webpack, …) — gives tree-shaking and dependency deduping. |
| `dist/bundled/*.mjs`                 | ESM, self-contained                 | Inlined                            | `<script type="module">` straight from a static server or CDN, no bundler needed.       |
| `dist/*.iife.js`                     | IIFE, self-contained (`AutogramSDK` global) | Inlined                            | Classic `<script>` tag; `index-all.iife.js` is the usual choice (core + UI).            |

## Usage (module import)

```typescript
import { createAutogramClient } from "autogram-sdk/with-ui";

const client = await createAutogramClient();

const { content, mimeType, signatures } = await client.sign(
  {
    content: "hello world",
    mimeType: "text/plain",
    filename: "hello.txt",
  },
  {
    level: "XAdES_BASELINE_B",
    container: "ASiC_E",
  }
);
// content is Base64; signatures is [{ signedBy, issuedBy }, ...]
```

## Usage without a bundler

Serve the file yourself or point at a CDN that mirrors npm (e.g. `https://cdn.jsdelivr.net/npm/autogram-sdk/dist/…`).

### Script tag (IIFE, `AutogramSDK` global)

```html
<script src="dist/index-all.iife.js"></script>
<script type="module">
  // type="module" only for top-level await; the AutogramSDK global works
  // from any script, see demos/iife-combined.html for a classic-script setup
  const client = await AutogramSDK.createAutogramClient();

  const { content, mimeType, signatures } = await client.sign(
    {
      content: "hello world",
      mimeType: "text/plain",
      filename: "hello.txt",
    },
    {
      level: "XAdES_BASELINE_B",
      container: "ASiC_E",
    }
  );
</script>
```

### ES module (self-contained)

Same API as the npm build, but with dependencies inlined so the browser can load it directly:

```html
<script type="module">
  import { createAutogramClient } from "./dist/bundled/index-all.mjs";

  const client = await createAutogramClient();
  // …same sign() call as above
</script>
```

## Error handling

All SDK errors carry a machine-readable code. Classify them with
`AutogramError.is()` (works even for errors that crossed a `postMessage`
boundary, where `instanceof` fails):

```typescript
import { AutogramError } from "autogram-sdk";

try {
  await client.sign(...);
} catch (e) {
  if (AutogramError.is(e, "user-cancelled")) {
    // user closed the dialog — not a failure
  } else if (AutogramError.is(e, "app-not-installed")) {
    // point the user to autogram.slovensko.digital
  } else {
    throw e;
  }
}
```

See [docs/API.md](./docs/API.md) for the full API reference,
[docs/MIGRATION.md](./docs/MIGRATION.md) for upgrade notes, and
[docs/API-PROPOSAL.md](./docs/API-PROPOSAL.md) for the redesign roadmap.

## Advanced usage — channels

For most web applications the basic usage above is all you need — `CombinedClient.init()` called without arguments works out of the box.

Channels become relevant when the SDK runs in an environment where it cannot make direct network requests from the page. A **channel** is simply an object that implements the communication contract with a signing back-end (desktop app or AVM cloud service). `CombinedClient` delegates all actual network calls to its two channels, keeping UI and transport completely separate.

This separation makes it possible to move the network calls into a different execution context — for example a service worker or a browser-extension background script — and forward them over a message bridge instead. [Autogram Extension](https://github.com/slovensko-digital/autogram-extension) uses this: instead of the default channels it passes its own implementations that proxy every call through the content-script ↔ injected-script message bridge.

```typescript
// Simple case — use defaults, no channels needed, communicate directly
const client = await createAutogramClient();

// Advanced case — inject custom channel implementations
const client = await createAutogramClient({
  mobileChannel: new MyAvmChannel(),      // implements AutogramVMobileIntegrationInterfaceStateful
  desktopChannel: new MyDesktopChannel(), // implements AutogramDesktopIntegrationInterface
});
```

## Development

### Build

```bash
npm run build:release
# or
npm run build:watch
```

using `npm run build:watch` is usefult when developing using `npm link`

### Generate types

```bash
npm run generate-autogram-api-types
npm run generate-avm-api-types
```

Autogram Desktop types are generated from local app running on default port. AVM types are generated from server.

### Generate docs

```bash
npm run generate-docs
```

### Using with npm link

1. Run `npm run build:watch` in the autogram-sdk directory
2. Run `npm link` in the autogram-sdk directory
3. Run `npm link autogram-sdk` in the project where you want to use autogram-sdk

Sometimes the link breaks and you need to do whole process again.

### Demo

```bash
npm run demo
```

Build the lib first (`npm run build`), then `npm run demo` starts a static server on port 8080 and opens http://localhost:8080/demos/ with one demo page per build flavor:

| Demo                 | Build flavor                                                     | How it loads the SDK                                              |
| -------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| `esm-bundled.html`   | `dist/bundled/*.mjs` — ESM, dependencies inlined                 | `<script type="module">`, works from any static server            |
| `esm-external.html`  | `dist/*.mjs` — ESM, dependencies external (the npm package build) | `<script type="module">` + import map resolving bare imports to esm.sh (needs network) |
| `iife-combined.html` | `dist/index-all.iife.js` — IIFE, dependencies inlined            | Classic `<script>` tag, `AutogramSDK` global; signs a PDF via `CombinedClient` |
| `iife-desktop.html`  | `dist/index-all.iife.js` — IIFE, dependencies inlined            | Classic `<script>` tag; headless `DesktopClient` with custom progress UI |
