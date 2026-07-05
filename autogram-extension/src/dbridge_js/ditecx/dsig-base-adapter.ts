/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-empty-function */

import { DesktopSignatureParameters } from "autogram-sdk";
import { createLogger } from "../../log";
import { DitecCallback, ImplementationInterface } from "./implementation";
import { InputObject, toDitecError } from "./types";

const log = createLogger("ag-ext.dsig-base-adapter");

/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Base Class that has same interface as DSig* objects used by dSigner
 * (eg. dSigXadesAdapter, dSigXadesBpAdapter)
 *
 * internally uses __implementation to call methods on the actual
 * implementation. This class is also the single edge where the
 * promise-based {@link ImplementationInterface} is adapted back to the
 * Ditec `{onSuccess, onError}` convention (see {@link resolve}).
 */
export class DSigAdapter {
  /** used on financnasprava.sk to determine if they call detectSupportedPlatforms()+deploy() */
  _ready = true; // TODO: check why it was removed,

  // Constants
  SHA1 = "http://www.w3.org/2000/09/xmldsig#sha1";
  SHA256 = "http://www.w3.org/2001/04/xmlenc#sha256";
  SHA384 = "http://www.w3.org/2001/04/xmldsig-more#sha384";
  SHA512 = "http://www.w3.org/2001/04/xmlenc#sha512";
  LANG_SK = "SK";
  LANG_EN = "EN";
  XML_VISUAL_TRANSFORM_TXT = "TXT";
  XML_VISUAL_TRANSFORM_HTML = "HTML";
  PDF_CONFORMANCE_LEVEL_1A = 0;
  PDF_CONFORMANCE_LEVEL_1B = 1;
  PDF_CONFORMANCE_LEVEL_NONE = 2;
  ERROR_SIGNING_CANCELLED = 1;

  protected __implementation: ImplementationInterface;

  constructor(implementation: ImplementationInterface) {
    this.__implementation = implementation;
  }

  /**
   * Runs `work` and fulfils a Ditec-style callback from its result: a
   * resolved value goes to `onSuccess`, any rejection (or synchronous
   * throw) is mapped to a Ditec error object and goes to `onError`.
   *
   * Wrapping `work` in `Promise.resolve().then(...)` means even a
   * synchronous throw inside `work` reaches `onError` instead of being
   * lost — swallowed-error bugs become hard to write.
   */
  protected resolve<T>(
    work: () => Promise<T> | T,
    callback: DitecCallback<T>
  ): void {
    Promise.resolve()
      .then(work)
      .then(
        (value) => callback.onSuccess(value),
        (error) => {
          log.error("implementation call failed", error);
          callback.onError?.(toDitecError(error));
        }
      );
  }

  /** Shimmed entry point used by the concrete `add*Object` methods. */
  protected addObject(obj: InputObject, callback: DitecCallback): void {
    this.resolve(() => this.__implementation.addObject(obj), callback);
  }

  /** Shimmed entry point used by the concrete `getSigned*` methods. */
  protected getSignature(
    parameters: Partial<DesktopSignatureParameters>,
    callback: DitecCallback<string>,
    decodeBase64 = false
  ): void {
    this.resolve(
      () => this.__implementation.getSignature(parameters, decodeBase64),
      callback
    );
  }

  initialize(callback: DitecCallback): void {
    this.log("initalize", arguments);
    this.resolve(() => this.__implementation.launch(), callback);
  }

  sign(signatureId, digestAlgUri, signaturePolicyIdentifier, callback): void {
    this.log("sign", arguments);
    this.resolve(
      () =>
        this.__implementation.sign(
          signatureId,
          digestAlgUri,
          signaturePolicyIdentifier
        ),
      callback
    );
  }

  setLanguage(language, callback) {
    this.log("setLanguage", arguments);
    this.__implementation.setLanguage(language);
  }

  log(...rest: unknown[]): void {
    log.debug(this.constructor.name, ...rest);
  }

  stub(name: string, ...rest: unknown[]): void {
    this.log(name, ...rest);
    // alert(`Stubbed ${this.constructor.name} method: \n\n${name}`);
    console.warn(`Stubbed ${this.constructor.name} method: \n\n${name}`);
  }

  checkPDFACompliance(sourcePdfBase64, password, reqLevel, callback) {
    this.stub("checkPDFACompliance", arguments);
    callback.onSuccess();
    // callback.onError();
  }
  convertToPDFA(sourcePdfBase64, password, reqLevel, callback) {
    this.stub("convertToPDFA", arguments);
    callback.onSuccess();
  }
  getConvertedPDFA(callback) {
    this.stub("getConvertedPDFA", arguments);
    this.resolve(() => this.__implementation.getOriginalObject(), callback);
  }

  getVersion(callback) {
    this.log("getVersion", arguments);
    this.resolve(() => this.__implementation.getVersion(), callback);
  }

  getSignerIdentification(callback) {
    this.log("getSignerIdentification", arguments);
    this.resolve(() => this.__implementation.getSignerIdentification(), callback);
  }

  detectSupportedPlatforms(platforms, callback) {
    this.log({ platforms });

    // callback.onSuccess(["autogram"]);
    callback.onSuccess(["java"]);
  }
}
