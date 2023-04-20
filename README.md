# Autogram rozsirenie

Zatial funguje iba na chrome (pouzivame extension manifest v3)

- Vymeni Dsigner za Slovensko.digital podpisovac

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

Look into [DEVELOPERS.md](DEVELOPERS.md)

```
npm start
```

and point your browser to `dist` folder

https://developer.chrome.com/docs/extensions/mv3/getstarted/

There are `start:manifest3` and `start:manifest2` scripts to run selected manifest version

## Hacky pre slovensko.sk

Nahradzujeme `dsigner` nasim adapterom ktory preklada volania na Autogram (Octosign)

Zaujimave miesta su v

- `slovensko.sk/static/zep/dbridge_js/v1.0/dCommon.min.js`

Alebo ked vyhladavas klucove slova ako `ditec` a `dsigner`.
Takisto sa oplati pozriet na `//*[@id="ctl00_ctl00_ctl00_CphMasterMain_CphMain_mainContent"]/div[3]/script` tam je samotne volanie `DSigner` funkcie/classy
