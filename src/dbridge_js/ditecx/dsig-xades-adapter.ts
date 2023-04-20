/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { DSigAdapter } from "./dsig-base-adapter";

export class DSigXadesAdapter extends DSigAdapter {
  addXmlObject(
    objectId: string,
    objectDescription: string,
    sourceXml: string,
    sourceXsd: string,
    namespaceUri: string,
    xsdReference: string,
    sourceXsl: string,
    xslReference: string,
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
    this.__implementation.addObject(
      {
        type: "XadesPdf",
        objectId,
        objectDescription,
        sourcePdfBase64,
        password,
        objectFormatIdentifier,
        reqLevel,
        convert,
      },
      callback
    );
  }
  addTxtObject(
    objectId,
    objectDescription,
    sourceTxt,
    objectFormatIdentifier,
    callback
  ) {
    this.stub("addTxtObject", arguments);
    this.__implementation.addObject(
      {
        type: "XadesBpTxt",
        objectId,
        objectDescription,
        objectFormatIdentifier,
        sourceTxt,
      },
      callback
    );
  }
  addPngObject(
    objectId,
    objectDescription,
    sourcePngBase64,
    objectFormatIdentifier,
    callback
  ) {
    // this.stub("addPngObject", arguments);
    this.__implementation.addObject(
      {
        type: "XadesPng",
        objectId,
        objectDescription,
        objectFormatIdentifier,
        sourcePngBase64,
      },
      callback
    );
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
  setCertificateFilter(filterID, callback) {
    this.stub("", arguments);
  }
  getSignedXmlWithEnvelope(callback) {
    this.log("getSignedXmlWithEnvelope", arguments);
    this.__implementation.getSignature(
      {
        container: null,
        containerXmlns: null,
        level: "XAdES_BASELINE_B",
        packaging: "ENVELOPING",
      },
      callback,
      true
    );
  }
  getSignedXmlWithEnvelopeBase64(callback) {
    this.log("getSignedXmlWithEnvelopeBase64", arguments);
    this.__implementation.getSignature(
      { container: "ASiC_E", packaging: "ENVELOPED" },
      callback
    );
  }
  getSignedXmlWithEnvelopeGZipBase64(callback) {
    this.stub("getSignedXmlWithEnvelopeGZipBase64", arguments);
  }
  getSigningTime(callback) {
    this.stub("getSigningTime", arguments);
  }
  getSigningCertificate(callback) {
    this.stub("getSigningCertificate", arguments);
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
