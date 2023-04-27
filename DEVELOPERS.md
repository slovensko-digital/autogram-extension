#  How to develop

We are using auto-it for releases so use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) commit message convention.

## Install dependencies

```sh
# install dependencies
npm install
```

## Building

```sh
npm run build
```

Environment variable `AE_MANIFEST_VERSION` expects value `2` or `3`
and changes output manifest.json file version.

## Release

```sh
npm run release
```

## Developing

```
npm start
```

and point your browser to `dist` folder

https://developer.chrome.com/docs/extensions/mv3/getstarted/

There are `start:manifest3` and `start:manifest2` scripts to run selected manifest version

## Hacky pre slovensko.sk

Nahradzujeme `dsigner` nasim adapterom ktory preklada volania na [Autogram](https://github.com/slovensko-digital/autogram)

## Entry points

| entrypoint    | description                                                  |
| ------------- | ------------------------------------------------------------ |
| inject.ts     | inject into running page using content script and `<script>` |
| content.ts    | content script                                               |
| background.ts | background script                                            |

## Communication

There are multiple environments in which extension runs

- page context (inject.ts)
- extension content script (content.ts)
- extension background script (background.ts)

Communication between page context and content script is implemented using `CustomEvent`.
Communication between content script and background script is using messaging and `storage.local` .

## Options/Settings

Options are saved into `browser.storage.local`

## CSS

CSS is implemented using CSS modules inserted directly into page.

## D.Signer / D.Bridge JS rozhranie

- https://www.ditec.sk/static/zep/dokumentacia/20210906_Dokumentacia_pre_integratorov_D.Signer-XAdES_Java_v2.0.zip
- https://www.ditec.sk/static/zep/dbridge_js/v1.0/Integracna_prirucka_D.Bridge_JS,_v1.0.zip
- https://www.ditec.sk/produkty/informacie_pre_integratorov_aplikacii_pre_kep

## Communication with Autogram

We are using @octosign/client as base, but it was missing some types so we don't use theirs.

(Because it was out-of-date on npm, you have to `git clone https://github.com/octosign/white-label-client` next to this repo and build it `npm install && npm run build`)

## Browser support

Right now we are using `webextension-polyfill`, so extension should run in all browsers.
Because we want to support Firefox we need to use manifest version 2. If situation
arises we can create builds for every browser individually, but right now I don't see
reason to do that.

### Safari

Safari needs xcode project and associated app. We generate such app using 

```
npm run xcode-generate-safari-web-extension
```

Run project, it opens app, has button to open Safari settings where you can enable the extension.
After you open supported page (slovensko.sk) extension icon shows next to url bar, if you click on Safari asks you for permission.

https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari

https://developer.apple.com/documentation/safariservices/safari_web_extensions/running_your_safari_web_extension

https://developer.apple.com/documentation/safariservices/safari_web_extensions/assessing_your_safari_web_extension_s_browser_compatibility

## Otazky a odpovede

### Ako funguje extension

- Nahradzame globalny `ditec` objekt (javascript)
- Weby FS/UPVS volaju metody na `ditec` objekte, ktore my mockujeme
- Po zavolani metody rozsirenie zabezpeci aby autogram mal podobne spravanie ako by mal dsigner

### Ako funguje dsigner/dbridge

```
Web (UPVS/FS) -(js call)-> dbridge -(websocket)-> dsigner
```

ked pouzijeme rozsirenie tak

```
Web (UPVS/FS) -(js call)-> fake dbridge / rozsirenie -(http)-> autogram
```

API dbridge_js funguje nasledovne:

- `deploy` - pripravi kniznicu na platformu na ktorej je spustena (zmaze tie casti ktore na danej platforme nemozu bezat)
- `launch` - spusti server
- `addXY` - prida objekt (file) do serveru
- `sign` - vyvola podpisovanie - podpisany dokument nie je rovno odosielany do browseru
- `getABC` - vypyta si od serveru data ktore potrebuje - tu sa urcuje typ vystupu

## Štruktúra codebase

- `src` samotná aplikácia
  - `dbridge_js` - "hlavná časť"
    - `inject-ditec.ts` - samotne vkladanie objektu
    - `proxy.ts` - debugovacie interceptovanie/nahravanie pri pouzivani (WIP) (napr. na vyrabanie testov)
    - `ditecx` -
      - `ditecx.ts` - samotny objekt ktory nahradza `window.ditec`
      - `filetype-strategy` - rozne typy suborov maju rozne data ktore treba premapovat na format pre Autogram
      - `dsig-*-adapter.ts` - adaptery simulujuce spravania ditec implementacii
      - ...
  - `entrypoint` - vstupné skripty pre rôzne kontexty v ktorých beží extension
    - `content.ts` - časť spúšťajúca sa nad stránkou, vkladá `inject.ts`
    - `inject.ts` - časť spúšťaná vnútri stránky, injectuje samotnú funkcionalitu
    - `popup.ts` - správanie popup-u
    - ...
  - `img` - zdrojové obrázky na distribuciu (do store-u)
  - `options` - funkcionalita nastaveni ktora je zdielana medzi roznymi entrypointami
  - `static` - staticke subory vkladane do buildu (obrazky, podstranky)
