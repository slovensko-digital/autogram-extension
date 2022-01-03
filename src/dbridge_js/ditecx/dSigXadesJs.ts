/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { baseDSig, Callback } from "./baseDSig";

function log(...rest) {
  console.log("dSigXadesJs", ...rest);
}

export const dSigXadesJs = {
  ...baseDSig,
  setSigningTimeProcessing: function (
    displayGui,
    includeSigningTime,
    callback
  ) {
    log("setSigningTimeProcessing", arguments);
  },
  getSignedXmlWithEnvelopeBase64: function (cb) {
    log("getSignedXmlWithEnvelopeBase64", arguments);
  },

  addXmlObject: function (
    objectId,
    objectDescription,
    sourceXml,
    sourceXsd,
    namespaceUri,
    xsdReference,
    sourceXsl,
    xslReference,
    callback: Callback
  ) {
    log("addXmlObject", arguments);
    callback.onSuccess();
  },
  addXmlObject2: function (
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
    log("addXmlObject2", arguments);
  },

  sign11: function (
    signatureId,
    digestAlgUri,
    signaturePolicyIdentifier,
    dataEnvelopeId,
    dataEnvelopeURI,
    dataEnvelopeDescr,
    callback
  ) {
    log("sign11", arguments);
  },
  sign20: function (
    signatureId,
    digestAlgUri,
    signaturePolicyIdentifier,
    dataEnvelopeId,
    dataEnvelopeURI,
    dataEnvelopeDescr,
    callback
  ) {
    log("sign20", arguments);
  },

  addPdfObject: function (
    objectId,
    objectDescription,
    sourcePdfBase64,
    password,
    objectFormatIdentifier,
    reqLevel,
    convert,
    callback
  ) {
    log("addPdfObject", arguments);
  },
  checkPDFACompliance: function (
    sourcePdfBase64,
    password,
    reqLevel,
    callback
  ) {
    log("checkPDFACompliance", arguments);
  },
  convertToPDFA: function (sourcePdfBase64, password, reqLevel, callback) {
    log("convertToPDFA", arguments);
  },
  getConvertedPDFA: function (cb) {
    log("getConvertedPDFA", arguments);
  },

  addTxtObject: function (
    objectId,
    objectDescription,
    sourceTxt,
    objectFormatIdentifier,
    callback
  ) {
    log("addTxtObject", arguments);
  },
  addPngObject: function (
    objectId,
    objectDescription,
    sourcePngBase64,
    objectFormatIdentifier,
    callback
  ) {
    log("addPngObject", arguments);
  },

  getSignedXmlWithEnvelope: function (cb) {
    log("getSignedXmlWithEnvelope", arguments);
  },
};
