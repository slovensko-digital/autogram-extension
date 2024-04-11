import { SignResponseBody } from "../../autogram-api";
import { UserCancelledSigningException } from "../../autogram-api/lib/apiClient";
import { apiClient } from "../../client";
import { isSafari, TODO } from "../../util";
import {
  InputObject,
  PartialSignerParameters,
  SignRequest,
  SigningStatus,
} from "./sign-request";
import { Base64 } from "js-base64";

const AVAILABLE_LANGUAGES = ["sk", "en"];
export class DBridgeAutogramImpl {
  private client: ReturnType<typeof apiClient>;
  private signRequest: SignRequest;
  private language = "sk";
  private signedObject: SignResponseBody;

  private signerIdentificationListeners: (() => void)[];
  private signatureIndex = 1;

  constructor() {
    let serverProtocol: "http" | "https" = "http";
    let serverHost = "localhost";

    if (isSafari()) {
      // Quick hack - mozno je lepsie urobit to ako fallback ak nefunguje http
      serverProtocol = "https";
      serverHost = "loopback.autogram.slovensko.digital";
    }

    this.client = apiClient({
      serverProtocol,
      serverHost,
      disableSecurity: true,
      requestsOrigin: "*",
    });

    this.resetSignRequest();
  }

  resetSignRequest() {
    this.signerIdentificationListeners = [];
    this.signRequest = new SignRequest();
  }

  async launch(callback: OnSuccessCallback): Promise<void> {
    try {
      const info = await this.client.info();
      if (info.status != "READY") throw new Error("Wait for server");
      console.log(`Autogram ${info.version} is ready`);
    } catch (e) {
      console.error(e);
      const url = this.client.getLaunchURL();
      console.log(`Opening "${url}"`);
      window.location.assign(url);
      try {
        const info = await this.client.waitForStatus("READY", 100, 5);
        console.log(`Autogram ${info.version} is ready`);
      } catch (e) {
        console.log("waiting for Autogram failed");
        console.error(e);
      }
    }
    callback.onSuccess();
  }

  setLanguage(language: string) {
    TODO("Language can be set only on server start");
    if (AVAILABLE_LANGUAGES.includes(language)) {
      this.language = language;
    }
  }

  async sign(
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

  addObject(obj: InputObject, callback: OnSuccessCallback): void {
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

  async getSignature(
    parameters: PartialSignerParameters,
    callback: OnSuccessCallback1,
    decodeBase64 = false
  ): Promise<void> {
    this.client
      .sign(
        this.signRequest.document,
        this.signRequest.signatureParameters(parameters),
        this.signRequest.payloadMimeType
      )
      .then((signedObject) => {
        TODO("restart SignRequest?");
        this.signRequest.signingStatus = SigningStatus.signed;
        this.signedObject = signedObject;

        this.signerIdentificationListeners.forEach((cb) => cb());
        this.signerIdentificationListeners = [];
        this.signatureIndex++;

        callback.onSuccess(
          // TODO skontrolovat ci sa to niekedy moze pouzivat
          decodeBase64
            ? Base64.decode(this.signedObject.content)
            : this.signedObject.content
        );
      })
      .catch((reason) => {
        if (reason instanceof UserCancelledSigningException) {
          console.log("User cancelled request");
        } else {
          console.error(reason);
          callback.onError?.(reason);
        }
      });
  }

  getSignerIdentification(callback: OnSuccessCallback1): void {
    this.assertSignedRequest();
    callback.onSuccess(`CN=(Používateľ Autogramu #${this.signatureIndex})`);
    this.signerIdentificationListeners.push(() => {
      // callback.onSuccess(this.signedObject?.signedBy);
    });
  }

  getOriginalObject(callback: OnSuccessCallback1) {
    this.assertSignedRequest();
    callback.onSuccess(this.signRequest.object);
  }

  getVersion(callback: OnSuccessCallback1) {
    const fakeVersion =
      '{"name":"D.Signer/XAdES BP Launcher 2","version":"2.0.0.23","plugins":[{"name":"sk.ditec.zep.dsigner.xades.bp.plugins.xmlplugin.XmlBpPlugin","version":"2.0.0.23"},{"name":"sk.ditec.zep.dsigner.xades.bp.plugins.txtplugin.TxtBpPlugin","version":"2.0.0.23"},{"name":"sk.ditec.zep.dsigner.xades.bp.plugins.pngplugin.PngBpPlugin","version":"2.0.0.23"},{"name":"sk.ditec.zep.dsigner.xades.bp.plugins.pdfplugin.PdfBpPlugin","version":"2.0.0.23"}]}';
    callback.onSuccess(fakeVersion);
  }

  getPlatform(callback: OnSuccessCallback1){
    callback.onSuccess(["dLauncher2"]);
  }

  private assertSignedRequest() {
    if (this.signRequest.signingStatus !== SigningStatus.signed) {
      console.error("Signing request not signed");
    }
  }
}

interface OnSuccessCallback {
  onSuccess: () => void;
}
interface OnSuccessCallback1 {
  onSuccess: (v) => void;
  onError?: (v) => void;
}

interface OnErrorCallback {
  onError: (e) => void;
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
