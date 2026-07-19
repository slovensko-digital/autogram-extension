import { DesktopSignatureParameters } from "autogram-sdk";
import { InputObject } from "./types";

/**
 * Promise-based interface for the signer implementation.
 *
 * look for the implementation in `autogram-implementation.ts`
 * which implements Autogram(s) using autogram-sdk.
 *
 * The Ditec `{onSuccess, onError}` callback convention that portals expect
 * is shimmed once at the adapter edge ({@link DSigAdapter}): each method
 * here returns a value (or a promise of one), and the adapter routes a
 * resolved value to `onSuccess` and a rejection to `onError`. A rejected
 * promise therefore always reaches `onError`, which makes it structurally
 * hard to swallow an error.
 */
export interface ImplementationInterface {
  launch(): Promise<void>;
  setLanguage(language: string): void;
  sign(
    signatureId: string,
    digestAlgUri: string,
    signaturePolicyIdentifier: string
  ): Promise<void>;
  addObject(obj: InputObject): void;
  getSignature(
    parameters: Partial<DesktopSignatureParameters>,
    decodeBase64?: boolean
  ): Promise<string>;
  getSignerIdentification(): string;
  getOriginalObject(): InputObject;
  getVersion(): string;
}

/**
 * Ditec-style callback pair passed by portal code to the `dSigXades*`
 * adapter methods. The adapter fulfils it from the promise-based
 * {@link ImplementationInterface}.
 */
export interface DitecCallback<T = unknown> {
  onSuccess: (value?: T) => void;
  onError?: (error: unknown) => void;
}
