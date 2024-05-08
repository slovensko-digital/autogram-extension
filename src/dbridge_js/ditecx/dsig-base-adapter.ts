/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-empty-function */

import { ImplementationInterface } from "./implementation";

/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Base Class that has same interface as DSig* objects used by dSigner
 * (eg. dSigXadesAdapter, dSigXadesBpAdapter)
 *
 * internally uses __implementation to call methods on the actual implementation
 */
export class DSigAdapter {
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

  initialize(callback: { onSuccess: () => void }): void {
    this.log("initalize", arguments);
    this.__implementation.launch(callback);
  }

  sign(signatureId, digestAlgUri, signaturePolicyIdentifier, callback): void {
    this.log("sign", arguments);
    this.__implementation.sign(
      signatureId,
      digestAlgUri,
      signaturePolicyIdentifier,
      callback
    );
  }

  setLanguage(language, callback) {
    this.log("setLanguage", arguments);
    this.__implementation.setLanguage(language);
  }

  log(...rest: unknown[]): void {
    console.log(this.constructor.name, ...rest);
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
    this.__implementation.getOriginalObject(callback);
  }

  getVersion(callback) {
    this.log("getVersion", arguments);
    this.__implementation.getVersion(callback);
  }

  getSignerIdentification(callback) {
    this.log("getSignerIdentification", arguments);
    this.__implementation.getSignerIdentification(callback);
  }
}
