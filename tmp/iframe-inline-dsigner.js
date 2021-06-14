var DSignerConstructor = new DSigner();
var DSignerConstructorClient = {
  request: undefined,

  sign: function (request) {
    try {
      DSignerConstructorClient.request = request;
      DSignerConstructorClient.signInternal();
    } catch (ex) {
      if (ex.message == undefined || ex.message == "") {
        MessageBox.displayError(
          'Pri podpisovaní sa vyskytla chyba. Prosím, skúste vykonať <a target="_blank" class="align-self-right align-self-bottom text-decoration-underline" href="https://www.slovensko.sk/sk/faq/_najcastejsie-otazky-a-odpovede#problempripodpisovani">kroky v často kladených otázkach</a>, alebo využite aplikáciu od iných výrobcov. Pri pretrvávajúcich problémoch kontaktujte <a target="_blank" class="align-self-right align-self-bottom text-decoration-underline" href="https://www.slovensko.sk/sk/pomoc">Ústredné kontaktné centrum</a>.'
        );
      } else {
        MessageBox.displayError(ex.message);
      }
    }
  },

  validateAndSign: function (request) {
    try {
      DSignerConstructorClient.request = request;

      DSignerConstructor.checkPDFACompliance(
        request,
        function (invalidDocuments) {
          if (invalidDocuments.length == 0) {
            DSignerConstructorClient.signInternal();
          } else {
            MessageBox.displayConfirm(
              "Súbor bude skonvertovaný",
              "PDF súbor <b>{0}</b>, ktorý podpisujete, je vo verzii, ktorú zatiaľ neumožňujeme podpísať. Aby bolo možné súbor podpísať, automaticky ho skonvertujeme do formátu PDF/A-1. Interaktívne funkcie v PDF súbore sa môžu zneprístupniť. Prajete si pokračovať?".replace(
                "{0}",
                invalidDocuments.join(",<br />")
              ),
              "Podpísať",
              "Zrušiť",
              DSignerConstructorClient.signInternal
            );
          }
        }
      );
    } catch (ex) {
      if (ex.message == undefined || ex.message == "") {
        MessageBox.displayError(
          'Pri podpisovaní sa vyskytla chyba. Prosím, skúste vykonať <a target="_blank" class="align-self-right align-self-bottom text-decoration-underline" href="https://www.slovensko.sk/sk/faq/_najcastejsie-otazky-a-odpovede#problempripodpisovani">kroky v často kladených otázkach</a>, alebo využite aplikáciu od iných výrobcov. Pri pretrvávajúcich problémoch kontaktujte <a target="_blank" class="align-self-right align-self-bottom text-decoration-underline" href="https://www.slovensko.sk/sk/pomoc">Ústredné kontaktné centrum</a>.'
        );
      } else {
        MessageBox.displayError(ex.message);
      }
    }
  },

  signInternal: function () {
    DSignerConstructor.sign(
      DSignerConstructorClient.request,
      function (signedData) {
        var response = {
          Data: signedData,
          SignatureType: DSignerConstructorClient.request.SignatureType,
          SignatureMetadata: DSignerConstructorClient.request.SignatureMetadata,
          InternalDocumentIds:
            DSignerConstructorClient.request.InternalDocumentIds,
          InternalDocumentSignatureContainerIds:
            DSignerConstructorClient.request
              .InternalDocumentSignatureContainerIds,
        };

        callbackPanelForm.PerformCallback(
          "Action|sign|Data|" + JSON.stringify(response)
        );
        loadingPanel.Show();
      }
    );
  },
};

eDesk.core.namespace("eDesk.Controls");

