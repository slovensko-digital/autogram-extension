var DSignerErrorMessages = {
  signerRetCode: {
    OLD_DSIGNER:
      'Nainštalujte si najnovší balík aplikácií pre <a class="link" href="https://www.slovensko.sk/sk/na-stiahnutie" target="_blank">kvalifikovaný elektronický podpis (KEP) </a>.',
    0: "Volanie funkcie skončilo úspešne.",
    1: "Používateľ stlačil v dialógu aplikácie tlačidlo Storno.",
    "-1": "Neznámy algoritmus digitálneho odtlačku alebo neznáma/neplatná podpisová politika.",
    "-2": "Počet súborov na podpis je 0.",
    "-3": "Parameter SignatureId je prázdny.",
    "-4": "SignatureId nevyhovuje regulárnemu výrazu pre Id.",
    "-5": "Nejednoznačnosť vstupných XML Id (v rámci signatureId a objectId kolekcie podpisovaných dátových objektov).",
    "-6": "DataEnvelopeId nevyhovuje regulárnemu výrazu pre Id.",
    "-7": "DataEnvelopeUri nezodpovedá validnému URI.",
    "-8": "Nejednoznačnosť DataEnvelopeId alebo SignatureId.",
    "-10": {
      default: "V podpisovači sa vyskytla chyba.",
      messages: [
        {
          text: "Invalid pdf version",
          message:
            "Pokúšate sa podpísať už podpísaný PDF súbor, ktorého verziu náš podpisovací komponent zatiaľ nepodporuje. V prípade, že potrebujete tento súbor opätovne podpísať, odporúčame pre podpísanie použiť aplikáciu od iného výrobcu.",
        },
      ],
    },
  },

  pluginPdfRetCode: {
    0: "Volanie funkcie skončilo úspešne.",
    "-1": "Nepodporovaná úroveň súladu voči PDF/A.",
    "-2": "Inicializácia knižnice PDFNet zlyhala.",
    "-3": "Nesprávne heslo na prístup k obsahu PDF dokumentu.",
    "-4": "Chyba pri validácii obsahu PDF dokumentu.",
    "-5": "Neplatná verzia PDF dokumentu.",
    "-10": "V podpisovači sa vyskytla chyba.",
  },

  getErrorMessage: function (errorCodes, code, message) {
    var result = errorCodes[code];

    if (typeof result == "string") {
      return result;
    } else if (typeof result == "object") {
      var resultDetailed = result.default;

      result.messages.forEach(function (errorMessage) {
        if (message.includes(errorMessage.text)) {
          resultDetailed = errorMessage.message;
          return;
        }
      });

      return resultDetailed;
    } else {
      return message;
    }
  },
};

function DSignerError(message, code) {
  this.message = message || DSignerErrorMessages.signerRetCode[code];
}

DSignerError.prototype = new Error();
DSignerError.prototype.constructor = DSignerError;

//defaultny callback, cez konstruktor je mozne pridat vlastnu funkciu pre onComplete
var Callback = function (onSuccess, onError, errorCodes) {
  this.onSuccess = onSuccess;
  this.onError = onError;
  this.errorCodes = errorCodes;

  if (this.onSuccess == null) {
    this.onSuccess = function (value) {
      alert("onSuccess NotImplemented.");
    };
  }

  if (this.onError == null) {
    this.onError = function (e) {
      if (e.name === "DitecError") {
        if (e.code === 1) {
          return;
        }

        MessageBox.displayError(
          DSignerErrorMessages.getErrorMessage(
            this.errorCodes || DSignerErrorMessages.signerRetCode,
            e.code,
            e.message
          )
        );
      } else throw e;
    };
  }
};

