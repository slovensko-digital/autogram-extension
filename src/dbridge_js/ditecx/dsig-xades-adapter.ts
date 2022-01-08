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
    this.stub("addXmlObject2", arguments);
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
    this.stub("addPdfObject", arguments);
  }
  addTxtObject(
    objectId,
    objectDescription,
    sourceTxt,
    objectFormatIdentifier,
    callback
  ) {
    this.stub("addTxtObject", arguments);
  }
  addPngObject(
    objectId,
    objectDescription,
    sourcePngBase64,
    objectFormatIdentifier,
    callback
  ) {
    this.stub("addPngObject", arguments);
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
    this.stub("sign11", arguments);
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
    this.stub("sign20", arguments);
  }

  // ---------------
  setSigningTimeProcessing(displayGui, includeSigningTime, callback) {
    this.stub("setSigningTimeProcessing", arguments);
  }
  setWindowSize(width, height, callback) {
    this.stub("", arguments);
  }
  checkPDFACompliance(sourcePdfBase64, password, reqLevel, callback) {
    this.stub("", arguments);
  }
  convertToPDFA(sourcePdfBase64, password, reqLevel, callback) {
    this.stub("", arguments);
  }
  setCertificateFilter(filterID, callback) {
    this.stub("", arguments);
  }
  getSignedXmlWithEnvelope(callback) {
    this.stub("getSignedXmlWithEnvelope", arguments);
  }
  getSignedXmlWithEnvelopeBase64(callback) {
    this.log("getSignedXmlWithEnvelopeBase64", arguments);
    this.__implementation.getSignature(
      { container: "ASICE", packaging: "ENVELOPED" },
      callback
    );
  }
  getSignedXmlWithEnvelopeGZipBase64(callback) {
    this.stub("getSignedXmlWithEnvelopeGZipBase64", arguments);
  }
  getSignerIdentification(callback) {
    this.stub("getSignerIdentification", arguments);
  }
  getSigningTime(callback) {
    this.stub("getSigningTime", arguments);
  }
  getConvertedPDFA(callback) {
    this.stub("getConvertedPDFA", arguments);
  }
  getSigningCertificate(callback) {
    this.stub("getSigningCertificate", arguments);
  }
  getVersion(callback) {
    this.stub("getVersion", arguments);
  }
  loadConfiguration(configsZipBase64, callback) {
    this.stub("loadConfiguration", arguments);
  }
  getSignedXmlWithEnvelopeAndTimeStamp(callback) {
    this.stub("getSignedXmlWithEnvelopeAndTimeStamp", arguments);
  }
  getSignedXmlWithEnvelopeAndTimeStampBase64(callback) {
    this.stub("getSignedXmlWithEnvelopeAndTimeStampBase64", arguments);
  }
  getSignedXmlWithEnvelopeAndTimeStampGZipBase64(callback) {
    this.stub("getSignedXmlWithEnvelopeAndTimeStampGZipBase64", arguments);
  }
  getSignatureTimeStampTokenBase64(callback) {
    this.stub("getSignatureTimeStampTokenBase64", arguments);
  }
  getSignatureTimeStampCert(callback) {
    this.stub("getSignatureTimeStampCert", arguments);
  }
  getSignatureTimeStampTime(callback) {
    this.stub("getSignatureTimeStampTime", arguments);
  }
  getTSAIdentification(callback) {
    this.stub("getTSAIdentification", arguments);
  }
  getSignatureTimeStampRequestBase64(reqPolicy, digestAlgUri, callback) {
    this.stub("getSignatureTimeStampRequestBase64", arguments);
  }
  getSignatureTimeStampRequest2Base64(
    reqPolicy,
    digestAlgUri,
    nonce,
    certReq,
    extensions,
    callback
  ) {
    this.stub("getSignatureTimeStampRequest2Base64", arguments);
  }
  createXAdESZepT(tsResponseB64, tsCertB64, callback) {
    this.stub("createXAdESZepT", arguments);
  }
}
