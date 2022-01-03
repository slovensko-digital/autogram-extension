import { SignerClient } from "./signer-client";
import { DsignerMediator, DsignerRequest } from "./dsigner-mediator";
import { DxrData, DxrMediator } from "./dxr-mediator";
import sdLogo from "../static/sd_logo_small.png";

export class DSignerCustom {
  constructor() {
    console.log("called DSignerCustom constructor");
  }
}

export class DSignerConstructorClientCustom {
  sign(request: DsignerRequest): void {
    this.newSign(request);
  }

  oldSign(request: DsignerRequest): void {
    try {
      (window as any).originalDSCC.request = request;
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

  oldSignInternal(): void {
    const windowAny = window as any;
    const originalDSCC = windowAny.originalDSCC;
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

  newSign(request: DsignerRequest): boolean {
    const windowAny = window as any;
    console.log(request);
    MessageBox.displayInfo(
      `<img src="${sdLogo}" width=100 height=100/> Začíname podpisovanie v signeri`
    );

    const client: SignerClient = new SignerClient();

    client.sign(DsignerMediator.toSigner(request)).then(
      (response) => {
        console.log(response);
        MessageBox.displayInfo("Podpísané");
        const callbackRequest = DxrMediator.updateSignedForm(response, request);
        console.log(callbackRequest);
        windowAny.callbackPanelForm.PerformCallback(callbackRequest);
        windowAny.loadingPanel.Show();
      },
      (reason) => {
        reason.json().then((ro: unknown) => {
          console.log(ro);
          MessageBox.displayError("Niečo sa pokazilo: " + JSON.stringify(ro));
        });
      }
    );
    return false;
  }
}

export class DSignerConstructorCustom {
  sign(request: any): void {
    console.log(request);
    MessageBox.displayInfo("WOhooo DSignerConstructorCustom");
  }
}

export function inject(windowAny: any): void {
  windowAny.originalDSCC = windowAny.DSignerConstructorClient;
  windowAny.DSignerConstructorClient = new DSignerConstructorClientCustom();
}
