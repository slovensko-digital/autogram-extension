# Slovensko.sk rozsirenie

Zatial funguje iba na chrome (pouzivame extension manifest v3)

- Vymeni Dsigner za Slovensko.digital podpisovac

## Building

```sh
# install dependencies
npm install

# build ts->js
npm run build

# build js->webext zip
npm run webext:build
```

## Developing

```
npm start
```

and point your browser to `dist` folder

https://developer.chrome.com/docs/extensions/mv3/getstarted/

## Hacky pre slovensko.sk

Chceme zmenit dsigner za nas podpisovac. Takze hladame miesto kde je najlepsie
vymenit volania na podpisovac za nas kod.

Zaujimave miesta su v

- `schranka.slovensko.sk/Content/jscript/DSignerMulti.js`
- `slovensko.sk/static/zep/dbridge_js/v1.0/dCommon.min.js`

Alebo ked vyhladavas klucove slova ako `ditec` a `dsigner`.
Takisto sa oplati pozriet na `//*[@id="ctl00_ctl00_ctl00_CphMasterMain_CphMain_mainContent"]/div[3]/script` tam je samotne volanie `DSigner` funkcie/classy
