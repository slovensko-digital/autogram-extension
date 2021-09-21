# Slovensko.sk rozsirenie

Zatial funguje iba na chrome (pouzivame extension manifest v3)

- Vymeni Dsigner za Slovensko.digital podpisovac
  





# Rozsirenie pre lepsi podpisovac na slovensko.sk

Issues:

https://github.com/mozilla/webextension-polyfill/

# Hacky pre slovensko.sk

Chceme zmenit dsigner za nas podpisovac. Takze hladame miesto kde je najlepsie
vymenit volania na podpisovac za nas kod.

Zaujimave miesta su v

- `schranka.slovensko.sk/Content/jscript/DSignerMulti.js`
- `slovensko.sk/static/zep/dbridge_js/v1.0/dCommon.min.js`

Alebo ked vyhladavas klucove slova ako `ditec` a `dsigner`.
Takisto sa oplati pozriet na `//*[@id="ctl00_ctl00_ctl00_CphMasterMain_CphMain_mainContent"]/div[3]/script` tam je samotne volanie `DSigner` funkcie/classy