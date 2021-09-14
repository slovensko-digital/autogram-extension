# Rozsirenie pre lepsi podpisovac na slovensko.sk

Issues:

https://github.com/mozilla/webextension-polyfill/

# Design

Pouzivame webextension manifest v2 lebo ne

# Hacky pre slovensko.sk

Chceme zmenit dsigner za nas podpisovac. Takze hladame miesto kde je najlepsie
vymenit volania na podpisovac za nas kod.

Zaujimave miesta su v

- `schranka.slovensko.sk/Content/jscript/DSignerMulti.js`
- `slovensko.sk/static/zep/dbridge_js/v1.0/dCommon.min.js`

Alebo ked vyhladavas klucove slova ako `ditec` a `dsigner`.
Takisto sa oplati pozriet na `//*[@id="ctl00_ctl00_ctl00_CphMasterMain_CphMain_mainContent"]/div[3]/script` tam je samotne volanie `DSigner` funkcie/classy

# TODO

How to use transpiled ts library in injected code? If we use textContent to inject we need two step build process.
If we use scripting API - it is not working yet.
