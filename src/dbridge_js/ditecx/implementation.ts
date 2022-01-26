import { apiClient, Document } from "@octosign/client";
import { logMessage } from "../../audit/inject";
import { OctoSwitcherError } from "../../error";
import { isSafari, TODO } from "../../util";
import { DSigAdapter } from "./dsig-adapter";
import {
  InputObject,
  PartialSignerParameters,
  SignRequest,
} from "./sign-request";

const AVAILABLE_LANGUAGES = ["sk", "en"];
export class DBridgeOctosignImpl {
  private client: ReturnType<typeof apiClient>;
  private signRequest: SignRequest;
  private language = "sk";
  private signedObject: Document;
  private _adapter: DSigAdapter;

  constructor() {
    let serverProtocol = "http";
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

    this.signRequest = new SignRequest();
  }

  setAdapter(adapter: DSigAdapter): void {
    if (this._adapter) throw new OctoSwitcherError("Adapter already set");
    this._adapter = adapter;
  }

  async launch(callback: OnSuccessCallback): Promise<void> {
    try {
      const info = await this.client.info();
      if (info.status != "READY") throw new Error("Wait for server");
    } catch (e) {
      console.error(e);
      const url = this.client.getLaunchURL();
      window.open(url);
      const info = await this.client.waitForStatus("READY", 100, 5);
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
    // console.log(this.signatureParameters);
    this.signRequest.signatureId = signatureId;
    this.signRequest.digestAlgUri = digestAlgUri;
    this.signRequest.signaturePolicyIdentifier = signaturePolicyIdentifier;
    this.signRequest.signStarted = true;
    // this.launch(callback);
    callback.onSuccess();
  }

  addObject(obj: InputObject, callback: OnSuccessCallback): void {
    console.log(obj);
    this.signRequest.addObject(obj);
    callback.onSuccess();
  }

  async getSignature(
    parameters: PartialSignerParameters,
    callback: OnSuccessCallback1
  ): Promise<void> {
    this.client
      .sign(
        this.signRequest.document,
        this.signRequest.signatureParameters(parameters),
        this.signRequest.payloadMimeType
      )
      .then((signedObject) => {
        TODO("restart SignRequest?");
        this.signRequest.signStarted = false;
        this.signedObject = signedObject;
        callback.onSuccess(this.signedObject.content);
      });
    logMessage({
      class: this.constructor.name,
      msg: "Prepnite sa do Octosign okna",
    });
  }

  getSignerIdentification(callback: OnSuccessCallback1): void {
    TODO("Signer identification missing in octosign");

    logMessage({
      class: this.constructor.name,
      msg: "Chybajuca metoda getSignerIdentification",
    });
    callback.onSuccess(`CN=Tester Testovic`);
  }

  getOriginalObject(callback: OnSuccessCallback1) {
    callback.onSuccess(this.signRequest.object);
  }
}

interface OnSuccessCallback {
  onSuccess: () => void;
}
interface OnSuccessCallback1 {
  onSuccess: (v) => void;
}

interface OnErrorCallback {
  onError: (e) => void;
}
