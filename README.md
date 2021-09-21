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


# Terajsi stav:

Ak mam mime `application/vnd.etsi.asic-e+zip` tak dostanem
> Pri prevode dát na TFormu sa vyskytla chyba: 2104042, Nepodporované dáta.


Ak mam mime `application/xml` tak dostanem
> Pri prevode dát na TFormu sa vyskytla chyba: 2104212, Nepodporovaný formát podpisu



Okrem toho by to malo fungovat pre vseobecne podanie jedneho dokumentu