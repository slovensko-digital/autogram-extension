# Autogram SDK - use Autogram signer from web

Autogram SDK is a TS/JS library that allows you to use the Autogram signer family (Autogram, Autogram V Mobile) from web. Not only does it provide an API to sign documents, but it also adds a UI for a consistent process of choosing the signer process (desktop/mobile).

UI is implemented using lit-element and lit-html, so it's lightweight and easy to customize and thanks to shadow DOM, it's encapsulated and it won't interfere with your styles.

## Installation

```bash
npm install autogram-sdk
```

## Usage (module import)

```typescript
import { CombinedClient } from ".";

const client = await CombinedClient.init();

const { content, issuedBy, signedBy } = await client.sign(
  {
    content: "hello world",
    filename: "hello.txt",
  },
  {
    level: "XAdES_BASELINE_B",
    container: "ASiC_E",
  },
  "text/plain",
  true
);
```

## Usage on web (script tag)

```html
<script src="dist/index.global.js"></script>
<script>
  const client = await AutogramSDK.CombinedClient.init();

  const { content, issuedBy, signedBy } = await client.sign(
    {
      content: "hello world",
      filename: "hello.txt",
    },
    {
      level: "XAdES_BASELINE_B",
      container: "ASiC_E",
    },
    "text/plain",
    true
  );
</script>
```

## Advanced usage — channels

For most web applications the basic usage above is all you need — `CombinedClient.init()` called without arguments works out of the box.

Channels become relevant when the SDK runs in an environment where it cannot make direct network requests from the page. A **channel** is simply an object that implements the communication contract with a signing back-end (desktop app or AVM cloud service). `CombinedClient` delegates all actual network calls to its two channels, keeping UI and transport completely separate.

This separation makes it possible to move the network calls into a different execution context — for example a service worker or a browser-extension background script — and forward them over a message bridge instead. [Autogram Extension](https://github.com/slovensko-digital/autogram-extension) uses this: instead of the default channels it passes its own implementations that proxy every call through the content-script ↔ injected-script message bridge.

```typescript
// Simple case — use defaults, no channels needed, communicate directly
const client = await CombinedClient.init();

// Advanced case — inject custom channel implementations
const client = await CombinedClient.init(
  new MyAvmChannel(),      // implements AutogramVMobileIntegrationInterfaceStateful
  new MyDesktopChannel(),  // implements AutogramDesktopIntegrationInterface
);
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

This will start a demo server on port 8080. You can access it at http://localhost:8080. Demo has 2 html documents demo1.html and demo2.html. `demo1.html` is file input where you can try any file, lib is used as typescript import in demo.ts. `demo2.html` automatically starts signing process with example file, lib is used as javascript global (script tag). Build the lib before running the demo.
