/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { baseDSig, Callback } from "./baseDSig";

function log(...rest) {
  console.log("dSigXadesBpJs", ...rest);
}

export const dSigXadesBpJs = {
  ...baseDSig,
  addXmlObject: function (
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
    callback: Callback
  ) {
    log("addXmlObject", arguments);
    const o = callback.onSuccess();
    console.log(o);
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
    callback: Callback
  ) {
    log("addXmlObject2", arguments);
  },
  setLanguage: function (lang) {
    log("setLanguage", arguments);
  },

  getSignerIdentification: function (cb) {
    log("getSignerIdentification", arguments);
  },
  getSignatureWithASiCEnvelopeBase64: function (cb) {
    log("getSignatureWithASiCEnvelopeBase64", arguments);
  },

  deploy: function (options, callback: Callback) {
    log("deploy", arguments);
    callback.onSuccess();
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
};
