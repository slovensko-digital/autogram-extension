import {
  DesktopSignatureParameters,
  DesktopSignResponseBody,
} from "autogram-sdk";
import { CombinedClient } from "autogram-sdk/with-ui";
import { TODO } from "../../util";
import { SigningStatus, SignRequest } from "../ditecx/sign-request";

import {
  ImplementationInterface,
  OnErrorCallback,
  OnSuccessCallback,
  OnSuccessCallback1,
} from "../ditecx/implementation";
import {
  AutogramDesktopChannel,
  AvmChannelWeb,
  WebChannelCaller,
} from "./channel/web";
import { InputObject } from "../ditecx/types";
import { createLogger } from "../../log";
import { ExtensionOptions } from "../../options/default";

const log = createLogger("ag-ext.impl");

const AVAILABLE_LANGUAGES = ["sk", "en"];

/**
 * Creates a hash-based restore point ID from sign request data and page URL
 * This ensures the same signing session can be resumed after page reload
 */
async function createRestorePointHash(
  signRequest: SignRequest,
  pageUrl: string
): Promise<string> {
  const subtleCrypto = globalThis.crypto?.subtle;
  if (!subtleCrypto) {
    throw new Error("SubtleCrypto not available");
  }

  // TODO: check if restore works
  const persistentData = {
    // signatureId: signRequest.signatureId,
    digestAlgUri: signRequest.digestAlgUri,
    signaturePolicyIdentifier: signRequest.signaturePolicyIdentifier,
    objectId: signRequest.object.objectId,
    objectType: signRequest.object.type,
    objectDescription: signRequest.object.objectDescription,
    documentContent: signRequest.document.content,
    documentFilename: signRequest.document.filename,

    url: pageUrl,
  };

  log.debug("createRestorePointHash", persistentData);

  const dataString = JSON.stringify(persistentData, null, 0);
  const hash = await subtleCrypto.digest(
    "SHA-256",
    new TextEncoder().encode(dataString)
  );
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Implementation of signing using autogram-sdk
 *
 * it means we can sign using both autogram and AVM
 */
export class DBridgeAutogramImpl implements ImplementationInterface {
  private signRequest: SignRequest;
  private language = "sk";
  private signedObject: DesktopSignResponseBody;

  private client: CombinedClient;

  private extensionOptions: ExtensionOptions;

  private constructor(
    client: CombinedClient,
    extensionOptions: ExtensionOptions
  ) {
    this.client = client;
    this.signRequest = new SignRequest();
    this.client.setResetSignRequestCallback(() => {
      this.signRequest = new SignRequest();
    });
    this.extensionOptions = extensionOptions;
    log.debug("Autogram options in constructor", extensionOptions);
  }

  public static async init(
    extensionOptions: ExtensionOptions
  ): Promise<DBridgeAutogramImpl> {
    const webChannelCaller = new WebChannelCaller();
    webChannelCaller.init();
    return new DBridgeAutogramImpl(
      await CombinedClient.init(
        new AvmChannelWeb(webChannelCaller),
        new AutogramDesktopChannel(webChannelCaller),
        () => {}
      ),
      extensionOptions
    );
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
      log.error("Signing non-new sign request");
    }

    // Set the sign request properties first so they can be used for hash generation
    this.signRequest.signatureId = signatureId;
    this.signRequest.digestAlgUri = digestAlgUri;
    this.signRequest.signaturePolicyIdentifier = signaturePolicyIdentifier;

    this.signRequest.signingStatus = SigningStatus.started;
    // this.launch(callback);
    callback.onSuccess();
  }

  public addObject(obj: InputObject, callback: OnSuccessCallback): void {
    if (this.signRequest.signingStatus == SigningStatus.signed) {
      log.warn("Resetting sign request");
      this.resetSignRequest();
    }

    if (this.signRequest.signingStatus !== SigningStatus.new) {
      log.error("Adding object to non-new sign request");
    }
    log.info(obj);
    this.signRequest.addObject(obj);
    log.debug(callback);
    callback.onSuccess();
  }

  public async getSignature(
    parameters: Partial<DesktopSignatureParameters>,
    callback: OnSuccessCallback1,
    decodeBase64 = false
  ): Promise<void> {
    try {
      log.debug("Options in getSignature", this.extensionOptions);
      if (this.extensionOptions.restorePointEnabled) {
        log.debug("Creating restore point for signing session");
        const restorePoint = await createRestorePointHash(
          this.signRequest,
          window.location.href
        );

        const restored = await this.client.useRestorePoint(restorePoint);
        if (restored) {
          log.info("We can restore previous signing session");
          this.signedObject = restored;
          this.signRequest.signingStatus = SigningStatus.signed;
          callback.onSuccess(restored.content);
          return;
        }
      }

      const response = await this.client.sign(
        this.signRequest.document,
        this.signRequest.signatureParameters(parameters),
        this.signRequest.payloadMimeType,
        decodeBase64
      );
      this.signedObject = response;
      this.signRequest.signingStatus = SigningStatus.signed;
      callback.onSuccess(response.content);
    } catch (e) {
      log.error(e);
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
      log.error("Signing request not signed");
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
