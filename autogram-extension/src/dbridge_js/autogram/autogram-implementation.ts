import {
  DesktopSignatureParameters,
  SignedDocumentResult,
} from "autogram-sdk";
import { Base64 } from "js-base64";
import { CombinedClient, createAutogramClient } from "autogram-sdk/with-ui";
import { TODO } from "../../util";
import { SigningStatus, SignRequest } from "../ditecx/sign-request";

import { ImplementationInterface } from "../ditecx/implementation";
import {
  AutogramDesktopChannel,
  AvmChannelWeb,
  WebChannelCaller,
} from "./channel/web";
import { InputObject } from "../ditecx/types";
import { DSIGNER_VERSION_JSON } from "../ditecx/dsigner-version";
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
  pageUrl: string,
  parameters: Partial<DesktopSignatureParameters>
): Promise<string> {
  const subtleCrypto = globalThis.crypto?.subtle;
  if (!subtleCrypto) {
    throw new Error("SubtleCrypto not available");
  }

  log.debug("createRestorePointHash", { signRequest, pageUrl });

  // TODO: check if restore works
  const persistentData = {
    // signatureId: signRequest.signatureId,
    signatureParams: signRequest.signatureParameters(parameters),
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
  private signedResult: SignedDocumentResult;

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
    log.debug("Autogram options in init", extensionOptions);
    return new DBridgeAutogramImpl(
      await createAutogramClient({
        mobileChannel: new AvmChannelWeb(webChannelCaller),
        desktopChannel: new AutogramDesktopChannel(webChannelCaller),
        onResetSignRequest: () => {},
        pairingEnabled: extensionOptions.notifyPairedDevices,
      }),
      extensionOptions
    );
  }

  public async launch(): Promise<void> {
    // The app is launched lazily when a signature is requested.
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
    signaturePolicyIdentifier: string
  ): Promise<void> {
    if (this.signRequest.signingStatus !== SigningStatus.new) {
      log.error("Signing non-new sign request");
    }

    // Set the sign request properties first so they can be used for hash generation
    this.signRequest.signatureId = signatureId;
    this.signRequest.digestAlgUri = digestAlgUri;
    this.signRequest.signaturePolicyIdentifier = signaturePolicyIdentifier;

    this.signRequest.signingStatus = SigningStatus.started;
  }

  public addObject(obj: InputObject): void {
    if (this.signRequest.signingStatus == SigningStatus.signed) {
      log.warn("Resetting sign request");
      this.resetSignRequest();
    }

    if (this.signRequest.signingStatus !== SigningStatus.new) {
      log.error("Adding object to non-new sign request");
    }
    log.info(obj);
    this.signRequest.addObject(obj);
  }

  /**
   * Signs the current request and returns the signed content. Any failure
   * rejects the promise; the adapter edge maps it to the portal's
   * `onError` (see {@link DSigAdapter.resolve}).
   */
  public async getSignature(
    parameters: Partial<DesktopSignatureParameters>,
    decodeBase64 = false
  ): Promise<string> {
    log.debug("Options in getSignature", this.extensionOptions);
    if (this.extensionOptions.restorePointEnabled) {
      log.debug("Creating restore point for signing session");
      const restorePoint = await createRestorePointHash(
        this.signRequest,
        window.location.href,
        parameters
      );

      if (typeof this.client.useRestorePoint !== "function") {
        log.warn("SDK client does not support restore points");
      } else {
        const restored = await this.client.useRestorePoint(restorePoint);
        if (restored) {
          log.info("We can restore previous signing session");
          this.signedResult = {
            content: restored.content,
            mimeType: "application/octet-stream",
            encoding: "base64",
            signatures: [
              { signedBy: restored.signedBy, issuedBy: restored.issuedBy },
            ],
          };
          this.signRequest.signingStatus = SigningStatus.signed;
          // Restored content is returned as-is (historical behavior).
          return restored.content;
        }
      }
    }

    const result = await this.client.sign(
      this.signRequest.documentToSign,
      this.signRequest.signatureParameters(parameters)
    );
    this.signedResult = result;
    this.signRequest.signingStatus = SigningStatus.signed;
    return decodeBase64 ? Base64.decode(result.content) : result.content;
  }

  public getSignerIdentification(): string {
    this.assertSignedRequest();
    const signatures = this.signedResult?.signatures ?? [];
    const signedBy = signatures[signatures.length - 1]?.signedBy;
    if (signedBy) {
      return signedBy;
    }
    return `CN=(Používateľ Autogramu #${this.client.getSignatureIndex()})`;
    // TODO skontrolovat ci preco nepouzivame takto riesene (asi si to pyta pred vypytanim si podpisu - kedze dsig podporuje taky flow)
    // this.signerIdentificationListeners.push(() => {
    // callback.onSuccess(this.signedResult?.signatures.at(-1)?.signedBy);
    // });
  }

  public getOriginalObject(): InputObject {
    this.assertSignedRequest();
    return this.signRequest.object;
  }

  public getVersion(): string {
    return DSIGNER_VERSION_JSON;
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
