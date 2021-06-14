var edeskFormConstructor = {
  callbackValidCaptcha: undefined,

  validateCaptcha: function () {
    callBackCaptcha.PerformCallback(dxCaptcha.GetEditor().GetText());
    loadingPanel.Show();
  },

  btnSaveDraft_Click: function (s, e) {
    if (hfFlags.Get("isCaptchaValid")) {
      edeskFormConstructor.saveDraft();
    } else {
      if (!ASPxClientEdit.ValidateEditorsInContainer(null, "captcha")) {
        return;
      }

      edeskFormConstructor.callbackValidCaptcha =
        edeskFormConstructor.saveDraft;
      edeskFormConstructor.validateCaptcha();
    }
  },

  saveDraft: function () {
    callBackSaveDraft.PerformCallback(
      eDesk.Controls.FormManager.getForm().GetData()
    );
    loadingPanel.Show();
  },

  saveDraftContinuously: function () {
    let timeout = 120000;

    setTimeout(function () {
      callBackSaveDraftContinuously.PerformCallback(
        eDesk.Controls.FormManager.getForm().GetData()
      );
    }, timeout);
  },

  /**
   * Odosielanie spravy
   */

  btnSend_Click: function (s, e) {
    let sendValidateResult = edeskFormConstructor.sendValidate();

    if (sendValidateResult === "SEND") {
      edeskFormConstructor.sendConfirmDialog();
    } else if (sendValidateResult === "VALIDATE_CAPTCHA") {
      edeskFormConstructor.callbackValidCaptcha =
        edeskFormConstructor.sendConfirmDialog;
      edeskFormConstructor.validateCaptcha();
    } else {
      // validacna chyba, chyba
    }
  },

  /** Validacia formulara pred odoslanim spravy */
  sendValidate: function () {
    try {
      if (!ASPxClientEdit.ValidateEditorsInContainer(null, "send")) {
        return "VALIDATION_ERROR";
      }

      var result = eDesk.Controls.FormManager.validateForm();

      if (!result) {
        MessageBox.displayError("Formulár nie je správne vyplnený.");
        return "VALIDATION_ERROR";
      }

      result = eDesk.Controls.FormManager.validateFormSignature();

      if (!result) {
        MessageBox.displayError(
          "Formulár je potrebné pred odoslaním podpísať."
        );
        return "VALIDATION_ERROR";
      }

      if (hfFlags.Get("isCaptchaValid")) {
        return "SEND";
      } else {
        if (!ASPxClientEdit.ValidateEditorsInContainer(null, "captcha")) {
          return "VALIDATION_ERROR";
        }

        return "VALIDATE_CAPTCHA";
      }
    } catch (err) {
      MessageBox.displayError("Pri odosielaní správy sa vyskytla chyba.");
      return "ERROR";
    }
  },

  /**
   * Výber potvrdzovacieho modalneho okna, jednotlive scenare sa navzajom vylucuju:
   *  A - v pripadoch, ze podanie nema podpisany hlavny formular a je ho mozne dorucovat aj listinne
   *  B - v pripadoch, ze rozhodnutie je mozne dorucovat listinne (manualne) zobrazi modal autorizacnej dolozky
   *    - inac odosle spravu
   * */
  sendConfirmDialog: function () {
    // A - listinne dorucenenie podania
    let confirmPrint =
      hfFlags.Get("needQesOrPrint") &&
      !eDesk.Controls.FormManager.isFormSigned();

    if (confirmPrint) {
      eDesk.core.modalShow(
        "ctl00_ctl00_ctl00_CphMasterMain_CphMain_confirmSendPaperFormWithouthSignature"
      );
      return;
    }

    // B - listinne dorucenie rozhodnutia (manualne)
    let isPostalDeliveryManualEnabled = hfFlags.Get(
      "isPostalDeliveryManualEnabled"
    );

    if (
      isPostalDeliveryManualEnabled &&
      edeskFormConstructor.isSelectedRecipientWithPostalDeliveryEnabled === true
    ) {
      eDesk.core.modalShow(
        "ctl00_ctl00_ctl00_CphMasterMain_CphMain_createAuthorizationClauseModal_createAuthorizationClauseModal"
      );
      return;
    }

    edeskFormConstructor.send();
  },

  send: function () {
    hfAuthenticationAssertion.Set("assertion", "");
    var needAuthentication = hfFlags.Get("needAuthentication");

    if (needAuthentication) {
      IamAA.authentificate(
        hfFlags.Get("IdMessage"),
        edeskFormConstructor.authentificationListener
      );
    } else {
      if (eDesk.Controls.FormManager.isFormSigned()) {
        callBackPanelSend.PerformCallback("");
      } else {
        callBackPanelSend.PerformCallback(
          eDesk.Controls.FormManager.getForm().GetData()
        );
      }

      loadingPanel.Show();
    }
  },

  sendPaperFormWithouthSignature: function () {
    eDesk.core.modalClose(
      "ctl00_ctl00_ctl00_CphMasterMain_CphMain_confirmSendPaperFormWithouthSignature"
    );
    edeskFormConstructor.send();
  },

  notSendPaperFormWithouthSignature: function () {
    eDesk.core.modalClose(
      "ctl00_ctl00_ctl00_CphMasterMain_CphMain_confirmSendPaperFormWithouthSignature"
    );
    eDesk.Controls.FormManager.btnSign_Click();
  },

  sendWithAuthorizationClause: function () {
    eDesk.core.modalClose(
      "ctl00_ctl00_ctl00_CphMasterMain_CphMain_createAuthorizationClauseModal_createAuthorizationClauseModal"
    );
    edeskFormConstructor.send();
  },

  authentificationListener: function (data) {
    hfAuthenticationAssertion.Set("assertion", data);
    callBackPanelSend.PerformCallback(
      eDesk.Controls.FormManager.getForm().GetData()
    );
    loadingPanel.Show();
  },

  /**
   * Validation
   */

  validateMessageSenderBusinessReference: function (
    isSelectedRecipientWithPostalDeliveryEnabled
  ) {
    // Validácia značky odosielateľa

    edeskFormConstructor.isSelectedRecipientWithPostalDeliveryEnabled =
      isSelectedRecipientWithPostalDeliveryEnabled;

    if (isSelectedRecipientWithPostalDeliveryEnabled === true) {
      lblMessageSenderBusinessReference.SetText("Značka odosielateľa");
    } else {
      lblMessageSenderBusinessReference.SetText(
        'Značka odosielateľa <span class="text-desc">(nepovinné)</span>'
      );
    }

    // Informácie o listinnom doručovaní

    let alertPostalDeliveryInfoId =
      "#ctl00_ctl00_ctl00_CphMasterMain_CphMain_alertPostalDeliveryInfo";

    if (isSelectedRecipientWithPostalDeliveryEnabled === true) {
      let isPostalDeliveryCudEnabled = hfFlags.Get(
        "isPostalDeliveryCudEnabled"
      );
      let isPostalDeliveryManualEnabled = hfFlags.Get(
        "isPostalDeliveryManualEnabled"
      );

      if (isPostalDeliveryCudEnabled) {
        $(alertPostalDeliveryInfoId).html(
          'Vybrali ste adresáta, ktorý nemá aktivovanú schránku na doručovanie. Znamená to, že takýmto adresátom bude správa doručená listinne, prostredníctvom Centrálneho úradného doručovania. <a class="link" href="https://www.slovensko.sk/sk/zivotne-situacie/zivotna-situacia/_centralne-uradne-dorucovanie/" target="_blank">Viac informácií o Centrálnom úradnom doručovaní.</a>'
        );
      } else if (isPostalDeliveryManualEnabled) {
        $(alertPostalDeliveryInfoId).html(
          "Vybrali ste adresáta, ktorý nemá aktivovanú schránku na doručovanie. Po kliknutí na tlačidlo Odoslať, budete vyzvaní na doplnenie údajov do doložky o autorizácii. Po odoslaní rozhodnutia sa automaticky vygeneruje listinný rovnopis (spolu s doložkou o autorizácii), ktorý nájdete v odoslaných správach."
        );
      }

      $(alertPostalDeliveryInfoId).show();
    } else {
      $(alertPostalDeliveryInfoId).hide();
    }
  },

  isSelectedRecipientWithPostalDeliveryEnabled: false,

  validationMessageSenderBusinessReference: function (s, e) {
    if (
      edeskFormConstructor.isSelectedRecipientWithPostalDeliveryEnabled === true
    ) {
      if (txtMessageSenderBusinessReference.GetText()) {
        e.isValid = true;
      } else {
        e.isValid = false;
        e.errorText = "Povinné pole";
      }
    } else {
      e.isValid = true;
    }
  },

  /**
   * Events
   */

  btnSignByMorePersonsFinalize_Click: function (s, e) {
    let headerText = "Dokončiť";
    let bodyText =
      '<p class="mb-medium">Pridali ste všetky potrebné podpisy?</p><p class="panel panel-border-wide">Stiahnite si podpísané dokumenty pred dokončením podpisovania. <strong>Po dokončení už nebudete mať prístup k správe ani k jej dokumentom.</strong></p>';
    let submitText = "Dokončiť";
    let cancelText = "Zrušiť";

    MessageBox.displayConfirm(
      headerText,
      bodyText,
      submitText,
      cancelText,
      function () {
        s.autoPostBackFunction();
      }
    );

    e.processOnServer = false;
    return false;
  },

  callBackSaveDraft_CallbackComplete: function (s, e) {
    loadingPanel.Hide();

    if (e.result == "True") {
      MessageBox.displayInfo(s.cpMessage, s.cpRedirectUrl);
    } else {
      MessageBox.displayError("Pri ukladaní správy sa vyskytla chyba.");
    }
  },

  callBackDeleteMessage_CallbackComplete: function (s, e) {
    loadingPanel.Hide();

    if (e.result == "True") {
      MessageBox.displayInfo(s.cpMessage, s.cpRedirectUrl);
    } else {
      MessageBox.displayError("Pri ukladaní správy sa vyskytla chyba.");
    }
  },

  callBackCaptcha_CallbackComplete: function (s, e) {
    loadingPanel.Hide();

    if (e.result == "True") {
      hfFlags.Set("isCaptchaValid", true);

      if (edeskFormConstructor.callbackValidCaptcha != undefined)
        edeskFormConstructor.callbackValidCaptcha();
    } else {
      dxCaptcha.Refresh();
      dxCaptcha.GetEditor().SetText("");
      dxCaptcha.GetEditor().SetErrorText("Zadaný kód sa nezhoduje.");
      dxCaptcha.GetEditor().SetIsValid(false);
    }

    edeskFormConstructor.callbackValidCaptcha = undefined;
  },

  callBackPanelSend_EndCallback: function (s, e) {
    loadingPanel.Hide();

    if (s.cpResult && s.cpResultText === "SubmissionNeedQesOrPrintModal") {
      eDesk.core.modalShow(
        "ctl00_ctl00_ctl00_CphMasterMain_CphMain_callBackPanelSend_submissionNeedQesOrPrintModal_submissionNeedQesOrPrintModal"
      );
    } else {
      MessageBox.displayCallbackResult(s);
    }

    if (!s.cpResult) {
      eDesk.Controls.FormManager.getForm().ValidateForm();
      eDesk.Controls.FormManager.onloadIFrame();
    }
  },

  setMessageSizeInfo: function (text) {
    lblMaximalSizeFormWithAttachment.SetText(text);
  },

  callBackAddFavouriteService_CallbackComplete: function (s, e) {
    MessageBox.displayCallbackResult(s, e);
    btnAddToFavourites.SetVisible(false);
  },

  addFavouriteService: function (s, e) {
    callBackAddFavouriteService.PerformCallback();
  },

  btnSignByMorePersons_Click: function (s, e) {
    eDesk.Controls.FormManager.saveForm("callback", function () {
      eDesk.core.modalShow(
        "ctl00_ctl00_ctl00_CphMasterMain_CphMain_signByMorePersonsModal_signByMorePersonsModal"
      );
    });
  },
};
// ]]>
