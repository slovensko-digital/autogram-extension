import {
  DesktopSignatureParameters,
  DesktopSignResponseBody,
} from "autogram-sdk";
import { FullClient } from "autogram-sdk/ui";
import { TODO } from "../../util";
import { SigningStatus, SignRequest } from "../ditecx/sign-request";

import {
  ImplementationInterface,
  OnErrorCallback,
  OnSuccessCallback,
  OnSuccessCallback1,
} from "../ditecx/implementation";
import { AvmChannelWeb } from "./avm-channel";
import { InputObject } from "../ditecx/types";

const AVAILABLE_LANGUAGES = ["sk", "en"];

/**
 *
 */
export class DBridgeAutogramImpl implements ImplementationInterface {
  private signRequest: SignRequest;
  private language = "sk";
  private signedObject: DesktopSignResponseBody;

  private client: FullClient;

  public constructor() {
    this.client = new FullClient(new AvmChannelWeb(), () => {
      this.signRequest = new SignRequest();
    });
  }

  public async launch(callback: OnSuccessCallback): Promise<void> {
    callback.onSuccess();
  }

  public setLanguage(language: string) {
    TODO("Language can be set only on server start");
    if (AVAILABLE_LANGUAGES.includes(language)) {
      this.language = language;
    }
  }

  public async sign(
    signatureId: string,
    digestAlgUri: string,
    signaturePolicyIdentifier: string,
    callback: OnSuccessCallback & OnErrorCallback
  ): Promise<void> {
    if (this.signRequest.signingStatus !== SigningStatus.new) {
      console.error("Signing non-new sign request");
    }

    // console.log(this.signatureParameters);
    this.signRequest.signatureId = signatureId;
    this.signRequest.digestAlgUri = digestAlgUri;
    this.signRequest.signaturePolicyIdentifier = signaturePolicyIdentifier;
    this.signRequest.signingStatus = SigningStatus.started;
    // this.launch(callback);
    callback.onSuccess();
  }

  public addObject(obj: InputObject, callback: OnSuccessCallback): void {
    if (this.signRequest.signingStatus == SigningStatus.signed) {
      console.warn("Resetting sign request");
      this.resetSignRequest();
    }

    if (this.signRequest.signingStatus !== SigningStatus.new) {
      console.error("Adding object to non-new sign request");
    }
    console.log(obj);
    this.signRequest.addObject(obj);
    console.log(callback);
    callback.onSuccess();
  }

  public async getSignature(
    parameters: Partial<DesktopSignatureParameters>,
    callback: OnSuccessCallback1,
    decodeBase64 = false
  ): Promise<void> {
    try {
      const response = await this.client.sign(
        this.signRequest.document,
        this.signRequest.signatureParameters(parameters),
        this.signRequest.payloadMimeType,
        decodeBase64
      );
      this.signedObject = response.content;
      this.signRequest.signingStatus = SigningStatus.signed;
      callback.onSuccess(response.content);
    } catch (e) {
      console.error(e);
    }
  }

  public getSignerIdentification(callback: OnSuccessCallback1): void {
    this.assertSignedRequest();
    if (this.signedObject?.signedBy) {
      callback.onSuccess(this.signedObject?.signedBy);
    } else {
      callback.onSuccess(
        `CN=(Používateľ Autogramu #${this.client.getSignatureIndex()})`
      );
    }
    // TODO skontrolovat ci preco nepouzivame takto riesene (asi si to pyta pred vypytanim si podpisu - kedze dsig podporuje taky flow)
    // this.signerIdentificationListeners.push(() => {
    // callback.onSuccess(this.signedObject?.signedBy);
    // });
  }

  public getOriginalObject(callback: OnSuccessCallback1) {
    this.assertSignedRequest();
    callback.onSuccess(this.signRequest.object);
  }

  public getVersion(callback: OnSuccessCallback1) {
    const fakeVersion =
      '{"name":"D.Signer/XAdES BP Java","version":"2.0.0.23","plugins":[{"name":"sk.ditec.zep.dsigner.xades.bp.plugins.xmlplugin.XmlBpPlugin","version":"2.0.0.23"},{"name":"sk.ditec.zep.dsigner.xades.bp.plugins.txtplugin.TxtBpPlugin","version":"2.0.0.23"},{"name":"sk.ditec.zep.dsigner.xades.bp.plugins.pngplugin.PngBpPlugin","version":"2.0.0.23"},{"name":"sk.ditec.zep.dsigner.xades.bp.plugins.pdfplugin.PdfBpPlugin","version":"2.0.0.23"}]}';
    callback.onSuccess(fakeVersion);
  }

  // Private methods

  private resetSignRequest() {
    this.client.resetSignRequest();
  }

  private assertSignedRequest() {
    if (this.signRequest.signingStatus !== SigningStatus.signed) {
      console.error("Signing request not signed");
    }
  }
}

/**
 *
 * @returns [string-proxy, valueObject]
 */
// function useStringProxy(inputString = "?"): [string, { value: string }] {
//   const valueObj = { value: inputString };
//   const proxy = new Proxy(valueObj, {
//     get(target, prop, receiver) {
//       const prim = Reflect.get(target, "value");
//       const value = prim[prop];
//       if (typeof value === "function") {
//         console.log({ target, prop, receiver });
//         if (prop === "substring") {
//           return function (...args) {
//             // eslint-disable-next-line prefer-spread
//             return useStringProxy(prim.substring.apply(prim, args));
//           };
//         }
//         return value.bind(prim);
//       } else {
//         return value;
//       }
//     },
//     apply(target, thisArg, argArray) {
//       console.log({ target, thisArg, argArray });
//     },
//   });
//   return [proxy as unknown as string, valueObj];
// }
