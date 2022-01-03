function getAliasValue(n, t) {
  var r, i;
  if (
    ((t = t.toLowerCase()),
    (dataB = "¶" + n),
    (aliasB = "¶" + t + "¶"),
    n && ((r = dataB.toLowerCase().indexOf(aliasB)), r >= 0))
  )
    for (
      i = n.split("¶"), ii = Math.floor(i.length / 2) * 2 - 2;
      ii >= 0;
      ii -= 2
    )
      if (i[ii].toLowerCase() == t) return i[ii + 1];
  return undefined;
}
function getServerTime() {
  (main.ServerTime = new Date(Date($("#serverTime").val()))),
    (main.ClientTime = new Date());
}
function ActualizeServerTime() {
  var n,
    t = new Date();
  (n = new Date(
    t.getTime() - main.ClientTime.getTime() + main.ServerTime.getTime()
  )),
    $("#time").html(
      n.getDate() +
        "." +
        (n.getMonth() + 1) +
        "." +
        n.getFullYear() +
        " " +
        n.getHours() +
        ":" +
        n.getMinutes() +
        ":" +
        n.getSeconds()
    );
}
function getUserNameFromSignature(n) {
  var t = n.indexOf("X509SubjectName>"),
    r,
    i;
  return t == -1
    ? ((t = n.indexOf("CN=")),
      (i = n.indexOf(",", t + 1)),
      i == -1 && ((i = n.indexOf("<", t + 1)), i == -1))
      ? n.substring(t + 3)
      : n.substring(t + 3, i)
    : ((r = n.substring(t, n.indexOf("X509SubjectName>", t + 1))),
      (t = r.indexOf("CN=")),
      (i = r.indexOf(",", t + 1)),
      i == -1 && (i = r.indexOf("<", t + 1)),
      r.substring(t + 3, i));
}
function LoadFormularTyp() {
  main.frame.Type();
}
function GoToStep(n) {
  switch (n) {
    case 0:
      $("#formular").hasClass("notactive") &&
        $("#formular").children().first().click();
      break;
    case 1:
      $("#frameContent").hide(),
        $("#zoznamPrilohContent").show(),
        $(".prilohyPodania").show(),
        $(".existingfiles").hide(),
        $(".newfiles").hide(),
        $(".mainButtons").show();
      break;
    case 2:
      $("#frameContent").hide(),
        $("#zoznamPrilohContent").show(),
        $(".existingfiles").show(),
        $(".newfiles").hide(),
        $(".mainButtons").hide();
      break;
    case 3:
      $("#frameContent").hide(),
        $("#zoznamPrilohContent").show(),
        $(".existingfiles").hide(),
        $(".newfiles").show(),
        $(".mainButtons").hide();
      break;
    default:
      $("#frameContent").show(),
        $("#zoznamPrilohContent").hide(),
        $(".prilohyPodania").hide(),
        $(".existingfiles").hide(),
        $(".newfiles").hide();
  }
}
function PodanieNavigationViewModel(data) {
  (this.PrilohaList = ko.observableArray(data.Prilohy)),
    (this.PodpisList = ko.observableArray(data.PodpisyJson)),
    (data.PodtypFormulara === undefined || data.PodtypFormulara === null) &&
      data.TypObjektuFormular !== null &&
      data.TypObjektuFormular !== undefined &&
      (data.PodtypFormulara = data.TypObjektuFormular[0].PodtypFormulara),
    (this.PodtypFormulara = ko.observable(data.PodtypFormulara)),
    (this.IDElektronickyDokument = ko.observable(data.IDElektronickyDokument)),
    (this.StavElektronickehoDokumentu = ko.observable(
      data.StavElektronickehoDokumentu
    )),
    (this.Stav = eval(data.StavEnum)),
    (this.TypObjektuFormular = ko.observableArray(data.TypObjektuFormular)),
    (this.Nazov = data.NazovElektronickehoFormulara),
    (this.Format = ko.observable("")),
    (this.Opravneniepodavat = data.OpravneniePodavat),
    (this.OpravneniePodpisovat = data.OpravneniePodpisovatEZ),
    (this.Register = data.Register),
    (this.Jazyk = data.Jazyk),
    (this.canDelete = ko.computed(function () {
      var n = this;
      return n.IDElektronickyDokument() &&
        (n.StavElektronickehoDokumentu() == "C" ||
          n.StavElektronickehoDokumentu() == "R")
        ? !0
        : !1;
    }, this)),
    (this.ZoznamPriloh = ko.observableArray([])),
    (this.SelectedTypObj = ko.computed(function () {
      var n = this;
      return ko.utils.arrayFilter(
        this.TypObjektuFormular(),
        function (t) {
          return t.PodtypFormulara == n.PodtypFormulara();
        },
        n
      );
    }, this)),
    (this.DisableSave = ko.computed(function () {
      var n = this,
        t = !1;
      return main &&
        main.podanie &&
        main.podanie.JsonData &&
        main.podanie.JsonData.JeFiktivnySubjekt
        ? !0
        : (n.TypObjektuFormular() &&
            $.each(n.TypObjektuFormular(), function () {
              if (
                this.TypPodaniaAgenda.endsWith("_ZAS") ||
                this.TypPodaniaAgenda.endsWith("_AUT")
              )
                return (t = !0), !1;
            }),
          t);
    }, this)),
    (this.HasGoodPodTyp = ko.computed(function () {
      return this.SelectedTypObj()[0] !== undefined;
    }, this)),
    (this.TypyPriloh = ko.computed(function () {
      var n = this;
      return n.SelectedTypObj()[0] === null ||
        n.SelectedTypObj()[0] === undefined
        ? null
        : n.SelectedTypObj()[0].Prilohy;
    }, this)),
    (this.TypyPrilohFiltrovane = ko.computed(function () {
      var n = this,
        r,
        u,
        f,
        t,
        i;
      if (n.Format() && n.Format() != "" && n.TypyPriloh())
        return (
          (r = $.grep(n.TypyPriloh(), function (t) {
            return (
              t.FormatTypuObjektu.toLowerCase() == n.Format().toLowerCase()
            );
          })),
          r.length == 0 ? n.TypyPriloh() : r
        );
      if (n.TypyPriloh()) {
        for (u = [], f = [], t = 0; t < n.TypyPriloh().length; t++)
          (i = n.TypyPriloh()[t]),
            $.inArray(i.TypDokumentuID, f) < 0 &&
              (f.push(i.TypDokumentuID), u.push(i));
        return u;
      }
      return n.TypyPriloh();
    }, this)),
    (this.ExistujeFiltrovanyTypPrilohy = ko.computed(function () {
      var n = this,
        t;
      return n.Format() && n.Format() != "" && n.TypyPriloh()
        ? ((t = $.grep(n.TypyPriloh(), function (t) {
            return (
              t.FormatTypuObjektu.toLowerCase() == n.Format().toLowerCase()
            );
          })),
          t.length == 0 ? !1 : !0)
        : !0;
    }, this)),
    (this.ZoznamVsetkychDokumentov = ko.computed(function () {
      var n = this,
        i = [],
        t,
        r,
        u;
      if (
        n.SelectedTypObj() &&
        n.SelectedTypObj()[0] &&
        n.SelectedTypObj()[0].TypyDokumentovID
      )
        for (t = 0; t < n.SelectedTypObj()[0].TypyDokumentovID.length; t++)
          (r = n.SelectedTypObj()[0].TypyDokumentovID[t]),
            $.each(n.TypyPriloh(), function () {
              if (this.TypDokumentuID == r) return (u = this), !1;
            }),
            i.push(u);
      return i;
    }, this)),
    (this.pocetZostavajucichDokumentov = function (n) {
      var t = this.pocetPriradenychPriloh(n.TypDokumentuID);
      return t == 0 ? n.PovinnyTypDokumentu : n.PocetnostVsetkychObjVDokOd - t;
    }),
    (this.ZoznamPovinnychPriloh = ko.computed(function () {
      var n = this,
        t;
      return (
        n.TypyPriloh() &&
          (t = $.grep(n.TypyPriloh(), function (n) {
            return n.PocetnostOd > 0;
          })),
        t
      );
    }, this)),
    (this.pocetZostavajucichpriloh = function (n) {
      return (
        n.PocetnostOd -
        this.pocetPriradenychPriloh(n.TypDokumentuID, n.TypObjektuID)
      );
    }),
    (this.pocetPriradenychPriloh = function (n, t) {
      var i = this;
      if (i.TypyPriloh())
        return $.grep(i.PrilohaList(), function (i) {
          return (
            (n == undefined || i.TypDokumentuID == n) &&
            (t == undefined || i.TypObjektuID == t)
          );
        }).length;
      0;
    }),
    (this.pocetPriradenychPrilohVDok = function (n) {
      var t = this;
      if (t.TypyPriloh())
        return $.grep(t.PrilohaList(), function (t) {
          return n == undefined || t.TypDokumentuID == n;
        }).length;
      0;
    }),
    (this.ZoznamPovolenychFormatov = ko.computed(function () {
      var n = ko.utils.arrayMap(this.TypyPriloh(), function (n) {
          return n.FormatTypuObjektu;
        }),
        t = ko.utils.arrayGetDistinctValues(n).sort();
      return t.join(", ");
    }, this)),
    (this.filterZoznam = ko.computed(function () {
      var n = this,
        r = [],
        t,
        i,
        u;
      if (n.TypyPriloh())
        for (t = 0; t < n.TypyPriloh().length; t++)
          (i = n.TypyPriloh()[t]),
            (u = $.grep(n.ZoznamPriloh(), function (n) {
              return (
                n.TypDokumentuID == i.TypDokumentuID &&
                n.TypObjektuID == i.TypObjektuID
              );
            })),
            ko.utils.arrayPushAll(r, u);
      return ko.utils.arrayGetDistinctValues(r).sort();
    }, this)),
    (this.existujeChybajucaPovinnaPriloha = ko.computed(function () {
      var n = this,
        t = 0,
        i = 0;
      return (
        n.ZoznamPovinnychPriloh() &&
          ko.utils.arrayFirst(n.ZoznamPovinnychPriloh(), function (r) {
            r.PocetnostOd > 0 &&
              ((t += r.PocetnostOd),
              n.PrilohaList() &&
                n.PrilohaList().length > 0 &&
                $.grep(n.PrilohaList(), function (n) {
                  return (
                    n.TypDokumentuID == r.TypDokumentuID &&
                    n.TypObjektuID == r.TypObjektuID
                  );
                }).length >= r.PocetnostOd &&
                (i += r.PocetnostOd));
          }),
        t != i
      );
    }, this)),
    (this.existujeChybajuciPovinnyDokument = ko.computed(function () {
      var n = this,
        t = 0,
        i = 0;
      return (
        n.ZoznamVsetkychDokumentov() &&
          ko.utils.arrayFirst(n.ZoznamVsetkychDokumentov(), function (r) {
            t++, n.pocetZostavajucichDokumentov(r) <= 0 && i++;
          }),
        t != i
      );
    }, this)),
    (this.ValidDokument = ko.computed(function () {
      var n = this;
      return (
        !n.existujeChybajucaPovinnaPriloha() &&
        !n.existujeChybajuciPovinnyDokument()
      );
    }, this)),
    (this.aktualizujPrilohyPodpisy = function () {
      (main.podanie.JsonData.Prilohy = this.PrilohaList()),
        (main.podanie.JsonData.PodpisyJson = this.PodpisList());
    }),
    (this.maxPocetnostTypPrilohy = function (n, t) {
      var i = this;
      if (i.TypyPriloh())
        return $.grep(i.TypyPriloh(), function (i) {
          return i.TypDokumentuID == n && i.TypObjektuID == t;
        })[0].PocetnostDo;
      0;
    }),
    (this.maxPocetnostTypDokumentu = function (n) {
      var t = this;
      if (t.TypyPriloh())
        return $.grep(t.TypyPriloh(), function (t) {
          return t.TypDokumentuID == n;
        })[0].PocetnostVsetkychObjVDokDo;
      0;
    }),
    (this.addPriloha = function (n) {
      if (
        $.grep(this.PrilohaList(), function (t) {
          return (
            t.TypDokumentuID == n.TypDokumentuID &&
            t.TypObjektuID == n.TypObjektuID
          );
        }).length >=
        this.maxPocetnostTypPrilohy(n.TypDokumentuID, n.TypObjektuID)
      )
        main.ShowMessage(main.ScriptsResourceObj.maxAttachmentTypeCountLimit);
      else if (
        $.grep(this.PrilohaList(), function (t) {
          return t.TypDokumentuID == n.TypDokumentuID;
        }).length >= this.maxPocetnostTypDokumentu(n.TypDokumentuID)
      )
        main.ShowMessage(main.ScriptsResourceObj.maxAttachmentCountLimit);
      else {
        if (
          (this.PrilohaList.push({
            IDPrilohaElektronickehoDokumentu:
              n.IDPrilohaElektronickehoDokumentu,
            TypObjektuID: n.TypObjektuID,
            TypDokumentuID: n.TypDokumentuID,
            Nazov: n.Nazov,
            DataPrilohy: n.DataPrilohy,
            Format: n.Format,
            IDElektronickyDokumentPriloha: n.IDElektronickyDokumentPriloha,
            Velkost: n.Velkost,
            Pridany: n.Pridany,
            DatumPridania: n.DatumPridania,
            NaviazatExistujucu: n.NaviazatExistujucu,
          }),
          (main.podanie.JsonData.Prilohy = this.PrilohaList()),
          n.IDPrilohaElektronickehoDokumentu)
        ) {
          var t = $('input[id="' + n.IDPrilohaElektronickehoDokumentu + '"]');
          t &&
            (t.attr("disabled", "disabled"),
            t.parent().parent().addClass("trdisabled"),
            t
              .parent()
              .parent()
              .attr("title", main.ScriptsResourceObj.fileAlreadyAdded));
        }
        main.podanieViewModel.Format("");
      }
    }),
    (this.removePriloha = function (n, t, i, r) {
      var u;
      if (n) {
        for (u = this.PrilohaList().length - 1; u >= 0; u--)
          if (
            this.PrilohaList()[u].IDPrilohaElektronickehoDokumentu == n.value
          ) {
            this.PrilohaList.splice(u, 1);
            break;
          }
      } else
        for (u = this.PrilohaList().length - 1; u >= 0; u--)
          if (
            this.PrilohaList()[u].Nazov == t.value &&
            this.PrilohaList()[u].TypDokumentuID == i.value &&
            this.PrilohaList()[u].TypObjektuID == r.value
          ) {
            this.PrilohaList.splice(u, 1);
            break;
          }
      main.podanie.JsonData.Prilohy = this.PrilohaList();
    }),
    (this.updatePrilohaListOnPodTypChange = function () {
      var i = this,
        r = [],
        u,
        n,
        t;
      if (i.TypyPriloh())
        for (u = 0; u < i.PrilohaList().length; u++)
          (n = i.PrilohaList()[u]),
            n.TypDokumentuID == 0 && n.TypObjektuID == 0
              ? r.push(n)
              : ((t = $.grep(i.TypyPriloh(), function (t) {
                  return (
                    n.TypDokumentuID == t.TypDokumentuID &&
                    n.TypObjektuID == t.TypObjektuID
                  );
                })),
                t && t.length == 1
                  ? r.push(n)
                  : (t = $.grep(i.TypyPriloh(), function (t) {
                      return n.Format == t.Format;
                    })),
                t &&
                  t.length == 1 &&
                  ((n.TypDokumentuID = t[0].TypDokumentuID),
                  (n.TypObjektuID = typ.TypObjektuID),
                  r.push(n)));
      i.PrilohaList(r);
    }),
    (this.updatePrilohaListOnPodTypChange = function () {
      var n = this,
        r = [],
        t,
        i,
        u;
      if (n.TypyPriloh())
        for (t = 0; t < n.TypyPriloh().length; t++)
          (i = n.TypyPriloh()[t]),
            (u = $.grep(n.PrilohaList(), function (n) {
              return (
                (n.TypDokumentuID == i.TypDokumentuID &&
                  n.TypObjektuID == i.TypObjektuID) ||
                (t == 0 && n.TypDokumentuID == 0 && n.TypObjektuID == 0)
              );
            })),
            ko.utils.arrayPushAll(r, u);
      n.PrilohaList(r);
    }),
    (this.containsFile = function (n, t, i, r) {
      var u;
      return ((u = r
        ? $.grep(this.PrilohaList(), function (n) {
            return n.IDPrilohaElektronickehoDokumentu == r;
          })[0]
        : $.grep(this.PrilohaList(), function (r) {
            return r.TypDokumentuID == n && r.TypObjektuID == t && r.Nazov == i;
          })[0]),
      u)
        ? !0
        : !1;
    }),
    (this.SucetVelkostiPriloh = ko.computed(function () {
      var t = this,
        n = 0;
      return (
        ko.utils.arrayForEach(t.PrilohaList(), function (t) {
          n += t.Velkost;
        }),
        n
      );
    }, this)),
    (this.addPodpis = function (n) {
      this.PodpisList.push({
        IDElektronickyDokument: n.IDElektronickyDokument,
        CasovaPeciatka: n.CasovaPeciatka,
        IDElektronickyPodpis:
          this.PodpisList().length == 0
            ? 1
            : this.PodpisList()[this.PodpisList().length - 1]
                .IDElektronickyPodpis + 1,
        NazovPouzivatela: n.NazovPouzivatela,
        Nezmeneny: n.Nezmeneny,
        Vykonany: n.Vykonany,
        XAdESEpesXml: n.XAdESEpesXml,
        XADEST: n.XADEST,
        AsicB64String: n.AsicB64String,
      }),
        (main.podanie.JsonData.PodpisyJson = this.PodpisList()),
        this.PodpisList().length == 1 &&
          (main.podanie.SetStavElektronickehoDokumentu("C"),
          (main.podanie.JsonData.Nezmeneny = !1),
          main.frame.Readonly(!0)),
        $(".accordion2.notactive div#Podpisy").length > 0 &&
          $(".accordion2.notactive div#Podpisy").prev().click();
    }),
    (this.removePodpis = function (n, t) {
      for (var i = 0; i < this.PodpisList().length; i++)
        if (
          this.PodpisList()[i].IDElektronickyPodpis == n.value &&
          this.PodpisList()[i].NazovPouzivatela == t.value
        ) {
          this.PodpisList.splice(i, 1);
          break;
        }
      (main.podanie.JsonData.PodpisyJson = this.PodpisList()),
        this.PodpisList().length == 0 &&
          (main.podanie.SetStavElektronickehoDokumentu("R"),
          (main.podanie.JsonData.Nezmeneny = !1),
          main.frame.Readonly(!1));
    }),
    (this.updatePriloha = function (n, t) {
      var i = ko.utils.arrayFirst(this.PrilohaList(), function (t) {
        return t.Nazov == n;
      });
      i && (i.IDPrilohaElektronickehoDokumentu = t);
    }),
    (this.Selectedpriloha = function () {
      var t = this,
        n = [],
        i = $('input[type="checkbox"]:not(:disabled):checked');
      return (
        i.each(function () {
          var i = this;
          n.push(
            $.grep(t.filterZoznam(), function (n) {
              return (
                n.IDPrilohaElektronickehoDokumentu == i.attributes.id.value
              );
            })[0]
          );
        }),
        $(n)
      );
    }),
    (this.typDokumentuNazov = function (n) {
      var i = this,
        t;
      return i.TypyPriloh() &&
        ((t = $.grep(i.TypyPriloh(), function (t) {
          return t.TypDokumentuID == n;
        })),
        t && t[0])
        ? t[0].TypDokumentuNazov
        : "";
    }),
    (this.valid = function () {
      var n = this;
      return !n.existujeChybajucaPovinnaPriloha();
    }),
    (this.isPridany = function (n) {
      var t = this;
      return t.PrilohaList() ? t.containsFile(null, null, null, n) : !1;
    }),
    (this.GetPrilohaLocalOnly = function (n, t, i) {
      var u = this,
        r = undefined;
      return (
        u.PrilohaList() &&
          (r = $.grep(this.PrilohaList(), function (r) {
            return r.TypDokumentuID == t && r.TypObjektuID == i && r.Nazov == n;
          })[0]),
        r
      );
    }),
    (this.ShowWarningMessage = ko.observable(data.UpozornujuciText));
}
function b64ToUint6(n) {
  return n > 64 && n < 91
    ? n - 65
    : n > 96 && n < 123
    ? n - 71
    : n > 47 && n < 58
    ? n + 4
    : n === 43
    ? 62
    : n === 47
    ? 63
    : 0;
}
function base64DecToArr(n, t) {
  for (
    var s = n.replace(/[^A-Za-z0-9\+\/]/g, ""),
      r = s.length,
      h = t ? Math.ceil(((r * 3 + 1) >> 2) / t) * t : (r * 3 + 1) >> 2,
      c = new Uint8Array(h),
      u,
      f,
      e = 0,
      o = 0,
      i = 0;
    i < r;
    i++
  )
    if (
      ((f = i & 3),
      (e |= b64ToUint6(s.charCodeAt(i)) << (18 - 6 * f)),
      f === 3 || r - i == 1)
    ) {
      for (u = 0; u < 3 && o < h; u++, o++)
        c[o] = (e >>> ((16 >>> u) & 24)) & 255;
      e = 0;
    }
  return c;
}
function uint6ToB64(n) {
  return n < 26
    ? n + 65
    : n < 52
    ? n + 71
    : n < 62
    ? n - 4
    : n === 62
    ? 43
    : n === 63
    ? 47
    : 65;
}
function base64EncArr(n) {
  for (var r, u = "", f = n.length, i = 0, t = 0; t < f; t++)
    (r = t % 3),
      t > 0 && ((t * 4) / 3) % 76 == 0 && (u += "\r\n"),
      (i |= n[t] << ((16 >>> r) & 24)),
      (r === 2 || n.length - t == 1) &&
        ((u += String.fromCharCode(
          uint6ToB64((i >>> 18) & 63),
          uint6ToB64((i >>> 12) & 63),
          uint6ToB64((i >>> 6) & 63),
          uint6ToB64(i & 63)
        )),
        (i = 0));
  return u.replace(/A(?=A$|$)/g, "=");
}
function UTF8ArrToStr(n) {
  for (var u = "", i, r = n.length, t = 0; t < r; t++)
    (i = n[t]),
      (u += String.fromCharCode(
        i > 251 && i < 254 && t + 5 < r
          ? (i - 252) * 1073741824 +
              ((n[++t] - 128) << 24) +
              ((n[++t] - 128) << 18) +
              ((n[++t] - 128) << 12) +
              ((n[++t] - 128) << 6) +
              n[++t] -
              128
          : i > 247 && i < 252 && t + 4 < r
          ? ((i - 248) << 24) +
            ((n[++t] - 128) << 18) +
            ((n[++t] - 128) << 12) +
            ((n[++t] - 128) << 6) +
            n[++t] -
            128
          : i > 239 && i < 248 && t + 3 < r
          ? ((i - 240) << 18) +
            ((n[++t] - 128) << 12) +
            ((n[++t] - 128) << 6) +
            n[++t] -
            128
          : i > 223 && i < 240 && t + 2 < r
          ? ((i - 224) << 12) + ((n[++t] - 128) << 6) + n[++t] - 128
          : i > 191 && i < 224 && t + 1 < r
          ? ((i - 192) << 6) + n[++t] - 128
          : i
      ));
  return u;
}
function strToUTF8Arr(n) {
  for (var i, t, o = n.length, f = 0, r, e, u = 0; u < o; u++)
    (t = n.charCodeAt(u)),
      (f +=
        t < 128
          ? 1
          : t < 2048
          ? 2
          : t < 65536
          ? 3
          : t < 2097152
          ? 4
          : t < 67108864
          ? 5
          : 6);
  for (i = new Uint8Array(f), r = 0, e = 0; r < f; e++)
    (t = n.charCodeAt(e)),
      t < 128
        ? (i[r++] = t)
        : t < 2048
        ? ((i[r++] = 192 + (t >>> 6)), (i[r++] = 128 + (t & 63)))
        : t < 65536
        ? ((i[r++] = 224 + (t >>> 12)),
          (i[r++] = 128 + ((t >>> 6) & 63)),
          (i[r++] = 128 + (t & 63)))
        : t < 2097152
        ? ((i[r++] = 240 + (t >>> 18)),
          (i[r++] = 128 + ((t >>> 12) & 63)),
          (i[r++] = 128 + ((t >>> 6) & 63)),
          (i[r++] = 128 + (t & 63)))
        : t < 67108864
        ? ((i[r++] = 248 + (t >>> 24)),
          (i[r++] = 128 + ((t >>> 18) & 63)),
          (i[r++] = 128 + ((t >>> 12) & 63)),
          (i[r++] = 128 + ((t >>> 6) & 63)),
          (i[r++] = 128 + (t & 63)))
        : ((i[r++] = 252 + t / 1073741824),
          (i[r++] = 128 + ((t >>> 24) & 63)),
          (i[r++] = 128 + ((t >>> 18) & 63)),
          (i[r++] = 128 + ((t >>> 12) & 63)),
          (i[r++] = 128 + ((t >>> 6) & 63)),
          (i[r++] = 128 + (t & 63)));
  return i;
}
var prefix, Podanie, Frame, FileUpload;
$(function () {
  $(".tabNav li").click(function (n) {
    var t, u;
    n.preventDefault();
    var e = $(this),
      f = e.parent(),
      i = f.children(),
      r = 0;
    for (t = 0; t < i.length; t++)
      i[t] === this && (r = t), $(i[t]).removeClass("selected");
    (u = f.parent().children("div")),
      $.each(u, function () {
        $(this).removeClass("selected").hide();
      }),
      $(u[r]).show(),
      $(i[r]).addClass("selected");
  });
}),
  $(function () {
    var n = 60;
    $(".accordion")
      .removeClass("notactive")
      .filter(function () {
        return $(this).children("div:first").first().height() > n;
      })
      .addClass("notactive")
      .append(
        '<a class="accordionLink" href="#">+ zobraziť viac informácii</a>'
      ),
      $(".accordion a.accordionLink").click(function (t) {
        t.preventDefault();
        var i = $(this),
          r = i.parent(),
          u = r.children("div:first").first();
        r.hasClass("notactive")
          ? u.animate(
              { height: u.prop("scrollHeight") + "px" },
              350,
              function () {
                i.css("height", "auto"),
                  r.removeClass("notactive"),
                  i.text("- skryť doplňujúce informácie");
              }
            )
          : u.animate({ height: n + "px" }, 350, function () {
              r.addClass("notactive"), i.text("+ zobraziť viac informácii");
            });
      }),
      $(".accordion2").removeClass("notactive").addClass("notactive"),
      $(".accordion2 a").click(function (n) {
        n.preventDefault();
        var t = $(this).parent(),
          r = t.find("p").first(),
          i = t.children("div:first").first();
        t.hasClass("notactive")
          ? (t
              .parent()
              .children("div")
              .each(function () {
                var t = $(this),
                  i = t.children("div").first();
                t.hasClass("notactive") == !1 &&
                  i.animate(null, 350, function () {
                    t.addClass("notactive");
                  });
              }),
            i.animate(null, 350, function () {
              r.css("height", "auto"), t.removeClass("notactive");
            }))
          : i.animate(null, 350, function () {
              t.addClass("notactive");
            });
      });
  }),
  $(function () {
    function n(n) {
      var t = $(document).height(),
        i = $(window).width();
      $("#mask").css({ width: i, height: t }).fadeTo(500, 0.5),
        $(n).slideDown(350);
    }
    $(".showDialog").click(function (t) {
      t.preventDefault(), n($(this).attr("href"));
    });
  }),
  $(function () {
    $(".elementInfo, .formValidator").click(function () {
      var n = $(this).children("span.tooltip").first();
      n.hasClass("tooltipShow")
        ? n.removeClass("tooltipShow")
        : n.addClass("tooltipShow");
    });
  }),
  $.ajaxSetup({
    error: function (n) {
      var u;
      $("#xmlinput").hide();
      try {
        var e = $("#columnContentSide :first-child div").first().text(),
          o = new Date(),
          r = new Date(o.getTime()),
          f =
            "<br />" +
            e +
            ", " +
            r.getDate() +
            "." +
            (r.getMonth() + 1) +
            "." +
            r.getFullYear() +
            " " +
            r.getHours() +
            ":" +
            r.getMinutes() +
            ":" +
            r.getSeconds();
        main.podanie.JsonData &&
          main.podanie.JsonData.TypObjektuFormular === null &&
          main.TypObjektuPreFormularBeforeSave &&
          (main.podanie.JsonData.TypObjektuFormular =
            main.TypObjektuPreFormularBeforeSave),
          (u = JSON.parse(n.responseText).message),
          u && main.ShowMessage(u + f, main.HideLoader);
      } catch (s) {
        main.ShowMessage(
          main.ScriptsResourceObj.unspecifiedError +
            "<br />" +
            n.status +
            " - " +
            n.statusText +
            f,
          main.HideLoader
        );
      }
    },
  }),
  Array.prototype.indexOf ||
    (Array.prototype.indexOf = function (n) {
      var i = this.length >>> 0,
        t = Number(arguments[1]) || 0;
      for (
        t = t < 0 ? Math.ceil(t) : Math.floor(t), t < 0 && (t += i);
        t < i;
        t++
      )
        if (t in this && this[t] === n) return t;
      return -1;
    }),
  typeof String.prototype.endsWith != "function" &&
    (String.prototype.endsWith = function (n) {
      return this.indexOf(n, this.length - n.length) !== -1;
    }),
  (function (n, t) {
    var u, o;
    n.ServerTime,
      n.ClientTime,
      (n.TypObjektuID = -1),
      (n.TypObjektu = ""),
      (n.TypDokumentuID = -1),
      (n.TypDokumentu = ""),
      (n.Format = ""),
      n.podanieViewModel,
      n.podanie,
      n.frame,
      n.fileUpload,
      (n.ValidFormular = !1),
      n.errorURL,
      n.PodanieDetailPost,
      n.PodpisatEZ,
      n.PodanieDetailJson,
      n.DownloadAttachment,
      n.DownloadPodpis,
      n.ListAttachments,
      n.FormularDomain,
      n.IDElektronickehoDokumentu,
      n.IDVerziaElektronickehoFormulara,
      n.IDPodaniaEKR,
      n.IDSluzby,
      n.IDSubjekt,
      n.IDSubjektZastupca,
      n.KopiaPodania,
      n.EKR2,
      n.Register,
      n.Jazyk,
      n.ScriptsResourceObj,
      n.SaveXml2File,
      n.SaveZip2File,
      n.signaturePolicy,
      n.SubmitType,
      n.priloha,
      (n.hiddenIframeID = 0),
      n.SignerComponentsURL,
      n.TypObjektuPreFormularBeforeSave,
      n.DefaultData,
      n.LastEZClick,
      n.LastZEPClick,
      n.ValidateOnlyType,
      n.xdcNamespaceURI,
      n.xdcVerzia,
      (n.LoadAndInit = function () {
        try {
          n.podanie
            .fetch()
            .then(function (i) {
              i.success == t || i.success
                ? n.podanie.load(i, n.frame)
                : n.ShowMessage(i.error);
            })
            .then(function () {
              n.podanie.initializeModel();
            })
            .then(function () {
              setTimeout(function () {
                n.HideLoader(!0);
              }, 3e3);
            });
        } catch (i) {
          setTimeout(function () {
            n.HideLoader(!1);
          }, 3e3);
        }
      }),
      (n.ClearFileName = function () {
        $("#fileUpload").val(""), $("#fileUploadFake").val("");
      }),
      (n.ShowLoader = function () {
        var n = $(document).height(),
          t = $(window).width();
        $("#mask").css({ width: t, height: n }).fadeTo(500, 0.5),
          $(".loading").show();
      }),
      (n.HideLoader = function (n) {
        $("#mask").css("display") == "block" &&
          ($("#mask").fadeOut(500, n ? u : t), $(".loading").hide());
      }),
      (n.ShowMessage = function (n, t) {
        if (t)
          $("#myModal button.close")
            .off("click.dialog")
            .on("click.dialog", function (n) {
              n.preventDefault(), $(this).parent().parent().slideUp(350), t();
            });
        else
          $("#myModal button.close")
            .off("click.dialog")
            .on("click.dialog", function (n) {
              n.preventDefault(),
                $(this).parent().parent().slideUp(350),
                $("#mask").hide();
            });
        $(".message").html(n);
        var i = $(document).height(),
          r = $(window).width();
        $("#mask").css({ width: r, height: i }).fadeTo(500, 0.5),
          $("#myModal").slideDown(350);
      }),
      (n.ShowDialog = function (t, i, r, u, f, e) {
        $(".messageQ").html(i),
          u
            ? $(".headerQ").text(u)
            : $(".headerQ").text(n.ScriptsResourceObj.questionHeader);
        var o = $(document).height(),
          s = $(window).width();
        $("#mask").css({ width: s, height: o }).fadeTo(500, 0.5),
          $(t).slideDown(350);
        $("#myQuestionModal button.close")
          .off("click.dialog")
          .on("click.dialog", function (n) {
            n.preventDefault(),
              $(this).parent().parent().slideUp(350),
              $("#mask").fadeOut(300),
              e && e();
          });
        $("#myQuestionModal button.yes")
          .off("click.dialog")
          .on("click.dialog", function (n) {
            n.preventDefault(),
              $(this).parent().parent().slideUp(350),
              f || $("#mask").fadeOut(300),
              r && r();
          });
      }),
      (n.ShowConfirm = function (n, t, i, r) {
        $(".messageC").text(t);
        var u = $(document).height(),
          f = $(window).width();
        $("#mask").css({ width: f, height: u }).fadeTo(500, 0.5),
          $(n).slideDown(350);
        $("#myConfirmModal button.close")
          .off("click.dialog")
          .on("click.dialog", function (n) {
            n.preventDefault(),
              $(this).parent().parent().slideUp(350),
              r && r();
          });
        $("#myConfirmModal button.yes")
          .off("click.dialog")
          .on("click.dialog", function (n) {
            n.preventDefault(), $(this).parent().parent().slideUp(350), i();
          });
      }),
      (n.ShowDialogWithLoad = function (n, t) {
        $(".messageQL").text(t);
        var i = $(document).height(),
          r = $(window).width();
        $("#mask").css({ width: r, height: i }).fadeTo(500, 0.5),
          $(n).slideDown(350);
        $(n + " button.close")
          .off("click.dialog")
          .on("click.dialog", function (n) {
            n.preventDefault(),
              $(this).parent().parent().slideUp(350),
              $("#mask").fadeOut(300);
          });
        $("#btnLoadYes")
          .off("click.dialog")
          .on("click.dialog", function () {
            $(this).parent().parent().hide(), $("#mask").hide();
          });
      }),
      (u = function () {
        n.podanie.JsonData.IDElektronickyDokument != t &&
        n.podanie.JsonData.IDElektronickyDokument != null
          ? n.frame.loadFinalXML(n.podanie.JsonData.DataDokumentuXml)
          : n.podanie.JsonData.DataDokumentuXml != t &&
            n.podanie.JsonData.DataDokumentuXml != null &&
            n.KopiaPodania
          ? n.frame.loadFinalXML(n.podanie.JsonData.DataDokumentuXml)
          : n.frame.loadDefaultXML(n.podanie.JsonData.DataNaPredvyplnenie),
          n.podanieViewModel.PodpisList().length > 0 &&
            ((n.podanie.JsonData.Nezmeneny = !0), n.frame.Readonly(!0)),
          $("iframe")
            .contents()
            .find("body")
            .css("background-color", "#f3f4f7");
      }),
      (n.ShowFormular = function () {
        GoToStep(0);
      }),
      (n.PostMessage = function (t, i, r) {
        console.log("PostMessage " + i + "::::" + r),
          r
            ? t.postMessage(i + "::::" + r, n.FormularDomain)
            : t.postMessage(i + "::::", n.FormularDomain);
      }),
      (n.ReceiveMessage = function (u) {
        var v, o, y, l, c, p, a, s, h;
        if ((console.log("ReceiveMessage"), u.origin === n.FormularDomain)) {
          (v = u.data.split("::::")[0]), (o = u.data.split("::::")[1]);
          switch (v) {
            case "validate":
              o &&
                o != "undefined" &&
                ((s = parseFloat(o.split("¶¶¶¶")[0])),
                (h = o.split("¶¶¶¶")[2]),
                (n.ValidFormular = s < 5 ? !0 : !1),
                (y = n.DetectTypFormulara(o.split("¶¶¶¶")[1])),
                n.ValidateOnlyType ||
                  (n.podanie.setData(h),
                  y &&
                    (parseFloat(s) > 5
                      ? n.ShowMessage(n.ScriptsResourceObj.validationErrors)
                      : s === 0
                      ? n.ShowMessage(n.ScriptsResourceObj.validationSuccess)
                      : s === 1 &&
                        n.ShowMessage(n.ScriptsResourceObj.logicalErrors))));
              break;
            case "print":
              o &&
                o != "undefined" &&
                ((s = parseFloat(o.split("¶¶¶¶")[0])),
                (h = o.split("¶¶¶¶")[1]),
                s < 5
                  ? s === 0
                    ? n.saveZip2Disk(h)
                    : s === 1 &&
                      n.ShowDialog(
                        "#myQuestionModal",
                        n.ScriptsResourceObj.validationErrorsContinue,
                        function () {
                          n.saveZip2Disk(h);
                        }
                      )
                  : n.ShowMessage(n.ScriptsResourceObj.printError));
              break;
            case "Save2File":
              o &&
                o != "undefined" &&
                ((h = o.split("¶¶¶¶")[2]),
                n.DetectTypFormulara(o.split("¶¶¶¶")[1]),
                n.SaveToDisk(h, "output.xml", "text/xml"));
              break;
            case "Save2PFS":
              o &&
                o != "undefined" &&
                ((s = parseFloat(o.split("¶¶¶¶")[0])),
                (n.ValidFormular = s < 5 ? !0 : !1),
                (h = o.split("¶¶¶¶")[2]),
                n.DetectTypFormulara(o.split("¶¶¶¶")[1]) &&
                  ((n.podanie.JsonData.DataVyplnene = o.split("¶¶¶¶")[3]),
                  n.SubmitType &&
                  (n.SubmitType == "btnPodpisEZ" ||
                    n.SubmitType == "btnPodatOSS")
                    ? s > 5
                      ? n.ShowMessage(n.ScriptsResourceObj.validationErrors)
                      : s === 0
                      ? n.podanieViewModel.DisableSave() ||
                        i(o.split("¶¶¶¶")[3])
                        ? ((l =
                            n.podanieViewModel.SelectedTypObj()[0]
                              .TypPodaniaNazov),
                          (c = null),
                          (c = getAliasValue(
                            n.podanie.JsonData.DataNaPredvyplnenie,
                            "dicrc"
                          )
                            ? getAliasValue(
                                n.podanie.JsonData.DataNaPredvyplnenie,
                                "dicrc"
                              ) +
                              " – " +
                              getAliasValue(
                                n.podanie.JsonData.DataNaPredvyplnenie,
                                "obchodneMeno"
                              )
                            : getAliasValue(
                                n.podanie.JsonData.DataNaPredvyplnenie,
                                "obchodneMeno"
                              )),
                          (p = n.podanie.JsonData.JeFiktivnySubjekt
                            ? n.ScriptsResourceObj.sending1 + " " + l
                            : [
                                "Žiadosť o autorizáciu_DS",
                                "Žiadosť o autorizáciu_CS",
                              ].indexOf(l) < 0
                            ? n.ScriptsResourceObj.sendingSubjekt + " " + c
                            : n.ScriptsResourceObj.sendingRequest),
                          n.ShowConfirm(
                            "#myConfirmModal",
                            p,
                            function () {
                              if (f()) {
                                var t = n.ScriptsResourceObj.ezLicennce;
                                n.ShowDialog(
                                  "#myQuestionModal",
                                  t,
                                  function () {
                                    n.podanie.setData(h, null, !0);
                                  },
                                  n.ScriptsResourceObj.warningTitle,
                                  !0
                                );
                              } else n.podanie.setData(h, null, !0);
                            },
                            function () {
                              n.ShowDialog(
                                "#myQuestionModal",
                                n.ScriptsResourceObj.sendCancelQuestion,
                                t,
                                n.ScriptsResourceObj.sendCancelTitle,
                                !1,
                                function () {
                                  $("#myConfirmModal").slideDown(
                                    350,
                                    function () {
                                      $("#mask").show();
                                    }
                                  );
                                }
                              );
                            }
                          ))
                        : r()
                      : s === 1 &&
                        n.ShowDialog(
                          "#myQuestionModal",
                          n.ScriptsResourceObj.validationErrorsContinue,
                          function () {
                            var e, u, s;
                            n.podanieViewModel.DisableSave() ||
                            i(o.split("¶¶¶¶")[3])
                              ? ((e =
                                  n.podanieViewModel.SelectedTypObj()[0]
                                    .TypPodaniaNazov),
                                (u = null),
                                (u = getAliasValue(
                                  n.podanie.JsonData.DataNaPredvyplnenie,
                                  "dicrc"
                                )
                                  ? getAliasValue(
                                      n.podanie.JsonData.DataNaPredvyplnenie,
                                      "dicrc"
                                    ) +
                                    " – " +
                                    getAliasValue(
                                      n.podanie.JsonData.DataNaPredvyplnenie,
                                      "obchodneMeno"
                                    )
                                  : getAliasValue(
                                      n.podanie.JsonData.DataNaPredvyplnenie,
                                      "obchodneMeno"
                                    )),
                                (s = n.podanie.JsonData.JeFiktivnySubjekt
                                  ? n.ScriptsResourceObj.sending1 + " " + e
                                  : [
                                      "Žiadosť o autorizáciu_DS",
                                      "Žiadosť o autorizáciu_CS",
                                    ].indexOf(e) < 0
                                  ? n.ScriptsResourceObj.sendingSubjekt +
                                    " " +
                                    u
                                  : n.ScriptsResourceObj.sendingRequest),
                                n.ShowConfirm(
                                  "#myConfirmModal",
                                  s,
                                  function () {
                                    if (f()) {
                                      var t = n.ScriptsResourceObj.ezLicennce;
                                      n.ShowDialog(
                                        "#myQuestionModal",
                                        t,
                                        function () {
                                          n.podanie.setData(h, null, !0);
                                        },
                                        n.ScriptsResourceObj.warningTitle,
                                        !0
                                      );
                                    } else n.podanie.setData(h, null, !0);
                                  },
                                  function () {
                                    n.ShowDialog(
                                      "#myQuestionModal",
                                      n.ScriptsResourceObj.sendCancelQuestion,
                                      t,
                                      n.ScriptsResourceObj.sendCancelTitle,
                                      !1,
                                      function () {
                                        $("#myConfirmModal").slideDown(
                                          350,
                                          function () {
                                            $("#mask").show();
                                          }
                                        );
                                      }
                                    );
                                  }
                                ))
                              : r();
                          },
                          t,
                          !0
                        )
                    : n.podanie.setData(h, !0)));
              break;
            case "LoadFromFile":
              o &&
                (o.split("¶¶¶¶")[0] != "success" &&
                  ((a = o.split("¶¶¶¶")[0]),
                  a ==
                  "Formát vstupného XML súboru nezodpovedá vybranému typu dokumentu."
                    ? n.ShowMessage(n.ScriptsResourceObj.formatMismatch)
                    : n.ShowMessage(a)),
                e(o.split("¶¶¶¶")[1]),
                o.split("¶¶¶¶").length == 3 &&
                  n.DetectTypFormulara(o.split("¶¶¶¶")[2]));
              break;
            case "LoadDefault":
              o &&
                o.split("¶¶¶¶")[0] != "undefined" &&
                n.podanie.UpdateTypPodania(o.split("¶¶¶¶")[0]),
                e(o.split("¶¶¶¶")[1]);
              break;
            case "Sign":
              o &&
                o != "undefined" &&
                ((s = parseFloat(o.split("¶¶¶¶")[0])),
                (n.ValidFormular = s < 5 ? !0 : !1),
                (h = JSON.parse(o.split("¶¶¶¶")[2])),
                n.DetectTypFormulara(o.split("¶¶¶¶")[1]) &&
                  (n.podanie.setData(h.xmldata),
                  s === 0
                    ? n.podanieViewModel.DisableSave() || i(o.split("¶¶¶¶")[3])
                      ? n.podanie.Sign(h)
                      : r()
                    : s === 1
                    ? n.ShowDialog(
                        "#myQuestionModal",
                        n.ScriptsResourceObj.validationErrorsContinue,
                        function () {
                          n.podanieViewModel.DisableSave() ||
                          i(o.split("¶¶¶¶")[3])
                            ? n.podanie.Sign(h)
                            : r();
                        }
                      )
                    : n.ShowMessage(n.ScriptsResourceObj.signError),
                  (n.podanie.JsonData.DataVyplnene = o.split("¶¶¶¶")[3])));
              break;
            case "Confirmation":
              o &&
                o != "undefined" &&
                ((s = parseFloat(o.split("¶¶¶¶")[0])),
                (h = o.split("¶¶¶¶")[1]),
                s < 5
                  ? h &&
                    h != "undefined" &&
                    (s === 0
                      ? n.saveZip2Disk(h, !0)
                      : s === 1 &&
                        n.ShowDialog(
                          "#myQuestionModal",
                          n.ScriptsResourceObj.validationErrorsContinue,
                          function () {
                            n.saveZip2Disk(h, !0);
                          }
                        ))
                  : n.ShowMessage(n.ScriptsResourceObj.printError));
              break;
            case "ShowMessage":
              o &&
                (o ==
                "Formulár neobsahuje tlačenú PDF predlohu. Formulár bude vytlačený pomocou funkcie webového prehliadača na tlač HTML dokumentu."
                  ? n.ShowMessage(n.ScriptsResourceObj.noPrintAvailable)
                  : o == "Poučenie k tomuto formuláru nie je dostupné."
                  ? n.ShowMessage(n.ScriptsResourceObj.noInstructionAvailable)
                  : n.ShowMessage(o));
              break;
            case "Type":
              o && n.DetectTypFormulara(o);
          }
        }
      });
    var f = function () {
        return n.IDVerziaElektronickehoFormulara == 238 ||
          n.IDVerziaElektronickehoFormulara == 237
          ? !0
          : !1;
      },
      i = function (i) {
        var nt, e, b, w, ht, p, k, v, a, y, it, d;
        if (n.podanie.JsonData.JeFiktivnySubjekt)
          return 0 <=
            n.podanie.JsonData.PodavaniePovoleneTypPodania.indexOf(
              "," + n.podanieViewModel.SelectedTypObj()[0].TypPodaniaKod + ","
            )
            ? !0
            : !1;
        (nt =
          0 <=
          n.podanie.JsonData.TypyPodaniBezKontrolyDIC.indexOf(
            "," + n.podanieViewModel.SelectedTypObj()[0].TypPodaniaKod + ","
          )),
          (e = getAliasValue(i, "ico")),
          e || (e = getAliasValue(i, "ico12"));
        var h = getAliasValue(i, "icdph"),
          o = getAliasValue(i, "dic"),
          f = getAliasValue(i, "dicrc"),
          at = getAliasValue(i, "rodneCislo"),
          vt = at !== t ? at.replace("/", "") : "",
          yt = getAliasValue(i, "rodneCislo1cast"),
          kt = getAliasValue(i, "rodneCislo2cast"),
          tt = getAliasValue(i, "datumnarodenia"),
          st = getAliasValue(i, "evidencnecislospd"),
          g = getAliasValue(i, "registracnecislospd"),
          ot = getAliasValue(i, "in"),
          ft = getAliasValue(i, "im"),
          ut = getAliasValue(i, "voes"),
          rt = getAliasValue(n.podanie.JsonData.DataNaPredvyplnenie, "ico"),
          ct = getAliasValue(n.podanie.JsonData.DataNaPredvyplnenie, "ico12");
        if (e && rt && ct && e != rt && e != ct) return !1;
        var pt = getAliasValue(n.podanie.JsonData.DataNaPredvyplnenie, "icdph"),
          dt = getAliasValue(n.podanie.JsonData.DataNaPredvyplnenie, "oicdph"),
          u = getAliasValue(n.podanie.JsonData.DataNaPredvyplnenie, "dic"),
          r = getAliasValue(
            n.podanie.JsonData.DataNaPredvyplnenie,
            "dicNaKontrolu"
          );
        if (
          (h &&
            h != pt &&
            h != dt &&
            ((b = h.slice(-10)), (!u || b != u) && (!r || b != r))) ||
          (o && (u || r) && o != u && (!r || o != r)) ||
          (!nt && o !== t && o == "" && u)
        )
          return !1;
        var et = getAliasValue(
            n.podanie.JsonData.DataNaPredvyplnenie,
            "rodneCislo"
          ),
          s = et !== t ? et.replace("/", "") : "",
          l = getAliasValue(n.podanie.JsonData.DataNaPredvyplnenie, "dicrc");
        if (
          (f &&
            (l || u || s || r) &&
            (!l || f != l) &&
            (!u || f != u) &&
            (!s || f != s) &&
            (!r || f != r)) ||
          (!nt && f !== t && f == "" && l) ||
          (vt && s && vt != s) ||
          ((w = getAliasValue(
            n.podanie.JsonData.DataNaPredvyplnenie,
            "rodneCislo1cast"
          )),
          (ht = getAliasValue(
            n.podanie.JsonData.DataNaPredvyplnenie,
            "rodneCislo2cast"
          )),
          yt && w && (yt != w || kt != ht)) ||
          ((p = getAliasValue(
            n.podanie.JsonData.DataNaPredvyplnenie,
            "datumnarodenia"
          )),
          tt && p && tt != p)
        )
          return !1;
        var bt = getAliasValue(
            n.podanie.JsonData.DataNaPredvyplnenie,
            "evidencnecislospd"
          ),
          lt = bt.split(","),
          wt = getAliasValue(
            n.podanie.JsonData.DataNaPredvyplnenie,
            "registracnecislospd"
          ),
          c = wt.split(",");
        if (st && lt.length > 0) {
          if (((k = lt.indexOf(st)), k < 0)) return !1;
          if (g && c)
            if (c.length > 1) {
              if (c[k] != g) return !1;
            } else if (c[0] != g) return !1;
        }
        return ((v = getAliasValue(
          n.podanie.JsonData.DataNaPredvyplnenie,
          "in"
        )),
        ot && v && ot != v)
          ? !1
          : ((a = getAliasValue(n.podanie.JsonData.DataNaPredvyplnenie, "im")),
            ft &&
              a &&
              ((y = a.split("|")),
              y.length > 0 && ((it = y.indexOf(ft)), it < 0)))
          ? !1
          : ((d = getAliasValue(
              n.podanie.JsonData.DataNaPredvyplnenie,
              "voes"
            )),
            ut && d && ut != d)
          ? !1
          : !0;
      },
      r = function () {
        setTimeout(function () {
          n.podanie.JsonData.JeFiktivnySubjekt
            ? n.ShowMessage(
                n.Register == "oiz"
                  ? n.ScriptsResourceObj.subjectMismatchFictitious
                  : n.ScriptsResourceObj.subjectMismatchFictitiousOSS
              )
            : n.ShowMessage(
                n.Register == "oiz"
                  ? n.ScriptsResourceObj.subjectMismatch
                  : n.ScriptsResourceObj.subjectMismatchOSS
              );
        }, 500);
      },
      e = function (n) {
        parseFloat(n) === 1 ? $("#btnConfirm").show() : $("#btnConfirm").hide();
      },
      s = function () {
        (n.podanieViewModel.TypyPriloh() &&
          n.podanieViewModel.TypyPriloh().length != 0) ||
          GoToStep();
      };
    (n.DetectTypFormulara = function (t) {
      if (t && t != n.podanieViewModel.PodtypFormulara()) {
        if (
          (n.podanie.UpdateTypPodania(t),
          n.ShowMessage(
            n.ScriptsResourceObj.typPodaniaChange1 +
              " " +
              t +
              ", " +
              n.ScriptsResourceObj.typPodaniaChange2,
            s()
          ),
          $("#priloha").hasClass("notactive"))
        ) {
          $(document).off("click", "#priloha a:first", LoadFormularTyp),
            $("#priloha a:first").eq(0).click();
          $(document).on("click", "#priloha a:first", LoadFormularTyp);
        }
        return !1;
      }
      return !0;
    }),
      (n.SaveToDisk = function (n, t, i) {
        if (typeof window.Blob != "undefined") {
          var r = new Blob([n], { type: i });
          $.saveAs(r, t);
        } else o(n, t);
      }),
      (o = function (t, i) {
        var u = n.hiddenIframeID++,
          f = $(
            '<iframe style="display: none;" id="async-download-' + u + '" />'
          ).appendTo(document.body),
          r = $(
            '<form method="POST" action="' +
              n.SaveXml2File +
              '" style="display:none;" />'
          ).appendTo(document.body);
        $('<textarea name="content" />').val(t).appendTo(r),
          $('<input type="text" name="filename" />').val(i).appendTo(r),
          r.attr("target", "async-download-" + u),
          r.submit();
      }),
      (n.saveZip2Disk = function (t) {
        if (t) {
          var r = n.hiddenIframeID++,
            f = $(
              '<iframe style="display: none;" id="async-download-' +
                r +
                '" name="async-download-' +
                r +
                '" />'
            ).appendTo(document.body),
            u = $(
              '<form id="myForm' +
                r +
                '" method="POST" action="' +
                n.SaveZip2File +
                '" style="display:none;" enctype="multipart/form-data" />'
            ).appendTo(document.body);
          $('<input type="hidden" name="object2print" />').val(t).appendTo(u),
            u.attr("target", "async-download-" + r),
            u.submit(),
            JSON.parse(t).FDF2Print.length > 1 &&
              n.ShowMessage(n.ScriptsResourceObj.printResult);
        }
      });
  })((window.main = window.main || {})),
  $(function () {}),
  (prefix = "https://www.slovensko.sk/static/zep/dbridge_js/v1.0"),
  document.write(
    '<script type="text/javascript" src="' + prefix + '/config.js"></script>'
  ),
  document.write(
    '<script type="text/javascript" src="' +
      prefix +
      '/dCommon.min.js"></script>'
  ),
  document.write(
    '<script type="text/javascript" src="' +
      prefix +
      '/dSigXades.min.js"></script>'
  ),
  document.write(
    '<script type="text/javascript" src="' +
      prefix +
      '/dSigXadesBp.min.js"></script>'
  ),
  (function () {
    function n(n) {
      var i = window.dtcLanguageCode === "en" ? 1 : 0,
        t = r[n];
      return t != null ? t[i] : n;
    }
    function o() {
      i || (i = !0);
    }
    function s() {
      var t = {},
        u = window.location.href.split("?")[1],
        i,
        n,
        r;
      if (u == null) return t;
      for (i = u.split("&"), n = 0; n < i.length; n++)
        (r = i[n].split("=")), (t[r[0]] = decodeURIComponent(r[1]));
      return t;
    }
    function h() {
      var n = s().platforms;
      return n ? n.split(",") : null;
    }
    var f = function (n) {
        (main.podanieViewModel.StavElektronickehoDokumentu() == "R" ||
          main.podanieViewModel.StavElektronickehoDokumentu() == "C") &&
          main.ShowDialog(
            "#myQuestionModal",
            "Naozaj chcete odstrániť podpis: " +
              n.target.attributes.name.value +
              "?",
            function () {
              main.podanieViewModel.removePodpis(
                n.target.attributes.id,
                n.target.attributes.name
              );
            }
          );
      },
      e = function (n) {
        n.target.attributes["data-idPodpis"].value &&
          window.open(
            main.DownloadPodpis +
              "?IDElektronickyPodpis=" +
              n.target.attributes["data-idPodpis"].value
          );
      },
      r,
      i,
      t,
      u;
    (GetDSigXadesOld = function () {}), (AddObjectOld = function () {});
    $(document).on("click", "a.podpis", e);
    $(document).on("click", "a.podpisDelete", f);
    (r = {
      UNSUPPORTED_DEVICE: [
        "Ľutujeme, Vaše zariadenie nie je podporované.",
        "Sorry, your device is not supported.",
      ],
      DEPLOY_FAILED: [
        "Inicializácia aplikácie D.Signer/XAdES zlyhala",
        "The initialization of D.Signer/XAdES application failed.",
      ],
      INIT: [
        "Prosím, počkajte na inicializáciu aplikácie D.Signer/XadES pre vytvorenie kvalifikovaného elektronického podpisu (KEP). V prípade, že inicializácia aplikácie D.Signer/XadES trvá príliš dlho alebo nastala neočakávaná chyba, uistite sa, že:",
        "Please wait for D.Signer/XAdES application initialization to create a qualified electronic signature (QES). In case the initialization of D.Signer/XAdES application takes too long or unexpected error occurres, make sure that:",
      ],
      OBJECT: [
        "prehliadač neblokuje spúšťanie zásuvných modulov",
        "browser does not block the starting of plugins",
      ],
      DLAUNCHER1: [
        "máte nainštalovanú a nakonfigurovanú aplikáciu D.Launcher",
        "you have installed and configured the D.Launcher application",
      ],
      DLAUNCHER2: [
        "povolili ste prehliadaču spracovanie odkazov typu „ditec-dlauncher:“ pomocou aplikácie D.Launcher",
        'web browser is allowed to proccess "ditec-dlauncher:" links with D.Launcher application',
      ],
      JAVA_AND_DOTNET: [
        "máte nainštalované behové prostredie Java (odporúčané), alebo aplikáciu D.Signer/XadES .NET (verzie 4.0 a vyššie)",
        "you have installed Java runtime (recommended), or D.Signer/XAdES .NET application (version 4.0 or above)",
      ],
      JAVA: [
        "máte nainštalované behové prostredie Java",
        "you have installed Java runtime",
      ],
      DOTNET: [
        "máte nainštalovanú aplikáciu D.Signer/XadES .NET 4.0 a vyššie",
        "you have installed D.Signer/XAdES .NET application (version 4.0 or above)",
      ],
      PORTAL: [
        "Viac informácii môžete získať návštevou portálu ÚPVS ",
        "You can obtain more information by visiting the ÚPVS portal ",
      ],
      OPTIONAL: ["(voliteľné)", "(optional)"],
    }),
      (i = !1),
      (t = function () {
        (this.elm = null),
          (this.elm = $("#myModal")),
          (this.msgElm = $("p .message", this.elm));
      }),
      (t.prototype.show = function (n, t) {
        main.ShowMessage(n, t);
      }),
      (t.prototype.showMsg = function (n) {
        n && n.length > 0
          ? (this.msgElm.html(n), this.msgElm.show())
          : (this.msgElm.html(""), this.msgElm.hide());
      }),
      (t.prototype.hide = function () {
        this.elm && (this.elm.slideUp(350), $("#mask").fadeOut(500));
      }),
      (u = function (t, i) {
        var u = function (n) {
            return (
              '<li  style="list-style-type: disc; margin-left: 30px;">' +
              n +
              "</li>"
            );
          },
          s,
          r,
          c;
        if (((i = ""), t.length == 0)) return n("UNSUPPORTED_DEVICE");
        var f = !1,
          e = !1,
          o = !1,
          h = !1;
        for (s = 0; s < t.length; s++)
          switch (t[s]) {
            case "dLauncherJava":
              (f = !0), (h = !0);
              break;
            case "dLauncherDotNet":
              (e = !0), (h = !0);
              break;
            case "java":
              (f = !0), (o = !0);
              break;
            case "dotNet":
              (e = !0), (o = !0);
          }
        return (
          (r = n("INIT") + "<ul>"),
          o && (r += u(n("OBJECT"))),
          h &&
            ((c = o ? " " + n("OPTIONAL") : ""),
            (r += u(n("DLAUNCHER1") + c)),
            (r += u(n("DLAUNCHER2") + c))),
          f && e
            ? (r += u(n("JAVA_AND_DOTNET")))
            : f
            ? (r += u(n("JAVA")))
            : e && (r += u(n("DOTNET"))),
          ditec.config.downloadPage &&
            (r +=
              "</ul><br>" +
              n("PORTAL") +
              ' <a target="_blank" href="' +
              ditec.config.downloadPage.url +
              '">' +
              ditec.config.downloadPage.title +
              "</a>"),
          '<div class="article">' + r + "</div>"
        );
      }),
      (window.common = {
        Callback: function (n) {
          (this.onSuccess = n),
            this.onSuccess == null &&
              (this.onSuccess = function (n) {
                alert("Hodnota:\n" + n);
              });
        },
        deploy: function (n, i, r) {
          n.detectSupportedPlatforms(
            h(),
            new common.Callback(function (f) {
              var e = new t(),
                o;
              e.show(u(f, i), function () {}),
                (o = {
                  onSuccess: function () {
                    e.hide(), r();
                  },
                  onError: function (n) {
                    if (ditec.utils.isDitecError(n)) {
                      if (n.code == ditec.utils.ERROR_CANCELLED) {
                        e.showMsg("prerusene");
                        return;
                      }
                      if (n.code == ditec.utils.ERROR_NOT_INSTALLED) {
                        e.showMsg("not installed");
                        return;
                      }
                    }
                    e.showMsg(n.toString());
                  },
                }),
                f.length > 0 && n.deploy({ platforms: f }, o);
            })
          );
        },
        showWaitingDialog: function (n) {
          if ((o(), n)) {
            var t = $(document).height(),
              i = $(window).width();
            $("#mask").css({ width: i, height: t }).fadeTo(500, 0.5);
          } else
            $("#mask").css("display") == "block" && $("#mask").fadeOut(300);
        },
      }),
      (common.Callback.prototype.onError = function () {
        common.showWaitingDialog(!1);
      });
  })(),
  (Podanie = function () {
    this.JsonData = null;
    $(document).on("click", "#btnUlozitPFS", this.save2PFS.bind(this));
    $(document).on("click", "#btnZmazatPFS", this.deleteFromPFS.bind(this));
    $(document).on("click", "#btnPodpisZEP", main.frame.Sign.bind(main.frame));
    $(document).on("click", "#btnPodpisEZ", this.save2PFS.bind(this));
    $(document).on("click", "#btnPodatOSS", this.save2PFS.bind(this));
    $(document).on("click", "#btnPodat", this.Send2PFS.bind(this));
    return this;
  }),
  (Podanie.prototype.fetch = function () {
    var n = {
      IDElektronickehoDokumentu: main.IDElektronickehoDokumentu,
      IDVerziaElektronickehoFormulara: main.IDVerziaElektronickehoFormulara,
      IDPodaniaEKR: main.IDPodaniaEKR,
      IDSubjekt: main.IDSubjekt,
      KopiaPodania: main.KopiaPodania,
      IDSubjektZastupca: main.IDSubjektZastupca,
      EKR2: main.EKR2,
      Register: main.Register,
      Jazyk: main.Jazyk,
    };
    return $.ajax({
      url: main.PodanieDetailJson,
      data: JSON.stringify(n),
      type: "POST",
      dataType: "json",
      contentType: "application/json; charset=utf-8",
      beforeSend: function () {
        ActualizeServerTime();
      },
    }).done(function (n) {
      return n;
    });
  }),
  (Podanie.prototype.handleSubmit = function () {
    main.ShowLoader();
    var n = this;
    return (
      (main.TypObjektuPreFormularBeforeSave = n.JsonData.TypObjektuFormular),
      (n.JsonData.TypObjektuFormular = null),
      (main.DefaultData = n.JsonData.DataNaPredvyplnenie),
      $.ajax({
        url: main.PodanieDetailPost,
        type: "POST",
        data: JSON.stringify({ dokument: n.JsonData }),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        beforeSend: function () {
          ActualizeServerTime();
        },
      }).done(function (t) {
        t != null
          ? (t.NastalaChybaPriSpracovani ||
              ((n.JsonData = t),
              (n.JsonData.Nezmeneny = !0),
              (n.JsonData.DataNaPredvyplnenie = main.DefaultData),
              main.podanieViewModel.IDElektronickyDokument(
                t.IDElektronickyDokument
              ),
              main.podanieViewModel.PrilohaList(t.Prilohy),
              n.SetStavElektronickehoDokumentu(t.StavElektronickehoDokumentu)),
            main.ShowMessage(t.OdpovedServera, main.HideLoader))
          : main.ShowMessage(
              main.ScriptsResourceObj.deleteConcept,
              main.HideLoader
            );
      })
    );
  }),
  (Podanie.prototype.handleSubmitEZ = function () {
    var n = this;
    return (
      main.ShowLoader(),
      (main.TypObjektuPreFormularBeforeSave = n.JsonData.TypObjektuFormular),
      (n.JsonData.TypObjektuFormular = null),
      (main.DefaultData = n.JsonData.DataNaPredvyplnenie),
      $.ajax({
        url: main.PodpisatEZ,
        type: "POST",
        data: JSON.stringify({ dokument: n.JsonData }),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        beforeSend: function () {
          ActualizeServerTime();
        },
      }).done(function (t) {
        t != null
          ? (t.NastalaChybaPriSpracovani ||
              ((n.JsonData = t),
              (n.JsonData.Nezmeneny = !0),
              (n.JsonData.DataNaPredvyplnenie = main.DefaultData),
              main.podanieViewModel.IDElektronickyDokument(
                t.IDElektronickyDokument
              ),
              main.podanieViewModel.PodpisList(t.PodpisyJson),
              main.podanieViewModel.PrilohaList(t.Prilohy),
              n.SetStavElektronickehoDokumentu(t.StavElektronickehoDokumentu),
              main.frame.Readonly(!0)),
            main.ShowMessage(t.OdpovedServera, main.HideLoader))
          : ((n.JsonData.TypObjektuFormular =
              main.TypObjektuPreFormularBeforeSave),
            main.ShowMessage(
              main.ScriptsResourceObj.ezSignError,
              main.HideLoader
            ));
      })
    );
  }),
  (Podanie.prototype.setData = function (n, t, i) {
    n && ((this.JsonData.Nezmeneny = !1), (this.JsonData.DataDokumentuXml = n)),
      t ? this.handleSubmit() : i && this.handleSubmitEZ();
  }),
  (Podanie.prototype.load = function (n, t) {
    (this.JsonData = n),
      (main.EKR2 = n.EKR2),
      this.JsonData.IDElektronickyDokument ||
        this.SetStavElektronickehoDokumentu("R"),
      this.JsonData.OdpovedServera
        ? main.ShowMessage(this.JsonData.OdpovedServera, main.HideLoader)
        : this.JsonData.ElektronickyFormularUrl == null ||
          this.JsonData.ElektronickyFormularUrl == undefined
        ? (window.document.location =
            main.errorURL + "?message=" + main.ScriptsResourceObj.findFormError)
        : ((main.FormularDomain = n.ElektronickyFormularUrl.substring(
            0,
            n.ElektronickyFormularUrl.indexOf("/", 10)
          )),
          console.log("FormularDomain set"),
          t.init(n.ElektronickyFormularUrl));
  }),
  (Podanie.prototype.initializeModel = function () {
    try {
      (main.podanieViewModel = new PodanieNavigationViewModel(this.JsonData)),
        ko.applyBindings(main.podanieViewModel),
        main.podanieViewModel.PodpisList().length > 0 &&
          $(".accordion2 div#Podpisy").prev().click();
    } catch (n) {
      main.ShowMessage(n.message);
    }
  }),
  (Podanie.prototype.save2PFS = function (n) {
    if (
      ((main.SubmitType = n.target.id),
      main.SubmitType == "btnPodpisEZ" || main.SubmitType == "btnPodatOSS")
    ) {
      if (
        main.LastEZClick &&
        (+new Date() - main.LastEZClick.getTime()) / 1e3 < 1
      )
        return;
      main.LastEZClick = new Date();
    }
    main.ShowFormular(),
      main.podanieViewModel.aktualizujPrilohyPodpisy(),
      main.frame.Save2PFS();
  }),
  (Podanie.prototype.deleteFromPFS = function () {
    main.ShowFormular(),
      (this.JsonData.DataDokumentu = null),
      (this.JsonData.DataDokumentuXml = null),
      (this.JsonData.Nezmeneny = !1),
      this.handleSubmit();
  }),
  (Podanie.prototype.Send2PFS = function () {
    var i;
    main.ShowFormular();
    var r = main.podanieViewModel.SelectedTypObj()[0].TypPodaniaNazov,
      u = main.podanieViewModel.SelectedTypObj()[0].TypPodaniaKod,
      n = this,
      t = null;
    (t = getAliasValue(this.JsonData.DataNaPredvyplnenie, "dicrc")
      ? getAliasValue(this.JsonData.DataNaPredvyplnenie, "dicrc") +
        " – " +
        getAliasValue(this.JsonData.DataNaPredvyplnenie, "obchodneMeno")
      : getAliasValue(this.JsonData.DataNaPredvyplnenie, "obchodneMeno")),
      (i = n.JsonData.JeFiktivnySubjekt
        ? [403, 404].indexOf(u) >= 0
          ? main.ScriptsResourceObj.sendingRequest
          : main.ScriptsResourceObj.sending1 + " " + r
        : main.ScriptsResourceObj.sendingSubjekt + " " + t),
      main.ShowConfirm(
        "#myConfirmModal",
        i,
        function () {
          (n.JsonData.StavElektronickehoDokumentu = "P"),
            main.podanieViewModel.StavElektronickehoDokumentu("P"),
            main.podanieViewModel.aktualizujPrilohyPodpisy(),
            n.handleSubmit();
        },
        function () {
          main.ShowDialog(
            "#myQuestionModal",
            main.ScriptsResourceObj.sendCancelQuestion,
            undefined,
            main.ScriptsResourceObj.sendCancelTitle,
            !1,
            function () {
              $("#myConfirmModal").slideDown(350, function () {
                $("#mask").show();
              });
            }
          );
        }
      );
  }),
  (Podanie.prototype.SetStavElektronickehoDokumentu = function (n) {
    (this.JsonData.StavElektronickehoDokumentu = n),
      main.podanieViewModel &&
        main.podanieViewModel.StavElektronickehoDokumentu(n);
  }),
  (Podanie.prototype.UpdateTypPodania = function (n) {
    n &&
      (main.podanieViewModel.PodtypFormulara(n),
      (main.podanie.JsonData.PodtypFormulara =
        main.podanieViewModel.PodtypFormulara()),
      main.podanieViewModel.updatePrilohaListOnPodTypChange());
  }),
  (Podanie.prototype.Sign = function (n) {
    if (this.JsonData.DataDokumentuXml == null) {
      main.ShowMessage(main.ScriptsResourceObj.inputXmlMissing);
      return;
    }
    (main.podanieViewModel.SignObject = n),
      main.EKR2
        ? ditec.dSigXadesBpJs._ready
          ? this.deployCallback()
          : common.deploy(
              ditec.dSigXadesBpJs,
              "D.Signer/XadES BP .NET 4.0 a vyššie",
              this.deployCallback
            )
        : ditec.dSigXadesJs._ready
        ? this.deployCallback()
        : common.deploy(
            ditec.dSigXadesJs,
            "D.Signer/XadES .NET 4.0 a vyššie",
            this.deployCallback
          );
  }),
  (Podanie.prototype.deployCallback = function () {
    main.EKR2
      ? (console.log("deployCallbackAsic"),
        ditec.dSigXadesBpJs.initialize(main.podanie.initializedCallback))
      : (console.log("deployCallback"),
        ditec.dSigXadesJs.initialize(main.podanie.initializedCallback));
  }),
  (Podanie.prototype.initializedCallback = new common.Callback(function () {
    var i = "Object" + main.podanieViewModel.SelectedTypObj()[0].TypObjektuID,
      r = main.podanieViewModel.SelectedTypObj()[0].TypObjektuNazov,
      l = main.podanieViewModel.SelectedTypObj()[0].PodpisInfo.NamespaceUri
        ? main.podanieViewModel.SelectedTypObj()[0].PodpisInfo.NamespaceUri
        : "",
      n = main.podanieViewModel.SelectedTypObj()[0].PodpisInfo.XdcNamespaceUri
        ? main.podanieViewModel.SelectedTypObj()[0].PodpisInfo.XdcNamespaceUri
        : "",
      u = main.podanieViewModel.SelectedTypObj()[0].PodpisInfo.xdcVerzia
        ? main.podanieViewModel.SelectedTypObj()[0].PodpisInfo.xdcVerzia
        : "",
      f = main.podanieViewModel.SelectedTypObj()[0].PodpisInfo.XsdUri
        ? main.podanieViewModel.SelectedTypObj()[0].PodpisInfo.XsdUri
        : "http://wwww.google.sk",
      e = main.podanieViewModel.SelectedTypObj()[0].PodpisInfo.XsltUri
        ? main.podanieViewModel.SelectedTypObj()[0].PodpisInfo.XsltUri
        : "http://wwww.google.sk",
      a = "10",
      v = "TXT",
      o = main.podanieViewModel.SignObject.xmldata,
      s = main.podanieViewModel.SignObject.xsddata,
      h = main.podanieViewModel.SignObject.xsltdata,
      c,
      t;
    main.EKR2
      ? ((c = n),
        (t = n.split("/")),
        t.length > 1 && u != t[t.length - 1] && (c = n + "/" + u),
        ditec.dSigXadesBpJs.addXmlObject(
          i,
          r,
          c,
          o,
          n,
          u,
          s,
          f,
          h,
          e,
          "TXT",
          "sk",
          "",
          !0,
          main.xdcNamespaceURI,
          main.podanie.addObjectCallback
        ))
      : (console.log("initializedCallback"),
        common.showWaitingDialog(!0),
        a == "20"
          ? ditec.dSigXadesJs.addXmlObject2(
              i,
              r,
              o,
              s,
              l,
              f,
              h,
              e,
              v,
              main.podanie.addObjectCallback
            )
          : ditec.dSigXadesJs.addXmlObject(
              i,
              r,
              o,
              s,
              l,
              f,
              h,
              e,
              main.podanie.addObjectCallback
            ));
  })),
  (Podanie.prototype.addObjectCallback = new common.Callback(function () {
    main.EKR2
      ? console.log("addObjectCallbackAsic")
      : console.log("addObjectCallback");
    var t = function (n, t) {
        for (n = String(n), t = t || 2; n.length < t; ) n = "0" + n;
        return n;
      },
      s = "10",
      n = new Date(),
      i =
        "SignatureId" +
        (n.getYear() + 1900) +
        t(n.getMonth() + 1) +
        t(n.getDate()) +
        t(n.getHours()) +
        t(n.getMinutes()) +
        t(n.getSeconds()),
      r = "http://www.w3.org/2001/04/xmlenc#sha256",
      u = main.signaturePolicy,
      f = "dataEnvelopeIdPFS",
      e = "dataEnvelopeURIPFS",
      o = "dataEnvelopeDescrPFS";
    if (
      (main.Jazyk.toLowerCase() == "en" && ditec.dSigXadesJs.setLanguage("EN"),
      main.EKR2)
    )
      main.Jazyk.toLowerCase() == "en" && ditec.dSigXadesBpJs.setLanguage("EN"),
        ditec.dSigXadesBpJs.sign(
          i,
          ditec.dSigXadesBpJs.SHA256,
          "",
          main.podanie.signCalback
        );
    else {
      main.Jazyk.toLowerCase() == "en" && ditec.dSigXadesJs.setLanguage("EN");
      switch (s) {
        case "10":
          ditec.dSigXadesJs.sign(i, r, u, main.podanie.signCalback);
          break;
        case "11":
          ditec.dSigXadesJs.sign11(i, r, u, f, e, o, main.podanie.signCalback);
          break;
        case "20":
          ditec.dSigXadesJs.sign20(i, r, u, f, e, o, main.podanie.signCalback);
      }
    }
  })),
  (Podanie.prototype.signCalback = new common.Callback(function () {
    main.EKR2
      ? (console.log("signCallbackAsic"),
        common.showWaitingDialog(!1),
        ditec.dSigXadesBpJs.getSignerIdentification(
          new common.Callback(function (n) {
            var t = getUserNameFromSignature(n);
            ditec.dSigXadesBpJs.getSignatureWithASiCEnvelopeBase64(
              new common.Callback(function (n) {
                common.showWaitingDialog(!1);
                var i = {
                  IDElektronickyDokument: null,
                  CasovaPeciatka: null,
                  IDElektronickyPodpis: null,
                  NazovPouzivatela: t,
                  Nezmeneny: null,
                  Vykonany: null,
                  XAdESEpesXml: null,
                  XADEST: null,
                  AsicB64String: n,
                };
                main.podanieViewModel.addPodpis(i);
              })
            );
          })
        ))
      : (console.log("signCallback"),
        common.showWaitingDialog(!1),
        ditec.dSigXadesJs.getSignedXmlWithEnvelope(
          new common.Callback(function (n) {
            var t, i, r, u;
            if (
              (common.showWaitingDialog(!1),
              (t =
                n.indexOf("<xzepds:DataSignatures ") +
                "<xzepds:DataSignatures ".length),
              (i = n.indexOf("<ds:Signature", t)),
              i - t < 150)
            ) {
              main.ShowMessage(main.ScriptsResourceObj.signingError);
              return;
            }
            if (
              ((r = new RegExp("<ds:X509SubjectName>[^<]+(PNO|PAS|IDC)")),
              r.test(n) ||
                ((n.indexOf(
                  "<ds:X509IssuerName>C=SK,ST=Nova ulica c.13,L=Banska Bystrica,O=DR SR,OU=EP eTax,CN=Elektronicka znacka podatelne portalu eTax DR SR</ds:X509IssuerName>"
                ) > 0 ||
                  n.indexOf(
                    "<ds:X509SubjectName>C=SK,ST=Nova ulica c.13,L=Banska Bystrica,O=DR SR,OU=EP eTax,CN=Elektronicka znacka podatelne portalu eTax DR SR</ds:X509SubjectName>"
                  ) > 0 ||
                  n.indexOf(
                    "<ds:X509IssuerName>C=SK,L=Banska Bystrica,O=Financne riaditelstvo SR,OU=EKR PFS,CN=Elektronicka znacka PFS</ds:X509IssuerName"
                  ) > 0) &&
                  main.podanieViewModel.OpravneniePodpisovat))
            )
              (podpis = n),
                (u = {
                  IDElektronickyDokument: null,
                  CasovaPeciatka: null,
                  IDElektronickyPodpis: null,
                  NazovPouzivatela: getUserNameFromSignature(podpis),
                  Nezmeneny: null,
                  Vykonany: null,
                  XAdESEpesXml: podpis,
                  XADEST: null,
                  AsicB64String: null,
                }),
                main.podanieViewModel.addPodpis(u);
            else {
              if (
                (n.indexOf(
                  "<ds:X509IssuerName>C=SK,ST=Nova ulica c.13,L=Banska Bystrica,O=DR SR,OU=EP eTax,CN=Elektronicka znacka podatelne portalu eTax DR SR</ds:X509IssuerName>"
                ) > 0 ||
                  n.indexOf(
                    "<ds:X509SubjectName>C=SK,ST=Nova ulica c.13,L=Banska Bystrica,O=DR SR,OU=EP eTax,CN=Elektronicka znacka podatelne portalu eTax DR SR</ds:X509SubjectName>"
                  ) > 0 ||
                  n.indexOf(
                    "<ds:X509IssuerName>C=SK,L=Banska Bystrica,O=Financne riaditelstvo SR,OU=EKR PFS,CN=Elektronicka znacka PFS</ds:X509IssuerName"
                  ) > 0) &&
                !main.podanieViewModel.OpravneniePodpisovat
              ) {
                main.ShowMessage(main.ScriptsResourceObj.signingEZError);
                return;
              }
              main.ShowMessage(main.ScriptsResourceObj.signingWrongCert);
              return;
            }
          })
        ));
  })),
  (Frame = function (n) {
    return (this.element = $(n)), this;
  }),
  (Frame.prototype.init = function (n) {
    this.element.attr("src", n);
  }),
  (Frame.prototype.loadFinalXML = function (n) {
    n && this.LoadFromFile(n);
  }),
  (Frame.prototype.loadDefaultXML = function (n) {
    this.LoadDefault(n);
  }),
  (Frame.prototype.LoadDefault = function (n) {
    main.PostMessage(this.element[0].contentWindow, "LoadDefault", n);
  }),
  (Frame.prototype.LoadFromFile = function (n) {
    main.PostMessage(this.element[0].contentWindow, "LoadFromFile", n);
  }),
  (Frame.prototype.Save2PFS = function () {
    main.PostMessage(this.element[0].contentWindow, "Save2PFS");
  }),
  (Frame.prototype.Save2File = function () {
    main.PostMessage(this.element[0].contentWindow, "Save2File");
  }),
  (Frame.prototype.Validate = function () {
    main.PostMessage(this.element[0].contentWindow, "validate");
  }),
  (Frame.prototype.Print = function () {
    main.PostMessage(this.element[0].contentWindow, "print");
  }),
  (Frame.prototype.Readonly = function (n) {
    main.PostMessage(this.element[0].contentWindow, "SetReadonly", n);
  }),
  (Frame.prototype.Sign = function () {
    if (
      !main.LastZEPClick ||
      !((+new Date() - main.LastZEPClick.getTime()) / 1e3 < 3)
    ) {
      (main.LastZEPClick = new Date()), main.ShowFormular();
      var n = {
        xsdurl: main.podanieViewModel.SelectedTypObj()[0].PodpisInfo.XsdDataUrl,
        xslturl:
          main.podanieViewModel.SelectedTypObj()[0].PodpisInfo.XsltDataUrl,
      };
      main.PostMessage(
        this.element[0].contentWindow,
        "Sign",
        JSON.stringify(n)
      );
    }
  }),
  (Frame.prototype.Clear = function (n) {
    main.PostMessage(this.element[0].contentWindow, "Clear", n);
  }),
  (Frame.prototype.Help = function () {
    main.PostMessage(this.element[0].contentWindow, "Help");
  }),
  (Frame.prototype.Confirmation = function () {
    main.PostMessage(this.element[0].contentWindow, "Confirmation");
  }),
  (Frame.prototype.Type = function () {
    main.PostMessage(this.element[0].contentWindow, "Type");
  }),
  (function () {
    var t = function (n) {
        n.target.attributes["data-idpriloha"] &&
        n.target.attributes["data-idpriloha"].value
          ? window.open(
              main.DownloadAttachment +
                "?IDPrilohaElektronickehoDokumentu=" +
                n.target.attributes["data-idpriloha"].value
            )
          : n.target.attributes["data-idpodanieekr"] &&
            n.target.attributes["data-idpodanieekr"].value &&
            window.open(
              main.DownloadAttachment +
                "?IDPodanieEKR=" +
                n.target.attributes["data-idpodanieekr"].value +
                "&nazovPrilohy=" +
                n.target.attributes["data-namepriloha"].value +
                "&IDSubjekt=" +
                main.IDSubjekt +
                "&IDSubjektZastupca=" +
                main.IDSubjektZastupca +
                "&EKR2=" +
                main.EKR2 +
                "&Register=" +
                main.Register
            );
      },
      i = function (n) {
        var i, r, t, u;
        if (
          n.target.attributes["data-namepriloha"].value &&
          typeof window.Blob != "undefined" &&
          ((i = main.podanieViewModel.GetPrilohaLocalOnly(
            n.target.attributes["data-namepriloha"].value,
            n.target.attributes["data-typdokumentu"].value,
            n.target.attributes["data-typobjektu"].value
          )),
          i)
        ) {
          (r = base64DecToArr(i.DataPrilohy)), (t = "application/pdf");
          switch (i.Format.toLowerCase()) {
            case "pdf":
              t = "application/pdf";
              break;
            case "csv":
              t = "text/csv";
              break;
            case "doc":
            case "docx":
              t = "application/msword";
              break;
            case "gif":
              t = "image/gif";
              break;
            case "gz":
              t = "application/x-gzip";
              break;
            case "jpg":
              t = "image/jpeg";
              break;
            case "ods":
              t = "application/vnd.oasis.opendocument.spreadsheet";
              break;
            case "odt":
              t = "application/vnd.oasis.opendocument.text ";
              break;
            case "png":
              t = "image/png";
              break;
            case "rtf":
              t = "application/rtf";
              break;
            case "tar":
              t = "application/x-tar";
              break;
            case "tgz":
              t = "application/x-compressed";
              break;
            case "tif":
              t = "image/tiff";
              break;
            case "txt":
              t = "text/plain";
              break;
            case "xls":
            case "xlsx":
              t = "application/vnd.ms-excel";
              break;
            case "zip":
              t = "application/zip";
          }
          (u = new Blob([r], { type: t })), $.saveAs(u, i.Nazov);
        }
      },
      r = function (n) {
        main.podanieViewModel.PodpisList().length === 0 &&
          (main.podanieViewModel.StavElektronickehoDokumentu() == "R" ||
            main.podanieViewModel.StavElektronickehoDokumentu() == "C") &&
          main.ShowDialog(
            "#myQuestionModal",
            main.ScriptsResourceObj.deleteAttachmentQuestion +
              " " +
              n.target.attributes.name.value +
              "?",
            function () {
              if (
                (main.podanieViewModel.removePriloha(
                  n.target.attributes.id,
                  n.target.attributes.name,
                  n.target.attributes["data-typdokumentu"],
                  n.target.attributes["data-typobjektu"]
                ),
                n.target.attributes.id)
              ) {
                var t = $('input[id="' + n.target.attributes.id.value + '"]');
                t.removeAttr("checked"),
                  t.removeAttr("disabled"),
                  t.parent().parent().removeClass("trdisabled"),
                  t.parent().parent().removeAttr("title");
              }
            }
          );
      },
      n = function () {
        main.ClearFileName(),
          $("#priloha").hasClass("notactive") &&
            $("#priloha").children().first().click(),
          main.frame.Type(),
          GoToStep(1);
      },
      u = function () {
        GoToStep(3);
      },
      o = function () {
        GoToStep(2);
      },
      f = function (n) {
        var t = $("#cmbTypyPriloh").find(":selected"),
          i;
        return (
          (main.Format = t.attr("data-format")),
          (main.TypDokumentuID = t.attr("data-typdokumentuid")),
          (main.TypObjektuID = t.attr("data-typobjektuid")),
          new XMLHttpRequest().upload
            ? (main.fileUpload.load(), !1)
            : (n.preventDefault(),
              (i = $("#fileUpload").asyncUpload()),
              i.submit(),
              !1)
        );
      },
      e = function (n) {
        var t = 0;
        $(n.target.parentNode).hasClass("mainButtons")
          ? GoToStep(0)
          : $(n.target.parentNode).hasClass("existingfiles")
          ? GoToStep(1)
          : $(n.target.parentNode).hasClass("newfiles") && GoToStep(1);
      };
    $(document).on("click", ".managementPriloh", n);
    $(document).on("click", ".upozornenieNaPovinnePrilohy", n);
    $(document).on("click", ".PrilohaNew", u);
    $(document).on("click", ".loadFile", f);
    $(document).on("click", ".navrat", e);
    $(document).on("click", "#formular", GoToStep);
    $(document).on("click", ".prilohaDelete", r);
    $(document).on("click", ".prilohaFetch", t);
    $(document).on("click", ".prilohaFetchLocalOnly", i);
    $(document).on("click", "#priloha a:first", LoadFormularTyp);
  })(),
  (FileUpload = function (n) {
    if (((this.element = $(n)), window.File && window.FileReader))
      $(document).on("change", n, this.setValue);
    return this;
  }),
  (FileUpload.prototype.setValue = function (n) {
    var t = "",
      i,
      r,
      u;
    if (
      (n.target.files != undefined
        ? ((t = n.target.files[0].name),
          (i = t.split(".")),
          (r = i[i.length - 1]),
          main.podanieViewModel.Format(r),
          (main.Format = r),
          $("#fileUploadFake").val(t))
        : ((t = $(n.target).val()),
          (i = t.split(".")),
          (r = i[i.length - 1]),
          main.podanieViewModel.Format(r),
          (main.Format = r),
          $("#fileUploadFake").val(t)),
      !main.podanieViewModel.ExistujeFiltrovanyTypPrilohy())
    ) {
      main.ShowMessage(
        main.ScriptsResourceObj.unsupportedFileType +
          main.podanieViewModel.ZoznamPovolenychFormatov()
      ),
        main.ClearFileName(),
        main.podanieViewModel.Format(""),
        (main.Format = "");
      return;
    }
    if (((u = n.target.files[0].size), u == 0)) {
      main.ShowMessage(main.ScriptsResourceObj.nullSizeAttachment),
        main.ClearFileName(),
        main.podanieViewModel.Format(""),
        (main.Format = "");
      return;
    }
  }),
  (FileUpload.prototype.load = function () {
    var n, t;
    if (
      window.FileReader &&
      $("#fileUploadFake").val() &&
      this.element[0].files !== undefined &&
      this.element[0].files.length != 0
    ) {
      if (
        ((fileName = this.element[0].files[0].name),
        main.podanieViewModel.containsFile(
          main.TypDokumentuID,
          main.TypObjektuID,
          fileName,
          null
        ))
      ) {
        main.ShowMessage(main.ScriptsResourceObj.sameFileName);
        return;
      }
      if (((n = this.element[0].files[0].size), n > 1536e4)) {
        main.ShowMessage(main.ScriptsResourceObj.attachmentSizeLimit);
        return;
      }
      if (n + main.podanieViewModel.SucetVelkostiPriloh() > 1536e4) {
        main.ShowMessage(main.ScriptsResourceObj.attachmentsSizeLimit);
        return;
      }
      (t = new FileReader()),
        (t.onload = function (t) {
          var i = t.target.result.substring(t.target.result.indexOf(",") + 1),
            r = {
              IDPrilohaElektronickehoDokumentu: null,
              TypObjektuID: main.TypObjektuID,
              TypDokumentuID: main.TypDokumentuID,
              Nazov: fileName,
              DataPrilohy: i,
              Format: main.Format,
              Velkost: n,
            };
          main.podanieViewModel.addPriloha(r), main.ClearFileName();
        }),
        t.readAsDataURL(this.element[0].files[0]);
    }
  }),
  (function (n) {
    "use strict";
    var i = function () {
      if (!(this instanceof i)) return new i();
      (this.input = null),
        (this.options = {
          logger: null,
          selected: null,
          complete: null,
          name: null,
          url: null,
          data: null,
          autoUpload: !0,
        });
      var u = 1,
        r = null,
        t = null;
      (this.log = function (n) {
        window.console && window.console.debug && window.console.debug(n),
          this.options.logger && this.options.logger(n);
      }),
        (this.cleanup = function () {
          this.input[0].id == "fileUpload" && n("#fileUploadFake").val(""),
            r && r.remove(),
            t && t.remove(),
            this.log("Cleanup.");
        }),
        (this.onComplete = function () {
          var t, i;
          this.options.cancelButton && this.options.cancelButton.hide(),
            this.log("Completed."),
            (t = r.contents().text()),
            this.log("Response: " + t),
            (i = n.parseJSON(t)),
            this.options.complete && this.options.complete(i),
            this.cleanup();
        }),
        (this.submit = function () {
          var e;
          if (this.input[0].id != "fileUpload" || n("#fileUploadFake").val()) {
            var i = this.input,
              f = this.options.data,
              s = this.options.name || i.attr("name"),
              o = "iframe-for-" + s + "-" + u++;
            if (
              ((r = n(
                '<iframe name="' +
                  o +
                  '" id="' +
                  o +
                  '" style="display: none;"/>'
              )),
              (t = n(
                '<form enctype="multipart/form-data" method="POST" action="' +
                  this.options.url +
                  '" target="' +
                  o +
                  '" style="display: none;" />'
              )),
              i.clone().val("").asyncUpload(this.options).insertAfter(i),
              t.append(i),
              r.appendTo(document.body),
              t.appendTo(document.body),
              f)
            )
              for (e in f)
                f.hasOwnProperty(e) &&
                  n(
                    '<input type="hidden" name="' +
                      e +
                      '" value="' +
                      f[e] +
                      '" />'
                  ).appendTo(t);
            r.one("load.async-upload", n.proxy(this.onComplete, this));
            t[0].submit(), this.log("Submitted.");
          }
        }),
        (this.onChange = function (t) {
          var u = n(t.target)[0],
            i,
            f,
            e;
          if (u.files) i = u.files[0];
          else {
            var r = n(u).val(),
              o = r.lastIndexOf("\\"),
              s = o != -1 ? r.substr(o + 1) : r;
            if (
              this.input[0].id == "fileUpload" &&
              ((f = r.split(".")),
              (e = f[f.length - 1]),
              main.podanieViewModel.Format(e),
              (main.Format = e),
              n("#fileUploadFake").val(r),
              !main.podanieViewModel.ExistujeFiltrovanyTypPrilohy())
            ) {
              main.ShowMessage(
                main.ScriptsResourceObj.unsupportedFileType +
                  main.podanieViewModel.ZoznamPovolenychFormatov()
              ),
                main.ClearFileName(),
                main.podanieViewModel.Format(""),
                (main.Format = "");
              return;
            }
            i = { name: s, size: null };
          }
          return (this.log("File: " + i.name),
          this.log("Size: " + i.size),
          this.options.selected && !this.options.selected(i))
            ? (this.log("Aborted."), t.preventDefault(), !1)
            : (this.options.autoUpload && this.submit(), !0);
        }),
        (this.init = function (t, i) {
          if (
            ((this.input = n(t)),
            (this.options = n.extend(!0, this.options, i)),
            !this.options.url)
          )
            throw "Invalid URL.";
          this.input.bind("change.async-upload", n.proxy(this.onChange, this));
        });
    };
    n.fn.asyncUpload = function (t) {
      return t
        ? n.each(this, function (r, u) {
            var f = n(u),
              e = new i();
            e.init(f, t), f.data("async-upload", e);
          })
        : n(this).data("async-upload");
    };
  })(jQuery),
  (function (n) {
    n.saveAs =
      n.saveAs ||
      (typeof navigator != "undefined" &&
        navigator.msSaveOrOpenBlob &&
        navigator.msSaveOrOpenBlob.bind(navigator)) ||
      (function (n) {
        "use strict";
        var i = n.document,
          y = function () {
            return n.URL || n.webkitURL || n;
          },
          v = n.URL || n.webkitURL || n,
          r =
            i.createElementNS &&
            i.createElementNS("http://www.w3.org/1999/xhtml", "a"),
          a = r && !n.externalHost && "download" in r,
          b = function (t) {
            var r = i.createEvent("MouseEvents");
            r.initMouseEvent(
              "click",
              !0,
              !1,
              n,
              0,
              0,
              0,
              0,
              0,
              !1,
              !1,
              !1,
              !1,
              0,
              null
            ),
              t.dispatchEvent(r);
          },
          e = n.webkitRequestFileSystem,
          l = n.requestFileSystem || e || n.mozRequestFileSystem,
          p = function (t) {
            (n.setImmediate || n.setTimeout)(function () {
              throw t;
            }, 0);
          },
          o = "application/octet-stream",
          c = 0,
          u = [],
          h = function () {
            for (var t = u.length, n; t--; )
              (n = u[t]),
                typeof n == "string" ? v.revokeObjectURL(n) : n.remove();
            u.length = 0;
          },
          f = function (n, t, i) {
            var r, u;
            for (t = [].concat(t), r = t.length; r--; )
              if (((u = n["on" + t[r]]), typeof u == "function"))
                try {
                  u.call(n, i || n);
                } catch (f) {
                  p(f);
                }
          },
          s = function (t, s) {
            var h = this,
              k = t.type,
              g = !1,
              p,
              b,
              nt = function () {
                var n = y().createObjectURL(t);
                return u.push(n), n;
              },
              tt = function () {
                f(h, "writestart progress write writeend".split(" "));
              },
              v = function () {
                (g || !p) && (p = nt(t)),
                  b ? (b.location.href = p) : window.open(p, "_blank"),
                  (h.readyState = h.DONE),
                  tt();
              },
              w = function (n) {
                return function () {
                  if (h.readyState !== h.DONE) return n.apply(this, arguments);
                };
              },
              it = { create: !0, exclusive: !1 },
              rt,
              d;
            if (((h.readyState = h.INIT), s || (s = "download"), a)) {
              (p = nt(t)),
                (i = n.document),
                (r = i.createElementNS("http://www.w3.org/1999/xhtml", "a")),
                (r.href = p),
                (r.download = s),
                (d = i.createEvent("MouseEvents")),
                d.initMouseEvent(
                  "click",
                  !0,
                  !1,
                  n,
                  0,
                  0,
                  0,
                  0,
                  0,
                  !1,
                  !1,
                  !1,
                  !1,
                  0,
                  null
                ),
                r.dispatchEvent(d),
                (h.readyState = h.DONE),
                tt();
              return;
            }
            if (
              (n.chrome &&
                k &&
                k !== o &&
                ((rt = t.slice || t.webkitSlice),
                (t = rt.call(t, 0, t.size, o)),
                (g = !0)),
              e && s !== "download" && (s += ".download"),
              (k === o || e) && (b = n),
              !l)
            ) {
              v();
              return;
            }
            (c += t.size),
              l(
                n.TEMPORARY,
                c,
                w(function (n) {
                  n.root.getDirectory(
                    "saved",
                    it,
                    w(function (n) {
                      var i = function () {
                        n.getFile(
                          s,
                          it,
                          w(function (n) {
                            n.createWriter(
                              w(function (i) {
                                (i.onwriteend = function (t) {
                                  (b.location.href = n.toURL()),
                                    u.push(n),
                                    (h.readyState = h.DONE),
                                    f(h, "writeend", t);
                                }),
                                  (i.onerror = function () {
                                    var n = i.error;
                                    n.code !== n.ABORT_ERR && v();
                                  }),
                                  "writestart progress write abort"
                                    .split(" ")
                                    .forEach(function (n) {
                                      i["on" + n] = h["on" + n];
                                    }),
                                  i.write(t),
                                  (h.abort = function () {
                                    i.abort(), (h.readyState = h.DONE);
                                  }),
                                  (h.readyState = h.WRITING);
                              }),
                              v
                            );
                          }),
                          v
                        );
                      };
                      n.getFile(
                        s,
                        { create: !1 },
                        w(function (n) {
                          n.remove(), i();
                        }),
                        w(function (n) {
                          n.code === n.NOT_FOUND_ERR ? i() : v();
                        })
                      );
                    }),
                    v
                  );
                }),
                v
              );
          },
          t = s.prototype,
          w = function (n, t) {
            return new s(n, t);
          };
        return (
          (t.abort = function () {
            var n = this;
            (n.readyState = n.DONE), f(n, "abort");
          }),
          (t.readyState = t.INIT = 0),
          (t.WRITING = 1),
          (t.DONE = 2),
          (t.error =
            t.onwritestart =
            t.onprogress =
            t.onwrite =
            t.onabort =
            t.onerror =
            t.onwriteend =
              null),
          n.addEventListener
            ? n.addEventListener("unload", h, !1)
            : n.attachEvent("unload", h),
          w
        );
      })(this.self || this.window || this.content);
  })(jQuery),
  typeof module != "undefined" && (module.exports = saveAs),
  "use strict";
