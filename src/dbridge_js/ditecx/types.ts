import { SignatureParameters } from "../../autogram-api";

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
  xsdReferenceURI: string;
  xdcUsedXSLT: string;
  xslReferenceURI: string;
  xslMediaDestinationTypeDescription: SignatureParameters["transformationMediaDestinationTypeDescription"];
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

export type PartialSignerParameters = Partial<SignatureParameters>;

export interface OnSuccessCallback {
  onSuccess: () => void;
}
export interface OnSuccessCallback1 {
  onSuccess: (v) => void;
  onError?: (v) => void;
}

export interface OnErrorCallback {
  onError: (e) => void;
}