eDesk.Controls.FormManager = {
  signHandler: undefined,

  verifyHandler: function () {
    eDesk.core.modalClose(
      "ctl00_ctl00_ctl00_CphMasterMain_CphMain_formManager_modalSignConfirm"
    );

    let idMessage = 419848006;
    let sessionTabId = "23f2757d-a3ab-4173-9764-29fa00e116ad";

    eDesk.Controls.SignatureVerifyResult.verifyForm(idMessage, sessionTabId);
  },

  onloadIFrame: function () {
    eDesk.core.preventDefaultEnterEvent("iFrameFiller");
    eDesk.core.resizeIframeEForm("iFrameFiller");
    loadingPanelIFrameFiller.Hide();
  },

  getForm: function () {
    var formWindow = document.getElementById("iFrameFiller").contentWindow;

    if (formWindow.fillerUri != undefined) {
      let signonly = false;

      if (signonly) {
        formWindow.GetData = function () {
          return "";
        };
      }

      return formWindow;
    }

    return {
      EnableForm: function () {},
      DisableForm: function () {},
      ValidateForm: function () {
        return true;
      },
      GetData: function () {
        return "";
      },
    };
  },

  isFormSigned: function () {
    return hfFormFlags.Get("isSigned");
  },

  validateForm: function () {
    var result = eDesk.Controls.FormManager.getForm().ValidateForm();

    if (result == undefined) result = true;

    if (result) {
      return true;
    } else {
      eDesk.Controls.FormManager.onloadIFrame();
      return false;
    }
  },

  validateFormSignature: function (s, e) {
    if (hfFormFlags.Get("mustSign")) return hfFormFlags.Get("isSigned");

    return true;
  },

  btnValidateForm_Click: function (s, e) {
    if (eDesk.Controls.FormManager.validateForm())
      MessageBox.displayInfoPopup("Formulár je správne vyplnený.");
    else MessageBox.displayErrorPopup("Formulár nie je správne vyplnený.");
  },

  getSelectedDocuments: function () {
    var controls = ASPxClientControl.GetControlCollection();
    var selection = [];

    $(".form-mutisign-selection-content").each(function (index, element) {
      var checkbox = controls.GetByName(element.id);

      if (checkbox.GetChecked()) {
        selection.push($("#" + checkbox.name).data("param"));
      }
    });

    return selection;
  },

  sendQesRequest: function (
    callBackQesRequest,
    confirmText,
    headerText,
    bodyText
  ) {
    if (hfFormFlags.Get("isSigned")) {
      eDesk.Controls.FormManager.signHandler = function () {
        eDesk.core.modalClose(
          "ctl00_ctl00_ctl00_CphMasterMain_CphMain_formManager_modalSignConfirm"
        );
        callBackQesRequest.PerformCallback();
      };

      $(
        "#ctl00_ctl00_ctl00_CphMasterMain_CphMain_formManager_modalSignConfirm_btnAddSignatureConfirm"
      ).text(confirmText);
      $(
        "#ctl00_ctl00_ctl00_CphMasterMain_CphMain_formManager_modalSignConfirm_divModalBodyText"
      ).html(bodyText);
      $(
        "#ctl00_ctl00_ctl00_CphMasterMain_CphMain_formManager_modalSignConfirm h3"
      ).text(headerText);

      eDesk.core.modalShow(
        "ctl00_ctl00_ctl00_CphMasterMain_CphMain_formManager_modalSignConfirm"
      );
    } else {
      var result = eDesk.Controls.FormManager.getForm().ValidateForm();

      if (result == undefined) result = true;

      if (!result) {
        eDesk.Controls.FormManager.onloadIFrame();
        MessageBox.displayError("Formulár nie je správne vyplnený.");
        return;
      }

      callBackQesRequest.PerformCallback(
        JSON.stringify({
          formData: eDesk.Controls.FormManager.getForm().GetData(),
          selection: eDesk.Controls.FormManager.getSelectedDocuments(),
        })
      );

      loadingPanel.Show();
    }
  },

  btnSign_Click: function (s, e) {
    try {
      let confirmText = "Podpísať";
      let confirmHeader = "Pridať ďalší podpis";
      let confirmBody =
        "<p>Tento dokument je už podpísaný. Podpisy odporúčame skontrolovať cez tlačidlo Zobraziť podpisy.</p><p>Chcete pridať ďalší podpis?</p>";
      eDesk.Controls.FormManager.sendQesRequest(
        callBackCreateSignRequest,
        confirmText,
        confirmHeader,
        confirmBody
      );
    } catch (err) {
      MessageBox.displayError(
        'Pri podpisovaní sa vyskytla chyba. Prosím, skúste vykonať <a target="_blank" class="align-self-right align-self-bottom text-decoration-underline" href="https://www.slovensko.sk/sk/faq/_najcastejsie-otazky-a-odpovede#problempripodpisovani">kroky v často kladených otázkach</a>, alebo využite aplikáciu od iných výrobcov. Pri pretrvávajúcich problémoch kontaktujte <a target="_blank" class="align-self-right align-self-bottom text-decoration-underline" href="https://www.slovensko.sk/sk/pomoc">Ústredné kontaktné centrum</a>.'
      );
    }
  },

  btnSeal_Click: function (s, e) {
    try {
      let confirmText = "Zapečatiť";
      let confirmHeader = "Pridať pečať";
      let confirmBody =
        "<p>Tento dokument je už podpísaný. Podpisy odporúčame skontrolovať cez tlačidlo Zobraziť podpisy.</p><p>Chcete pridať pečať?</p>";
      eDesk.Controls.FormManager.sendQesRequest(
        callBackSealForm,
        confirmText,
        confirmHeader,
        confirmBody
      );
    } catch (err) {
      MessageBox.displayError(
        'Pri podpisovaní sa vyskytla chyba. Prosím, skúste vykonať <a target="_blank" class="align-self-right align-self-bottom text-decoration-underline" href="https://www.slovensko.sk/sk/faq/_najcastejsie-otazky-a-odpovede#problempripodpisovani">kroky v často kladených otázkach</a>, alebo využite aplikáciu od iných výrobcov. Pri pretrvávajúcich problémoch kontaktujte <a target="_blank" class="align-self-right align-self-bottom text-decoration-underline" href="https://www.slovensko.sk/sk/pomoc">Ústredné kontaktné centrum</a>.'
      );
    }
  },

  callBackCreateSignRequest_CallbackComplete: function (s, e) {
    loadingPanel.Hide();

    if (s.cpResult) {
      DSignerConstructorClient.sign(JSON.parse(e.result));
    } else {
      MessageBox.displayError(e.result);

      eDesk.Controls.FormManager.getForm().ValidateForm();
      eDesk.Controls.FormManager.onloadIFrame();
    }
  },

  callBackSealForm_CallbackComplete: function (s, e) {
    if (s.cpResult) {
      MessageBox.displayCallbackResult(s, e);
      callbackPanelForm.PerformCallback("Action|update");
    } else {
      loadingPanel.Hide();
      MessageBox.displayError(e.result);
    }
  },

  btnUnsignForm_Click: function (s, e) {
    var canSeal = "false";

    var headerText = "";
    var bodyText = "";

    if (canSeal === "true") {
      headerText = "Odobrať podpis/pečať";
      bodyText =
        "Naozaj si želáte odobrať všetky podpisy/pečate z elektronického dokumentu?";
    } else {
      headerText = "Odobrať podpis";
      bodyText =
        "Naozaj si želáte odobrať všetky podpisy z elektronického dokumentu?";
    }

    var submitText = "Áno";
    var cancelText = "Nie";

    MessageBox.displayConfirm(
      headerText,
      bodyText,
      submitText,
      cancelText,
      function () {
        callbackPanelForm.PerformCallback("Action|unsign");
        loadingPanel.Show();
      }
    );
  },

  callbackPanelForm_EndCallback: function (s, e) {
    window.myApp.updateAll();
    loadingPanel.Hide();

    MessageBox.displayCallbackResult(s);
  },

  saveFormCallback: null,

  saveForm: function (url, callback) {
    if (url === "callback") {
      eDesk.Controls.FormManager.saveFormCallback = callback;
    } else {
      eDesk.Controls.FormManager.saveFormCallback = null;
    }

    callBackSaveForm.PerformCallback(
      "Url|" + url + "|Data|" + eDesk.Controls.FormManager.getForm().GetData()
    );
    loadingPanel.Show();
  },

  callBackSaveForm_CallbackComplete: function (s, e) {
    loadingPanel.Hide();

    if (s.cpResult) {
      if (e.result === "callback") {
        eDesk.Controls.FormManager.saveFormCallback();
      } else {
        window.location = e.result;
      }
    } else {
      MessageBox.displayError(e.result);
    }
  },

  uploadControlForm_FilesUploadComplete: function (s, e) {
    if (e.callbackData == "true") {
      document
        .getElementById("iFrameFiller")
        .contentWindow.location.reload(true);
      loadingPanelIFrameFiller.Show();

      eDesk.core.modalClose("importFormModal-1");
      MessageBox.displayInfoPopup("Elektronický dokument bol úspešne nahraný.");

      callbackPanelForm.PerformCallback("Action|update");
    }
  },

  cpRenameAttachment_EndCallback: function (s, e) {
    if (s.cpResult || false)
      eDesk.core.modalShow(
        "ctl00_ctl00_ctl00_CphMasterMain_CphMain_formManager_cpRenameAttachment_renameAttachmentControl_renameAttachmentModal"
      );
    else MessageBox.displayCallbackResult(s);
  },
};