function DSigner() {
  // pdfReqLevel 0=1a, 1=1b, 2=none
  var pdfReqLevel2Check = 0;
  var pdfReqLevel2Convert = 0; // konvertovat sa moze do 1b
  var signaturePolicy = "urn:oid:1.3.158.36061701.1.2.2"; // iba pre xades_zep

  this.sign = function (signRequest, resultCallback) {
    try {
      var self = this;

      if (signRequest.SignatureType == "XAdES") {
        if (!this.initializedXAdES) {
          eDesk.core.modalShow("signerInitializingModal");
          this.initXAdES(function () {
            eDesk.core.modalClose("signerInitializingModal");
            self.signFilesXAdES(signRequest, resultCallback);
          });
        } else self.signFilesXAdES(signRequest, resultCallback);
      } else {
        if (!this.initializedASiC) {
          eDesk.core.modalShow("signerInitializingModal");
          this.initASiC(function () {
            eDesk.core.modalClose("signerInitializingModal");
            self.signFilesASiC(signRequest, resultCallback);
          });
        } else self.signFilesASiC(signRequest, resultCallback);
      }
    } catch (e) {
      if (
        e.message == undefined &&
        DSignerErrorMessages.signerRetCode[e] != undefined
      ) {
        throw new DSignerError(undefined, e);
      } else throw new DSignerError(e);
    }
  };

  this.checkPDFACompliance = function (signRequest, resultCallback) {
    try {
      var self = this;
      var invalidDocuments = [];

      if (signRequest.SignatureType == "XAdES") {
        if (!this.initializedXAdES) {
          this.initXAdES(function () {
            self.checkPDFAComplianceXAdES(
              self,
              signRequest.Documents,
              0,
              resultCallback,
              invalidDocuments
            );
          });
        } else
          self.checkPDFAComplianceXAdES(
            self,
            signRequest.Documents,
            0,
            resultCallback,
            invalidDocuments
          );
      } else {
        if (!this.initializedASiC) {
          this.initASiC(function () {
            self.checkPDFAComplianceASiC(
              self,
              signRequest.Documents,
              0,
              resultCallback,
              invalidDocuments
            );
          });
        } else
          self.checkPDFAComplianceASiC(
            self,
            signRequest.Documents,
            0,
            resultCallback,
            invalidDocuments
          );
      }
    } catch (e) {
      if (
        e.message == undefined &&
        DSignerErrorMessages.pluginPdfRetCode[e] != undefined
      ) {
        throw new DSignerError(undefined, e);
      } else throw new DSignerError(e);
    }
  };

  this.initializingXAdES = false;

  this.initializedXAdES = false;

  this.initXAdES = function (initializedCallback) {
    if (this.initializingXAdES) {
      throw new DSignerError("Podpisovač sa spúšťa. Počkajte, prosím.");
    }

    if (this.initializedXAdES) {
      initializedCallback();
    }

    if (eDesk.core.detectPlatform().isWindows) {
      if (eDesk.core.detectBrowser().isChrome)
        this.initDBridgeXAdES(
          ["dLauncherDotNet", "dLauncherJava"],
          initializedCallback
        );
      else
        this.initDBridgeXAdES(
          ["dLauncherDotNet", "java", "dLauncherJava"],
          initializedCallback
        );
    } else {
      if (eDesk.core.detectBrowser().isChrome)
        this.initDBridgeXAdES(["dLauncherJava"], initializedCallback);
      else
        this.initDBridgeXAdES(["java", "dLauncherJava"], initializedCallback);
    }
  };

  this.initDBridgeXAdES = function (platforms, initializedCallback) {
    var self = this;

    ditec.dSigXadesJs.deploy(
      { platforms: platforms },
      {
        onSuccess: function (instance) {
          self.initializingXAdES = false;
          self.initializedXAdES = true;
          initializedCallback();
        },

        onError: function (e) {
          throw e;
        },
      }
    );
  };

  this.signFilesXAdES = function (signRequest, resultCallback) {
    var self = this;

    var signCallback = new Callback(function () {
      ditec.dSigXadesJs.setSigningTimeProcessing(
        false,
        true,
        new Callback(function () {
          if (signRequest.XadesZepSignatureVersion === "1.0") {
            ditec.dSigXadesJs.sign(
              signRequest.SignatureId,
              ditec.dSigXadesJs.SHA256,
              signaturePolicy,
              new Callback(function () {
                ditec.dSigXadesJs.getSignedXmlWithEnvelopeBase64(
                  new Callback(resultCallback)
                );
              })
            );
          } else if (signRequest.XadesZepSignatureVersion === "1.1") {
            ditec.dSigXadesJs.sign11(
              signRequest.SignatureId,
              ditec.dSigXadesJs.SHA256,
              signaturePolicy,
              "envelopeID",
              "http://schemas.gov.sk/attachment/envelope",
              "dataEnvelopeDescr",
              new Callback(function () {
                ditec.dSigXadesJs.getSignedXmlWithEnvelopeBase64(
                  new Callback(resultCallback)
                );
              })
            );
          } else {
            ditec.dSigXadesJs.sign20(
              signRequest.SignatureId,
              ditec.dSigXadesJs.SHA256,
              signaturePolicy,
              "envelopeID",
              "http://schemas.gov.sk/attachment/envelope",
              "dataEnvelopeDescr",
              new Callback(function () {
                ditec.dSigXadesJs.getSignedXmlWithEnvelopeBase64(
                  new Callback(resultCallback)
                );
              })
            );
          }
        })
      );
    });

    ditec.dSigXadesJs.initialize(
      new Callback(function () {
        self.addFilesXAdES(self, signRequest.Documents, 0, signCallback);
      })
    );
  };

  this.addFilesXAdES = function (self, documents, index, signCallback) {
    var document = documents[index];
    var nextCallback = undefined;

    if (documents.length == index + 1) nextCallback = signCallback;
    else
      nextCallback = new Callback(function () {
        self.addFilesXAdES(self, documents, index + 1, signCallback);
      });

    if (document.IsXml) self.addFileXmlXAdES(document, nextCallback);
    else self.addFileXAdES(document, nextCallback);
  };

  this.addFileXmlXAdES = function (document, addedFileResult) {
    if (document.XadesZepXMLVerificationDataVersion === "1.0") {
      ditec.dSigXadesJs.addXmlObject(
        document.ObjectId,
        document.Description,
        document.Data,
        document.Xsd,
        document.Uri,
        document.XsdUri,
        document.Xslt,
        document.XsltUri,
        addedFileResult
      );
    } else {
      ditec.dSigXadesJs.addXmlObject2(
        document.ObjectId,
        document.Description,
        document.Data,
        document.Xsd,
        document.Uri,
        document.XsdUri,
        document.Xslt,
        document.XsltUri,
        document.XsltIsHtml == true ? "HTML" : "TXT",
        addedFileResult
      );
    }
  };

  this.addFileXAdES = function (document, addedFileResult) {
    if (document.Description == "PDF") {
      if (document.IsContainerContent) {
        ditec.dSigXadesJs.addPdfObject(
          document.ObjectId,
          document.Description,
          document.Data,
          "",
          document.Uri,
          document.PdfReqLevel,
          false,
          addedFileResult
        );
      } else {
        ditec.dSigXadesJs.checkPDFACompliance(
          document.Data,
          "",
          document.PdfReqLevel,
          new Callback(
            function () {
              ditec.dSigXadesJs.addPdfObject(
                document.ObjectId,
                document.Description,
                document.Data,
                "",
                document.Uri,
                document.PdfReqLevel,
                false,
                addedFileResult
              );
            },
            function (e) {
              ditec.dSigXadesJs.convertToPDFA(
                document.Data,
                "",
                pdfReqLevel2Convert,
                new Callback(
                  function () {
                    ditec.dSigXadesJs.getConvertedPDFA(
                      new Callback(
                        function (ret) {
                          ditec.dSigXadesJs.addPdfObject(
                            document.ObjectId,
                            document.Description,
                            ret,
                            "",
                            document.Uri,
                            document.PdfReqLevel,
                            false,
                            addedFileResult
                          );
                        },
                        null,
                        DSignerErrorMessages.pluginPdfRetCode
                      )
                    );
                  },
                  null,
                  DSignerErrorMessages.pluginPdfRetCode
                )
              );
            },
            null,
            DSignerErrorMessages.pluginPdfRetCode
          )
        );
      }
    } else if (document.Description == "TXT") {
      ditec.dSigXadesJs.addTxtObject(
        document.ObjectId,
        document.Description,
        document.Data,
        document.Uri,
        addedFileResult
      );
    } else if (document.Description == "PNG") {
      ditec.dSigXadesJs.addPngObject(
        document.ObjectId,
        document.Description,
        document.Data,
        document.Uri,
        addedFileResult
      );
    } else {
      throw "Tento typ súboru nie je možné podpísať týmto podpisovačom.";
    }
  };

  this.checkPDFAComplianceXAdES = function (
    self,
    documents,
    index,
    resultCallback,
    invalidDocuments
  ) {
    if (documents.length == index) {
      resultCallback(invalidDocuments);
      return;
    }

    var document = documents[index];

    if (document.Description == "PDF" && !document.IsContainerContent) {
      var nextCallback = new Callback(
        function () {
          self.checkPDFAComplianceXAdES(
            self,
            documents,
            index + 1,
            resultCallback,
            invalidDocuments
          );
        },
        function () {
          invalidDocuments.push(document.ObjectId);
          nextCallback.onSuccess();
        }
      );

      ditec.dSigXadesJs.checkPDFACompliance(
        document.Data,
        "",
        pdfReqLevel2Check,
        nextCallback
      );
    } else {
      self.checkPDFAComplianceXAdES(
        self,
        documents,
        index + 1,
        resultCallback,
        invalidDocuments
      );
    }
  };

  this.initializingASiC = false;

  this.initializedASiC = false;

  this.initASiC = function (initializedCallback) {
    if (this.initializingASiC) {
      throw new DSignerError("Podpisovač sa spúšťa. Počkajte, prosím.");
    }

    if (this.initializedASiC) {
      initializedCallback();
    }

    if (eDesk.core.detectPlatform().isWindows) {
      if (eDesk.core.detectBrowser().isChrome)
        this.initDBridgeASiC(
          ["dLauncherDotNet", "dLauncherJava"],
          initializedCallback
        );
      else
        this.initDBridgeASiC(
          ["dLauncherDotNet", "java", "dLauncherJava"],
          initializedCallback
        );
    } else {
      if (eDesk.core.detectBrowser().isChrome)
        this.initDBridgeASiC(["dLauncherJava"], initializedCallback);
      else this.initDBridgeASiC(["java", "dLauncherJava"], initializedCallback);
    }
  };

  this.initDBridgeASiC = function (platforms, initializedCallback) {
    var self = this;

    ditec.dSigXadesBpJs.deploy(
      { platforms: platforms },
      {
        onSuccess: function (instance) {
          self.initializingASiC = false;
          self.initializedASiC = true;
          initializedCallback();
        },

        onError: function (e) {
          throw e;
        },
      }
    );
  };

  this.signFilesASiC = function (signRequest, resultCallback) {
    var self = this;

    var signCallback = new Callback(function () {
      ditec.dSigXadesBpJs.sign(
        signRequest.SignatureId,
        ditec.dSigXadesBpJs.SHA256,
        "",
        new Callback(function () {
          ditec.dSigXadesBpJs.getSignatureWithASiCEnvelopeBase64(
            new Callback(resultCallback)
          );
        })
      );
    });

    ditec.dSigXadesBpJs.initialize(
      new Callback(function () {
        self.addFilesASiC(self, signRequest.Documents, 0, signCallback);
      })
    );
  };

  this.addFilesASiC = function (self, documents, index, signCallback) {
    var document = documents[index];
    var nextCallback = undefined;

    if (documents.length == index + 1) nextCallback = signCallback;
    else
      nextCallback = new Callback(function () {
        self.addFilesASiC(self, documents, index + 1, signCallback);
      });

    if (document.IsXml) self.addFileXmlASiC(document, nextCallback);
    else self.addFileASiC(document, nextCallback);
  };

  this.addFileXmlASiC = function (document, addedFileResult) {
    if (document.XmlFormId == "application/vnd.gov.sk.xmldatacontainer+xml") {
      var self = this;

      ditec.dSigXadesBpJs.getVersion(
        new Callback(function (version) {
          if (self.checkExistsAddXmlObject2(JSON.parse(version)) === false) {
            this.onError({
              name: "DitecError",
              code: "OLD_DSIGNER",
            });

            return;
          }

          ditec.dSigXadesBpJs.addXmlObject2(
            document.ObjectId,
            document.Description,
            document.Uri,
            document.Data,
            document.Xsd,
            document.Xslt,
            addedFileResult
          );
        })
      );
    } else {
      ditec.dSigXadesBpJs.addXmlObject(
        document.ObjectId,
        document.Description,
        document.Uri,
        document.Data,
        document.XmlFormId,
        document.XmlFormVersion,
        document.Xsd,
        document.XsdUri,
        document.Xslt,
        document.XsltUri,
        document.XsltIsHtml == true
          ? ditec.dSigXadesBpJs.XML_MEDIA_DESTINATION_TYPE_DESC_HTML
          : ditec.dSigXadesBpJs.XML_MEDIA_DESTINATION_TYPE_DESC_TXT,
        document.Language, // Jazyk pouzitej prezentacnej schemy.
        document.TargetEnvironment, // Sluzi na odlisenie nastroja alebo prostredia, pre ktore je prezentacna schema urcena.
        true,
        ditec.dSigXadesBpJs.XML_XDC_NAMESPACE_URI_V1_1,
        addedFileResult
      );
    }
  };

  this.addFileASiC = function (document, addedFileResult) {
    if (document.Description == "PDF") {
      if (document.IsContainerContent) {
        ditec.dSigXadesBpJs.addPdfObject(
          document.ObjectId,
          document.Description,
          document.Data,
          "",
          document.Uri,
          document.PdfReqLevel,
          false,
          addedFileResult
        );
      } else {
        ditec.dSigXadesBpJs.checkPDFACompliance(
          document.Data,
          "",
          document.PdfReqLevel,
          new Callback(
            function () {
              ditec.dSigXadesBpJs.addPdfObject(
                document.ObjectId,
                document.Description,
                document.Data,
                "",
                document.Uri,
                document.PdfReqLevel,
                false,
                addedFileResult
              );
            },
            function (e) {
              ditec.dSigXadesBpJs.convertToPDFA(
                document.Data,
                "",
                pdfReqLevel2Convert,
                new Callback(
                  function () {
                    ditec.dSigXadesBpJs.getConvertedPDFA(
                      new Callback(
                        function (ret) {
                          ditec.dSigXadesBpJs.addPdfObject(
                            document.ObjectId,
                            document.Description,
                            ret,
                            "",
                            document.Uri,
                            document.PdfReqLevel,
                            false,
                            addedFileResult
                          );
                        },
                        null,
                        DSignerErrorMessages.pluginPdfRetCode
                      )
                    );
                  },
                  null,
                  DSignerErrorMessages.pluginPdfRetCode
                )
              );
            },
            null,
            DSignerErrorMessages.pluginPdfRetCode
          )
        );
      }
    } else if (document.Description == "TXT") {
      ditec.dSigXadesBpJs.addTxtObject(
        document.ObjectId,
        document.Description,
        document.Data,
        document.Uri,
        addedFileResult
      );
    } else if (document.Description == "PNG") {
      ditec.dSigXadesBpJs.addPngObject(
        document.ObjectId,
        document.Description,
        document.Data,
        document.Uri,
        addedFileResult
      );
    } else {
      throw "Tento typ súboru nie je možné podpísať týmto podpisovačom.";
    }
  };

  (this.checkExistsAddXmlObject2 = function (version) {
    var xmlPluginNet = $.grep(version.plugins, function (n, i) {
      return n.name === "Ditec.Zep.DSigXades.Plugins.XmlBpObject";
    });

    if (xmlPluginNet.length == 1) {
      return (
        eDesk.core.compareVersions(xmlPluginNet[0].version, "4.0.0.7") >= 0
      );
    }

    var xmlPluginJava = $.grep(version.plugins, function (n, i) {
      return (
        n.name === "sk.ditec.zep.dsigner.xades.bp.plugins.xmlplugin.XmlBpPlugin"
      );
    });

    if (xmlPluginJava.length == 1) {
      return (
        eDesk.core.compareVersions(xmlPluginJava[0].version, "2.0.0.13") >= 0
      );
    }

    return false;
  }),
    (this.checkPDFAComplianceASiC = function (
      self,
      documents,
      index,
      resultCallback,
      invalidDocuments
    ) {
      if (documents.length == index) {
        resultCallback(invalidDocuments);
        return;
      }

      var document = documents[index];

      if (document.Description == "PDF" && !document.IsContainerContent) {
        var nextCallback = new Callback(
          function () {
            self.checkPDFAComplianceASiC(
              self,
              documents,
              index + 1,
              resultCallback,
              invalidDocuments
            );
          },
          function () {
            invalidDocuments.push(document.ObjectId);
            nextCallback.onSuccess();
          }
        );

        ditec.dSigXadesBpJs.checkPDFACompliance(
          document.Data,
          "",
          pdfReqLevel2Check,
          nextCallback
        );
      } else {
        self.checkPDFAComplianceASiC(
          self,
          documents,
          index + 1,
          resultCallback,
          invalidDocuments
        );
      }
    });

  return this;
}
