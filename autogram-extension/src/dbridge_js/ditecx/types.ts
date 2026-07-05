import { AutogramError } from "autogram-sdk";

/**
 * Error codes matching Ditec D.Bridge `ditec.utils.ERROR_*` constants,
 * which portal code (e.g. slovensko.sk) uses to distinguish error causes.
 */
export const DitecErrorCodes = {
  ERROR_CANCELLED: 1,
  ERROR_GENERAL: -200,
  ERROR_NOT_INSTALLED: -201,
  ERROR_LAUNCH_FAILED: -202,
  ERROR_LAUNCH_FORBIDDEN: -203,
} as const;

/**
 * Error object shape passed to Ditec-style `onError` callbacks.
 */
export interface DitecError {
  code: number;
  message: string;
}

/**
 * Maps SDK exceptions to Ditec-style error objects so portal code can
 * distinguish user cancellation from real failures via `error.code`.
 *
 * Uses {@link AutogramError.is} instead of `instanceof` because errors that
 * cross the extension message bridge are serialized to plain objects and
 * lose their prototype chain.
 */
export function toDitecError(e: unknown): DitecError {
  const message = errorMessage(e);
  if (AutogramError.is(e, "user-cancelled")) {
    return { code: DitecErrorCodes.ERROR_CANCELLED, message };
  }
  if (AutogramError.is(e, "app-not-installed")) {
    return { code: DitecErrorCodes.ERROR_NOT_INSTALLED, message };
  }
  return { code: DitecErrorCodes.ERROR_GENERAL, message };
}

function errorMessage(e: unknown): string {
  if (typeof e === "object" && e !== null) {
    const candidate = e as { message?: unknown };
    if (typeof candidate.message === "string") {
      return candidate.message;
    }
  }
  return String(e);
}

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
  xslMediaDestinationTypeDescription: "TXT" | "HTML" | "XHTML";
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

