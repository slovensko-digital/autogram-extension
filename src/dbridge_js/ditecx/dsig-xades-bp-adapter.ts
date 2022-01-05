/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { DSigAdapter } from "./dsig-adapter";

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
    this.__implementation.addObject(
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
  setLanguage(lang) {
    this.log("setLanguage", arguments);
    this.__implementation.language = lang;
  }

  getSignerIdentification(callback) {
    this.log("getSignerIdentification", arguments);
    this.__implementation.getSignerIdentification(callback);
  }
  getSignatureWithASiCEnvelopeBase64(callback) {
    this.log("getSignatureWithASiCEnvelopeBase64", arguments);
    this.__implementation.getSignatureWithASiCEnvelopeBase64(callback);
  }

  deploy(options, callback) {
    this.log("deploy", arguments);
    callback.onSuccess();
  }

  getConvertedPDFA(cb) {
    this.log("getConvertedPDFA", arguments);
  }

  addTxtObject(
    objectId,
    objectDescription,
    sourceTxt,
    objectFormatIdentifier,
    callback
  ) {
    this.log("addTxtObject", arguments);
    this.__implementation.addObject(
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
    this.__implementation.addObject(
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
}
