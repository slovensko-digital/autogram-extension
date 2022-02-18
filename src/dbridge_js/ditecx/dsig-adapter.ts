/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-empty-function */

import { logMessage } from "../../audit/inject";
import { DBridgeOctosignImpl } from "./implementation";

/* eslint-disable @typescript-eslint/no-unused-vars */
export class DSigAdapter {
  _ready = true;
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

  __implementation: DBridgeOctosignImpl;

  constructor(implementation: DBridgeOctosignImpl) {
    this.__implementation = implementation;
    // this.__implementation.setAdapter(this);
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

  getVersion(callback) {
    this.stub("getVersion");
    const fakeVersion =
      '{"name":"D.Signer/XAdES BP Java","version":"2.0.0.23","plugins":[{"name":"sk.ditec.zep.dsigner.xades.bp.plugins.xmlplugin.XmlBpPlugin","version":"2.0.0.23"},{"name":"sk.ditec.zep.dsigner.xades.bp.plugins.txtplugin.TxtBpPlugin","version":"2.0.0.23"},{"name":"sk.ditec.zep.dsigner.xades.bp.plugins.pngplugin.PngBpPlugin","version":"2.0.0.23"},{"name":"sk.ditec.zep.dsigner.xades.bp.plugins.pdfplugin.PdfBpPlugin","version":"2.0.0.23"}]}';
    callback(fakeVersion);
  }

  log(...rest: any[]): void {
    console.log(this.constructor.name, ...rest);
    logMessage({
      type: "info",
      class: this.constructor.name,
      msg: JSON.stringify(rest[0]),
    });
  }

  stub(name: string, ...rest: any[]): void {
    this.log(name, ...rest);
    alert(`Stubbed ${this.constructor.name} method: \n\n${name}`);
  }

  checkPDFACompliance(sourcePdfBase64, password, reqLevel, callback) {
    this.stub("checkPDFACompliance", arguments);
    callback.onSuccess();
  }
  convertToPDFA(sourcePdfBase64, password, reqLevel, callback) {
    this.stub("convertToPDFA", arguments);
    callback.onSuccess();
  }
  getConvertedPDFA(callback) {
    this.stub("getConvertedPDFA", arguments);
    this.__implementation.getOriginalObject(callback);
  }
}
