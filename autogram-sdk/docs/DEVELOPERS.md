# Autogram SDK - Developer Documentation
WIP - AI generated overview, not yet reviewed.

## Overview

Autogram SDK is a TypeScript/JavaScript library that provides a unified interface for electronic document signing using the Autogram family of signers (Autogram Desktop and Autogram V Mobile). The SDK bridges web applications with native signing applications and provides a consistent UI for choosing between signing methods.

## Project Purpose

The SDK enables web applications to:
- Sign documents using **Autogram Desktop** (card reader-based signing on desktop)
- Sign documents using **Autogram V Mobile** (mobile app-based signing)
- Provide a unified UI for users to choose their preferred signing method
- Support both simple integration and advanced scenarios (like browser extensions)

## Architecture

### High-Level Structure

The project is organized into several key modules:

```
src/
├── index.ts              # Core exports (without UI)
├── with-ui.ts            # CombinedClient with UI integration
├── index-all.ts          # All exports including UI
├── autogram-api/         # Autogram Desktop integration
├── avm-api/              # Autogram V Mobile integration
├── injected-ui/          # UI components (Lit-based)
├── channel-desktop.ts    # Desktop channel implementation
├── channel-avm.ts        # Mobile channel implementation
├── errors.ts             # Custom exceptions
├── utils.ts              # Helper utilities
└── log.ts                # Logging infrastructure
```

### Core Concepts

#### 1. Channel Architecture

The SDK uses a **channel pattern** to allow flexible integration:

- **Channels** provide an abstraction layer between the signing logic and the actual API clients
- This design enables the SDK to work in different contexts (e.g., web page vs. browser extension with service workers)
- Two channel implementations:
  - `AutogramDesktopSimpleChannel` - for desktop signing
  - `AvmSimpleChannel` - for mobile signing

#### 2. Integration Interfaces

**Desktop Integration** (`AutogramDesktopIntegrationInterface`):
- HTTP-based communication with local Autogram Desktop app (localhost:37200)
- Custom protocol handler (`autogram://`) for launching the app
- Polling-based status checking
- Direct signing flow

**Mobile Integration** (`AutogramVMobileIntegrationInterfaceStateful`):
- Server-based communication (autogram.slovensko.digital)
- Stateful integration with document tracking
- QR code generation for mobile app pairing
- End-to-end encryption using WebCrypto API
- Long-polling for signature completion
- Restore point support for session recovery

#### 3. UI Components (Lit Elements)

Built with Lit (web components), the UI provides:
- **AutogramRoot** - Main container component with shadow DOM isolation
- **Choice Screen** - User selection between desktop/mobile signing
- **Sign Reader Screen** - Desktop signing flow
- **Sign Mobile Screen** - Mobile signing with QR code
- **Sign Mobile on Mobile Screen** - Special flow when SDK is used on mobile devices
- **Signing Cancelled Screen** - Error/cancellation state

### Module Details

#### autogram-api/
Handles integration with Autogram Desktop:
- `apiClient.ts` - API client factory with methods for `info()`, `waitForStatus()`, `sign()`
- `autogram-api.generated.ts` - Auto-generated TypeScript types from OpenAPI spec
- `crypto/random.ts` - Cryptographic utilities for security tokens
- Supports custom protocol URLs for launching the desktop app
- Safari-specific workarounds (HTTPS requirement)

#### avm-api/
Handles integration with Autogram V Mobile server:
- `apiClient.ts` - Main integration client with encryption/decryption
- `apiClient-mobile.ts` - Mobile app simulation utilities (testing)
- `avm-api.generated.ts` - Auto-generated types from OpenAPI spec
- `avm-api.codemod.ts` - Code transformation for generated types
- Key features:
  - RSA key pair generation and storage (IndexedDB via idb-keyval)
  - JWT-based integration authentication
  - AES-GCM document encryption
  - QR code URL generation
  - Document status polling

#### injected-ui/
Web Components for user interaction:
- Built with Lit Element for lightweight, encapsulated components
- Shadow DOM prevents style conflicts
- Event-based communication (`autogram-close`, `autogram-sign`, etc.)
- Responsive design with mobile detection
- SVG icons embedded
- Screens follow base class pattern for consistent styling

#### CombinedClient (with-ui.ts)
The main high-level API:
```typescript
const client = await CombinedClient.init();
const signedDoc = await client.sign(document, parameters, mimeType);
```

Features:
- Automatic UI injection and lifecycle management
- Coordinating between desktop and mobile channels
- User choice handling
- Error handling (UserCancelledSigningException)
- Support for custom reset callbacks

### Data Flow

#### Desktop Signing Flow
1. User clicks "Sign with reader"
2. SDK generates launch URL with security token
3. Opens Autogram Desktop via custom protocol
4. Polls server for "READY" status
5. Sends document to local server for signing
6. Returns signed document

#### Mobile Signing Flow
1. User clicks "Sign with mobile"
2. SDK generates RSA key pair (if not exists)
3. Registers integration with server
4. Encrypts document with AES-GCM
5. Uploads encrypted document to server
6. Generates QR code URL with document GUID + encryption key
7. User scans QR code with Autogram V Mobile app
8. Long-polls server for signature completion
9. Downloads and decrypts signed document

