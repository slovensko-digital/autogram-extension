/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { DSigAdapter } from "./dsig-adapter";

export class DSigXadesAdapter extends DSigAdapter {
  addXmlObject(
    objectId,
    objectDescription,
    sourceXml,
    sourceXsd,
    namespaceUri,
    xsdReference,
    sourceXsl,
    xslReference,
    callback
  ) {
    this.log("addXmlObject", arguments);
    this.__implementation.addObject(
      {
        type: "XadesXml",
        objectId,
        objectDescription,
        sourceXml,
        sourceXsd,
        namespaceUri,
        xsdReference,
        sourceXsl,
        xslReference,
      },
      callback
    );
  }

  addXmlObject2(
    objectId,
    objectDescription,
    sourceXml,
    sourceXsd,
    namespaceUri,
    xsdReference,
    sourceXsl,
    xslReference,
    transformType,
    callback
  ) {
    this.log("addXmlObject2", arguments);
  }

  addPdfObject(
    objectId,
    objectDescription,
    sourcePdfBase64,
    password,
    objectFormatIdentifier,
    reqLevel,
    convert,
    callback
  ) {
    this.log("addPdfObject", arguments);
  }
  addTxtObject(
    objectId,
    objectDescription,
    sourceTxt,
    objectFormatIdentifier,
    callback
  ) {
    this.log("addTxtObject", arguments);
  }
  addPngObject(
    objectId,
    objectDescription,
    sourcePngBase64,
    objectFormatIdentifier,
    callback
  ) {
    this.log("addPngObject", arguments);
  }

  sign11(
    signatureId,
    digestAlgUri,
    signaturePolicyIdentifier,
    dataEnvelopeId,
    dataEnvelopeURI,
    dataEnvelopeDescr,
    callback
  ) {
    this.log("sign11", arguments);
  }
  sign20(
    signatureId,
    digestAlgUri,
    signaturePolicyIdentifier,
    dataEnvelopeId,
    dataEnvelopeURI,
    dataEnvelopeDescr,
    callback
  ) {
    this.log("sign20", arguments);
  }

  getSignedXmlWithEnvelope(cb) {
    this.log("getSignedXmlWithEnvelope", arguments);
  }

  checkPDFACompliance(sourcePdfBase64, password, reqLevel, callback) {
    this.log("checkPDFACompliance", arguments);
  }
  convertToPDFA(sourcePdfBase64, password, reqLevel, callback) {
    this.log("convertToPDFA", arguments);
  }
  getConvertedPDFA(cb) {
    this.log("getConvertedPDFA", arguments);
  }

  setSigningTimeProcessing(displayGui, includeSigningTime, callback) {
    this.log("setSigningTimeProcessing", arguments);
  }

  getSignedXmlWithEnvelopeBase64(cb) {
    this.log("getSignedXmlWithEnvelopeBase64", arguments);
  }
}
