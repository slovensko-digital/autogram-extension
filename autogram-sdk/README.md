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

## Advanced usage

Because Autogram SDK is used in [Autogram Extension](https://github.com/slovensko-digital/autogram-extension) and in extension we UI is implemented in content context and signing process is in worker context, because of security reasons, the library is designed to support this case.

That's why SDK has "channel" concept. `CombinedClient` is combining UI and singing process for both desktop and mobile. `Channel

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
