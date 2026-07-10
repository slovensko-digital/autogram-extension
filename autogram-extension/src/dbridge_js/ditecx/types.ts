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
 *
 * Must be a real `Error` with `name === "DitecError"`: portal code branches
 * on exactly that (e.g. schranka.slovensko.sk DSignerMulti.js does
 * `if (e.name === 'DitecError') ... else throw e`, and silences
 * `code === 1` cancellations only inside that branch).
 */
export interface DitecError extends Error {
  code: number;
  detail?: string;
}

export function isDitecError(e: unknown): e is DitecError {
  return (
    e != null &&
    typeof e === "object" &&
    "name" in e &&
    (e as { name?: unknown }).name === "DitecError"
  );
}

/**
 * Builds an error matching `ditec.utils.createDitecError` from the original
 * D.Bridge scripts: an `Error` decorated with name, code, detail and the
 * Ditec `toString` format.
 */
export function createDitecError(
  code: number,
  message: string,
  detail?: string
): DitecError {
  const error = new Error(message) as DitecError;
  error.name = "DitecError";
  error.code = code;
  error.detail = detail;
  error.toString = function () {
    return `${error.name}(${error.code}) ${error.message}`;
  };
  return error;
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
  if (isDitecError(e)) {
    return e;
  }
  const message = errorMessage(e);
  const detail =
    typeof e === "object" && e !== null && typeof (e as Error).stack === "string"
      ? (e as Error).stack
      : undefined;
  if (AutogramError.is(e, "user-cancelled")) {
    return createDitecError(DitecErrorCodes.ERROR_CANCELLED, message, detail);
  }
  if (AutogramError.is(e, "app-not-installed")) {
    return createDitecError(
      DitecErrorCodes.ERROR_NOT_INSTALLED,
      message,
      detail
    );
  }
  return createDitecError(DitecErrorCodes.ERROR_GENERAL, message, detail);
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

/**
 * BP `addXmlObject2` input. Field names follow the real
 * `dSigXadesBpJs.addXmlObject2` signature: the third argument is the form
 * identifier URI and the fourth is a base64-encoded XML data container
 * (see schranka.slovensko.sk DSignerMulti.js `addFileXmlASiC`).
 */
export interface ObjectXadesBp2Xml {
  type: "XadesBp2Xml";
  objectId: string;
  objectDescription: string;
  objectFormatIdentifier: string;
  /** data: base64-encoded XML data container (XDC) */
  xdcXDCB64: string;
  xdcUsedXSD: string;
  xdcUsedXSLT: string;
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

