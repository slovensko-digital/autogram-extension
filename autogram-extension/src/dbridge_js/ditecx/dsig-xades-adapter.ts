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
    this.addObject(
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

    this.addObject(
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
    this.addObject(
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
    this.log("addTxtObject", arguments);
    this.addObject(
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
    this.addObject(
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

  /* XAdES_ZEP v1.1/v2.0 data envelopes are not supported by Autogram;
   * fail via onError so the portal shows an error instead of hanging
   * (schranka.slovensko.sk calls these for XadesZepSignatureVersion 1.1/2.0). */
  sign11(
    signatureId,
    digestAlgUri,
    signaturePolicyIdentifier,
    dataEnvelopeId,
    dataEnvelopeURI,
    dataEnvelopeDescr,
    callback
  ) {
    this.unsupported("sign11", callback);
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
    this.unsupported("sign20", callback);
  }

  // ---------------
  /**
   * Autogram includes the signing time itself; the GUI-display preference
   * has no equivalent, so this succeeds as a no-op (schranka.slovensko.sk
   * calls it before every XAdES `sign` and waits for the callback).
   */
  setSigningTimeProcessing(displayGui, includeSigningTime, callback) {
    this.log("setSigningTimeProcessing", arguments);
    callback?.onSuccess?.();
  }
  setWindowSize(width, height, callback) {
    this.stub("", arguments);
    callback.onSuccess();
  }
  getSignedXmlWithEnvelope(callback) {
    this.log("getSignedXmlWithEnvelope", arguments);
    this.getSignature(
      {
        container: undefined,
        containerXmlns: undefined,
        level: "XAdES_BASELINE_B",
        packaging: "ENVELOPING",
      },
      callback,
      true
    );
  }
  getSignedXmlWithEnvelopeBase64(callback) {
    this.log("getSignedXmlWithEnvelopeBase64", arguments);
    this.getSignature(
      { container: "ASiC_E", packaging: "ENVELOPED" },
      callback
    );
  }
  getSignedXmlWithEnvelopeGZipBase64(callback) {
    this.unsupported("getSignedXmlWithEnvelopeGZipBase64", callback);
  }
  getSigningTime(callback) {
    this.unsupported("getSigningTime", callback);
  }
  getSigningCertificate(callback) {
    this.unsupported("getSigningCertificate", callback);
  }
  loadConfiguration(configsZipBase64, callback) {
    this.unsupported("loadConfiguration", callback);
  }
  getSignedXmlWithEnvelopeAndTimeStamp(callback) {
    this.unsupported("getSignedXmlWithEnvelopeAndTimeStamp", callback);
  }
  getSignedXmlWithEnvelopeAndTimeStampBase64(callback) {
    this.unsupported("getSignedXmlWithEnvelopeAndTimeStampBase64", callback);
  }
  getSignedXmlWithEnvelopeAndTimeStampGZipBase64(callback) {
    this.unsupported(
      "getSignedXmlWithEnvelopeAndTimeStampGZipBase64",
      callback
    );
  }
  getSignatureTimeStampTokenBase64(callback) {
    this.unsupported("getSignatureTimeStampTokenBase64", callback);
  }
  getSignatureTimeStampCert(callback) {
    this.unsupported("getSignatureTimeStampCert", callback);
  }
  getSignatureTimeStampTime(callback) {
    this.unsupported("getSignatureTimeStampTime", callback);
  }
  getTSAIdentification(callback) {
    this.unsupported("getTSAIdentification", callback);
  }
  getSignatureTimeStampRequestBase64(reqPolicy, digestAlgUri, callback) {
    this.unsupported("getSignatureTimeStampRequestBase64", callback);
  }
  getSignatureTimeStampRequest2Base64(
    reqPolicy,
    digestAlgUri,
    nonce,
    certReq,
    extensions,
    callback
  ) {
    this.unsupported("getSignatureTimeStampRequest2Base64", callback);
  }
  createXAdESZepT(tsResponseB64, tsCertB64, callback) {
    this.unsupported("createXAdESZepT", callback);
  }
}