### Build System

- **tsup** - Modern TypeScript bundler
- **Output formats**: CommonJS, ESM, IIFE (for browser `<script>` tags)
- **Multiple entry points**:
  - `index.ts` - Core without UI
  - `with-ui.ts` - Full integration with UI
  - `autogram-api/index.ts` - Desktop-only
  - `avm-api/index.ts` - Mobile-only
  - `demo.ts` - Demo application

### Type Generation

The SDK uses OpenAPI specs to generate TypeScript types:

```bash
# Desktop API types (from local Autogram Desktop)
npm run generate-autogram-api-types

# Mobile API types (from production server)
npm run generate-avm-api-types
```

Mobile types undergo post-processing via JSCodeshift transformation (`avm-api.codemod.ts`).

### Key Dependencies

**Runtime:**
- `lit` - Web components framework
- `jose` - JWT operations
- `@bwip-js/generic` - Barcode/QR code generation
- `cross-fetch` - Universal fetch API
- `idb-keyval` - IndexedDB key-value store
- `zod` - Runtime type validation
- `loglevel` - Logging

**Cryptography:**
- `@peculiar/webcrypto` - WebCrypto polyfill
- `crypto-browserify` - Crypto polyfill for browsers

**Build/Dev:**
- `typescript` - TypeScript compiler
- `tsup` - Bundler
- `typedoc` - Documentation generator

### Security Considerations

1. **Desktop Security**: 
   - Random security tokens for each session
   - Origin validation
   - HTTPS for Safari compatibility

2. **Mobile Security**:
   - End-to-end encryption using RSA + AES-GCM
   - Document encryption keys never leave the browser
   - JWT-based integration authentication
   - Per-document encryption keys

3. **UI Security**:
   - Shadow DOM encapsulation
   - No external dependencies in UI components

### Error Handling

- `UserCancelledSigningException` - User cancelled the signing process
- Custom error types for different failure modes
- Abort controller support for cancelling operations
- Timeout handling for long-running operations

### Browser Compatibility

- Modern browsers with ES6+ support
- Safari requires special handling (HTTPS, different hostname)
- Mobile device detection for adaptive UI
- Touch and non-touch device support

### Testing

- Demo files (`demo1.html`, `demo2.html`) for manual testing
- Test infrastructure in place (Jest configuration)
- Unit tests for API clients (`.test.ts`, `.spec.ts_` files)

### Documentation

- **TypeDoc** generates API documentation
- Output in `docs/html/`
- UML diagrams via typedoc-umlclass plugin
- Markdown documentation mode available

### Development Workflow

1. **Local Development**:
   ```bash
   npm run build:watch    # Watch mode for development
   npm link               # Link for testing in other projects
   ```

2. **Type Generation**:
   - Requires Autogram Desktop running locally (port 37200)
   - Fetches latest OpenAPI specs and regenerates types

3. **Testing**:
   ```bash
   npm run demo           # Serve demo at localhost:8080
   ```

4. **Documentation**:
   ```bash
   npm run generate-docs  # Generate TypeDoc documentation
   npm run serve-docs     # Serve docs at localhost:8080
   ```

### Export Strategy

The SDK provides multiple export paths for different use cases:

- **Default (`./`)**: Core functionality without UI (for custom integrations)
- **`./with-ui`**: Full SDK with integrated UI components
- **`./autogram-api`**: Desktop-only integration
- **`./avm-api`**: Mobile-only integration

This allows consumers to:
- Use only what they need (tree-shaking)
- Implement custom UI while using core APIs
- Separate UI context from worker context (browser extensions)

### Extension Use Case

The architecture specifically supports browser extensions:
- UI runs in content script context
- Signing logic can run in service worker context
- Channel pattern bridges the two contexts
- Custom elements can be registered safely in content script

### Mobile-on-Mobile Support

Special flow when SDK is used on a mobile device:
- Detects mobile environment
- Shows different UI (deep link instead of QR code)
- Opens Autogram V Mobile directly
- Handles return to browser

### Current Branch: mobile-on-mobile

The repository is currently on the `mobile-on-mobile` branch, which appears to be implementing or refining the mobile-on-mobile signing flow mentioned above.

## Key Files Reference

- **`src/with-ui.ts`** - Main CombinedClient implementation
- **`src/channel-*.ts`** - Channel implementations
- **`src/autogram-api/lib/apiClient.ts`** - Desktop API client
- **`src/avm-api/lib/apiClient.ts`** - Mobile integration client
- **`src/injected-ui/main.ts`** - Root UI component
- **`tsup.config.ts`** - Build configuration
- **`package.json`** - Dependencies and scripts

## Getting Started for Developers

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run demo: `npm run demo`
5. For development: `npm run build:watch`

For integration testing, you'll need:
- Autogram Desktop installed and running (for desktop signing)
- Autogram V Mobile app installed on a phone (for mobile signing)
