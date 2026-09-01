# Autogram na webe — monorepo 🇸🇰

Tento repozitár obsahuje zdrojový kód dvoch spolu súvisiacich projektov okolo [Autogramu](https://github.com/slovensko-digital/autogram) — aplikácie na elektronické podpisovanie dokumentov:

- **[Rozšírenie "Autogram na štátnych weboch"](./autogram-extension/)** — rozšírenie do prehliadača, ktoré na vybraných štátnych weboch (napr. slovensko.sk a portál Finančnej správy) nahrádza starý podpisovač DSigner za [Autogram](https://github.com/slovensko-digital/autogram) alebo [Autogram v Mobile](https://sluzby.slovensko.digital/autogram-v-mobile/). Vďaka nemu podpíšete dokumenty na štátnych portáloch napríklad aj cez mobil.
- **[Autogram SDK](./autogram-sdk/)** — knižnica pre tvorcov webových stránok, ktorá umožňuje pridať podpisovanie Autogramom (na počítači aj v mobile) do vlastnej webovej aplikácie.

Ak si chcete iba nainštalovať rozšírenie do prehliadača, nepotrebujete nič z tohto repozitára — stačí ho pridať zo store vášho prehliadača, odkazy nájdete v [návode na inštaláciu](./autogram-extension/README.md#inštalácia).

# Autogram on the web — monorepo (en)

This repository contains the source code of two related projects built around [Autogram](https://github.com/slovensko-digital/autogram), an application for electronic document signing:

- **["Autogram on Government Websites" extension](./autogram-extension/)** — a browser extension that replaces the legacy DSigner component with [Autogram](https://github.com/slovensko-digital/autogram) or [Autogram v Mobile](https://sluzby.slovensko.digital/autogram-v-mobile/) on selected Slovak government websites (e.g. slovensko.sk and the Financial Administration portal), so you can sign documents there without installing outdated software.
- **[Autogram SDK](./autogram-sdk/)** — a library for web developers that adds Autogram signing (desktop and mobile) to their own web applications, including a ready-made dialog for choosing the signing method.

If you just want to use the extension, you don't need anything from this repository — install it from your browser's extension store, see the [installation guide](./autogram-extension/README.md#inštalácia).

--- 

## Development

This is a monorepo using npm workspaces with Turborepo task orchestration:

- [`/autogram-sdk`](./autogram-sdk/) — SDK package
- [`/autogram-extension`](./autogram-extension/) — extension package (depends on the SDK)

Turborepo resolves package task dependencies, so running extension build tasks from the root will automatically build the SDK first.

### Prerequisites

- Node.js 20+ (see `.nvmrc`)
- npm (comes with Node.js)

### Installation

```bash
npm install
```

This will install dependencies for all packages and build the SDK.

### Common tasks

```bash
npm run build              # build all packages
npm run build:sdk          # build the SDK only
npm run build:extension    # build the extension only
npm run build:dev          # development build of the extension
npm start                  # start the development server
npm test                   # run tests
npm run lint               # lint code
npm run typecheck          # type checking
npm run clean              # clean build artifacts
```

### Example apps

```bash
npm run example-extension-usage
npm run example-avm-integration
```

### Package documentation

See the individual package READMEs for package-specific documentation:

- [autogram-sdk/README.md](./autogram-sdk/README.md)
- [autogram-extension/README.md](./autogram-extension/README.md)

## License

EUPL-1.2 — see the LICENSE file in each package ([autogram-sdk](./autogram-sdk/LICENSE), [autogram-extension](./autogram-extension/LICENSE)) for details.
