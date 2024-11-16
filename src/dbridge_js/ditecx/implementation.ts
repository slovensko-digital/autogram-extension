import { DesktopSignatureParameters } from "autogram-sdk";
import { InputObject } from "./types";

export interface ImplementationInterface {
  launch(callback: OnSuccessCallback): Promise<void>;
  setLanguage(language: string): void;
  sign(
    signatureId: string,
    digestAlgUri: string,
    signaturePolicyIdentifier: string,
    callback: OnSuccessCallback & OnErrorCallback
  ): Promise<void>;
  addObject(obj: InputObject, callback: OnSuccessCallback): void;
  getSignature(
    parameters: Partial<DesktopSignatureParameters>,
    callback: OnSuccessCallback1,
    decodeBase64?: boolean
  ): Promise<void>;
  getSignerIdentification(callback: OnSuccessCallback1): void;
  getOriginalObject(callback: OnSuccessCallback1): void;
  getVersion(callback: OnSuccessCallback1): void;
}

export interface OnSuccessCallback {
  onSuccess: () => void;
}
export interface OnSuccessCallback1<T = unknown> {
  onSuccess: (v: T) => void;
  onError?: (v) => void;
}

export interface OnErrorCallback {
  onError: (e) => void;
}
