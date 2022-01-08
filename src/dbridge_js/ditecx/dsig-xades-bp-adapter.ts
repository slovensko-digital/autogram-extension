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
    this.stub("addXmlObject2", arguments);
  }

  getSignerIdentification(callback) {
    this.log("getSignerIdentification", arguments);
    this.__implementation.getSignerIdentification(callback);
  }
  getSignatureWithASiCEnvelopeBase64(callback) {
    this.log("getSignatureWithASiCEnvelopeBase64", arguments);
    this.__implementation.getSignature(
      { container: "ASICE", packaging: "ENVELOPING", level: "BASELINE_B" },
      callback
    );
  }

  deploy(options, callback) {
    this.log("deploy", arguments);
    callback.onSuccess();
  }

  getConvertedPDFA(callback) {
    this.stub("getConvertedPDFA", arguments);
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
