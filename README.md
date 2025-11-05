# Autogram Extension Monorepo

This is a monorepo containing the Autogram Extension and SDK for electronic signatures.

## Packages

- **autogram-sdk** - SDK for integrating Autogram signer into web applications
- **autogram-extension** - Browser extension for using Autogram with government portals

## Getting Started

### Prerequisites

- Node.js 20+ (see `.nvmrc`)
- npm (comes with Node.js)

### Installation

```bash
npm install
```

This will install dependencies for all packages and build the SDK.

### Development

#### Build all packages

```bash
npm run build
```

#### Build individual packages

```bash
npm run build:sdk
npm run build:extension
npm run build:dev  # Development build of extension
```

#### Start development server

```bash
npm start
```

#### Run tests

```bash
npm test
```

#### Lint code

```bash
npm run lint
```

#### Type checking

```bash
npm run typecheck
```

#### Clean build artifacts

```bash
npm run clean
```

## Workspace Structure

This monorepo uses npm workspaces:

- `/autogram-sdk` - SDK package
- `/autogram-extension` - Extension package (depends on SDK)

The extension automatically uses the local SDK version via workspace protocol.

## Contributing

Please see individual package READMEs for package-specific documentation:

- [autogram-sdk/README.md](./autogram-sdk/README.md)
- [autogram-extension/README.md](./autogram-extension/README.md)

## License

EUPL-1.2 - See LICENSE file for details
