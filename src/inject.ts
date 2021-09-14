import { SignerClient } from "./signer-client";
import { DsignerMediator, DsignerRequest } from "./dsigner-mediator";
import { DxrData, DxrMediator } from "./dxr-mediator";

const windowAny = window as any;

console.log("original", windowAny.DSigner);
console.log("original", windowAny.DSignerConstructor);
console.log("original", windowAny.DSignerConstructorClient);

const originalDSCC = windowAny.DSignerConstructorClient;

class DSignerCustom {
  constructor() {
    console.log("called DSignerCustom constructor");
  }
}

class DSignerConstructorClientCustom {
  sign(request: DsignerRequest) {
    this.newSign(request);
  }

  oldSign(request: DsignerRequest) {
    try {
      originalDSCC.request = request;
      this.oldSignInternal();
    } catch (ex) {
      if (ex.message == undefined || ex.message == "") {
        MessageBox.displayError(
          'Pri podpisovaní sa vyskytla chyba. Prosím, skúste vykonať <a target="_blank" class="align-self-right align-self-bottom text-decoration-underline" href="https://www.slovensko.sk/sk/faq/_najcastejsie-otazky-a-odpovede#problempripodpisovani">kroky v často kladených otázkach</a>, alebo využite aplikáciu od iných výrobcov. Pri pretrvávajúcich problémoch kontaktujte <a target="_blank" class="align-self-right align-self-bottom text-decoration-underline" href="https://www.slovensko.sk/sk/pomoc">Ústredné kontaktné centrum</a>.'
        );
      } else {
        MessageBox.displayError(ex.message);
      }
    }
  }

  oldSignInternal() {
    DSignerConstructor.sign(originalDSCC.request, function (signedData: any) {
      const response: DxrData = {
        Data: signedData,
        SignatureType: originalDSCC.request.SignatureType,
        SignatureMetadata: originalDSCC.request.SignatureMetadata,
        InternalDocumentIds: originalDSCC.request.InternalDocumentIds,
        InternalDocumentSignatureContainerIds:
          originalDSCC.request.InternalDocumentSignatureContainerIds,
      };

      console.log(response);
      const callbackRequest = "Action|sign|Data|" + JSON.stringify(response);
      console.log(callbackRequest);

      windowAny.callbackPanelForm.PerformCallback(callbackRequest);
      windowAny.loadingPanel.Show();
    });
  }

  newSign(request: DsignerRequest) {
    console.log(request);
    MessageBox.displayInfo(
      "(DSignerConstructorClientCustom)\n  Začíname podpisovanie v signeri"
    );

    const client = new SignerClient();

    client.exec(DsignerMediator.toSigner(request)).then(
      (response) => {
        console.log(response);
        MessageBox.displayInfo("Podpísané");
        const callbackRequest = DxrMediator.updateSignedForm(response, request);
        console.log(callbackRequest);
        windowAny.callbackPanelForm.PerformCallback(callbackRequest);
        windowAny.loadingPanel.Show();
      },
      (reason) => {
        reason.json().then((ro: any) => {
          console.log(ro);
          MessageBox.displayError("Niečo sa pokazilo: " + ro.message);
        });
      }
    );
    return false;
  }
}

class DSignerConstructorCustom {
  sign(request: any) {
    console.log(request);
    MessageBox.displayInfo("WOhooo DSignerConstructorCustom");
  }
}

// (window as any).DSigner = new DSignerCustom();
// (window as any).DSignerClient = new DSignerCustom();
// (window as any).DSignerConstructor = new DSignerConstructorCustom();
windowAny.DSignerConstructorClient = new DSignerConstructorClientCustom();

console.log("inject");

console.log(DSignerConstructorClient);

// console.log(DSigner);
// declare var DSigner: any;
declare let DSignerClient: any;
declare let DSignerConstructor: any;
declare let DSignerConstructorClient: any;
// declare let MessageBox: any;

// @global DSignerClient



// const a = {
//   "Data": "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\nMxMAAAAA",
//   "SignatureType": "ASiC",
//   "SignatureMetadata": {
//       "AddTimestampAndMerge": true,
//       "DisplayName": "Vseobecna_agenda.asice",
//       "MimeType": "application/vnd.etsi.asic-e+zip",
//       "Description": "Všeobecná agenda"
//   },
//   "InternalDocumentIds": [
//       0
//   ],
//   "InternalDocumentSignatureContainerIds": []
// }


/*
Action|sign|Data|{"Data":"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\nMxMAAAAA","SignatureType":"ASiC","SignatureMetadata":{"AddTimestampAndMerge":true,"DisplayName":"Vseobecna_agenda.asice","MimeType":"application/vnd.etsi.asic-e+zip","Description":"Všeobecná agenda"},"InternalDocumentIds":[0],"InternalDocumentSignatureContainerIds":[]}
*/