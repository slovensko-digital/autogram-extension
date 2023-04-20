export interface ObjectXadesXml {
  type: "XadesXml";
  objectId: string;
  objectDescription: string;
  /** data */
  sourceXml: string;
  sourceXsd: string;
  namespaceUri: string;
  xsdReference: string;
  sourceXsl: string;
  xslReference: string;
}

export interface ObjectXadesBpXml {
  type: "XadesBpXml";
  objectId: string;
  objectDescription: string;
  objectFormatIdentifier: string;
  /** data */
  xdcXMLData: string;
  xdcIdentifier: string;
  xdcVersion: string;
  xdcUsedXSD: string;
  xsdReferenceURI;
  xdcUsedXSLT: string;
  xslReferenceURI: string;
  xslMediaDestinationTypeDescription;
  xslXSLTLanguage: string;
  xslTargetEnvironment: string;
  xdcIncludeRefs: boolean;
  xdcNamespaceURI: string;
}

export interface ObjectXades2Xml {
  type: "Xades2Xml";
  objectId: string;
  objectDescription: string;
  /** data */
  sourceXml: string;
  sourceXsd: string;
  namespaceUri: string;
  xsdReference: string;
  sourceXsl: string;
  xslReference: string;
  transformType: string;
}

export interface ObjectXadesBp2Xml {
  type: "XadesBp2Xml";
  objectId: string;
  objectDescription: string;
  namespaceUri: string;
  /** data */
  sourceXml: string;
  sourceXsd: string;
  sourceXsl: string;
}

export interface ObjectXadesBpTxt {
  type: "XadesBpTxt";
  objectId: string;
  objectDescription: string;
  /** data */
  sourceTxt;
  objectFormatIdentifier: string;
}

export interface ObjectXadesBpPng {
  type: "XadesBpPng" | "XadesPng";
  objectId: string;
  objectDescription: string;
  /** data */
  sourcePngBase64: string;
  objectFormatIdentifier: string;
}

export interface ObjectXadesPdf {
  type: "XadesPdf" | "XadesBpPdf";
  objectId: string;
  objectDescription: string;
  /** data */
  sourcePdfBase64: string;
  password: string;
  objectFormatIdentifier: string;
  reqLevel: number;
  convert: boolean;
}

export type InputObject =
  | ObjectXadesXml
  | ObjectXadesBpXml
  | ObjectXades2Xml
  | ObjectXadesBpTxt
  | ObjectXadesBpPng
  | ObjectXadesPdf
  | ObjectXadesBp2Xml;

export interface FullSignerParameters {
  identifier: null | string;
  version: null | string;
  format: "PADES" | "XADES";
  level: "PADES_BASELINE_B" | "XADES_BASELINE_B" | "BASELINE_B";
  container: null | "ASICE" | "ASICS";
  containerFilename: null | string;
  containerXmlns: null | string;
  packaging: "ENVELOPED" | "ENVELOPING" | "DETACHED" | "INTERNALLY_DETACHED";
  digestAlgorithm: "SHA256" | "SHA384" | "SHA512";
  en319132: false;
  infoCanonicalization: null | "INCLUSIVE" | "EXCLUSIVE";
  propertiesCanonicalization: null | "INCLUSIVE" | "EXCLUSIVE";
  keyInfoCanonicalization: null | "INCLUSIVE" | "EXCLUSIVE";
  signaturePolicyId: null | string;
  signaturePolicyContent: null | string;
  schema: null | string;
  transformation: null | string;
  transformationOutputMimeType: string;
}

export type PartialSignerParameters = Partial<FullSignerParameters>;
