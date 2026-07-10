/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { DSigAdapter } from "./dsig-base-adapter";

export class DSigXadesBpAdapter extends DSigAdapter {
  addXmlObject(
    objectId,
    objectDescription,
    objectFormatIdentifier,
    xdcXMLData,
    xdcIdentifier,
    xdcVersion,
    xdcUsedXSD,
    xsdReferenceURI,
    xdcUsedXSLT,
    xslReferenceURI,
    xslMediaDestinationTypeDescription,
    xslXSLTLanguage,
    xslTargetEnvironment,
    xdcIncludeRefs,
    xdcNamespaceURI,
    callback
  ): void {
    this.log("addXmlObject", arguments);
    this.addObject(
      {
        type: "XadesBpXml",
        objectId,
        objectDescription,
        objectFormatIdentifier,
        xdcXMLData,
        xdcIdentifier,
        xdcVersion,
        xdcUsedXSD,
        xsdReferenceURI,
        xdcUsedXSLT,
        xslReferenceURI,
        xslMediaDestinationTypeDescription,
        xslXSLTLanguage,
        xslTargetEnvironment,
        xdcIncludeRefs,
        xdcNamespaceURI,
      },
      callback
    );
  }

  addXmlObject2(
    objectId,
    objectDescription,
    objectFormatIdentifier,
    xdcXDCB64,
    xdcUsedXSD,
    xdcUsedXSLT,
    callback
  ) {
    this.log("addXmlObject2", arguments);

    this.addObject(
      {
        type: "XadesBp2Xml",
        objectId,
        objectDescription,
        objectFormatIdentifier,
        xdcXDCB64,
        xdcUsedXSD,
        xdcUsedXSLT,
      },
      callback
    );
  }

  getSignatureWithASiCEnvelopeBase64(callback) {
    this.log("getSignatureWithASiCEnvelopeBase64", arguments);
    this.getSignature(
      {
        container: "ASiC_E",
        packaging: "ENVELOPING",
        level: "XAdES_BASELINE_B",
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
        sourceTxt,
        objectFormatIdentifier,
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
    this.log("addPngObject", arguments);
    this.addObject(
      {
        type: "XadesBpPng",
        objectId,
        objectDescription,
        sourcePngBase64,
        objectFormatIdentifier,
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
        type: "XadesBpPdf",
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

  setWindowSize(
    width,
    height,
    callback
  ) {
    this.stub("setWindowSize", arguments);
    callback.onSuccess();
  }

  /* Revocation checking and mobile-signing policy are Autogram's own
   * concern; acknowledge the portal's configuration and continue. */
  setRevocationChecking(ocspCheck, crlCheck, ocspCertIdHashAlgorithm, callback) {
    this.log("setRevocationChecking", arguments);
    callback?.onSuccess?.();
  }
  disableMobileSigning(callback) {
    this.log("disableMobileSigning", arguments);
    callback?.onSuccess?.();
  }

  /* Rest of the live dSigXadesBpJs surface (v1.5.4.0). Not provided by
   * Autogram — fail via onError instead of a TypeError or a hang. */
  getSigningTime(callback) {
    this.unsupported("getSigningTime", callback);
  }
  getSigningCertificate(callback) {
    this.unsupported("getSigningCertificate", callback);
  }
  loadConfiguration(configsZipBase64, callback) {
    this.unsupported("loadConfiguration", callback);
  }
  getSignatureAndTimeStampWithASiCEnvelopeBase64(callback) {
    this.unsupported(
      "getSignatureAndTimeStampWithASiCEnvelopeBase64",
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
  createXAdESZepBpT(tsResponseB64, tsCertB64, callback) {
    this.unsupported("createXAdESZepBpT", callback);
  }
  getIndividualDataObjectsTimeStampRequestBase64(
    reqPolicy,
    digestAlgUri,
    nonce,
    certReq,
    extensions,
    objectIds,
    callback
  ) {
    this.unsupported(
      "getIndividualDataObjectsTimeStampRequestBase64",
      callback
    );
  }
  submitIndividualDataObjectsTimeStampResponse(
    tsResponseB64,
    tsCertB64,
    callback
  ) {
    this.unsupported(
      "submitIndividualDataObjectsTimeStampResponse",
      callback
    );
  }
}
