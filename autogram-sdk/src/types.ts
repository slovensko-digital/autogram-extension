/**
 * @module types
 * Core types shared across signing backends (Autogram desktop, Autogram v Mobile).
 * This module must stay dependency-free so any layer can import it.
 */

/** How the user chose to sign. */
export enum SigningMethod {
  /** Autogram desktop app with a card reader. */
  reader,
  /** Autogram mobile app, paired via QR code shown on this device. */
  mobile,
  /** Autogram mobile app on the same device the page runs on. */
  mobileOnMobile,
}

/**
 * Legacy result shape of a signing operation.
 *
 * Mirrors the desktop `SignResponseBody`. Mobile (AVM) results are
 * flattened to this shape (last signer only). Prefer
 * {@link SignedDocumentResult}, which keeps all signers and the real
 * MIME type.
 */
export interface SignedObject {
  /** Signed content of the original document, Base64 encoded. */
  content: string;
  /** Distinguished name of the certificate used to sign the document. */
  signedBy: string;
  /** Distinguished name of the issuer of the signing certificate. */
  issuedBy: string;
}

/**
 * A document to sign, unified across desktop and mobile backends.
 */
export interface DocumentToSign {
  content: string;
  /** MIME type of `content` — without any `";base64"` suffix. */
  mimeType: string;
  /** How `content` is encoded. Default `"utf-8"`. */
  encoding?: "utf-8" | "base64";
  filename?: string;
}

/** One signature on a signed document. */
export interface SignatureInfo {
  /** Distinguished name of the certificate used to sign. */
  signedBy?: string;
  /** Distinguished name of the certificate issuer. */
  issuedBy?: string;
}

/**
 * Result of a signing operation, unified across desktop and mobile
 * backends. Unlike {@link SignedObject} it keeps every signer and the
 * MIME type of the signed artifact.
 */
export interface SignedDocumentResult {
  content: string;
  /** MIME type of the signed artifact (container, PDF, XML, …). */
  mimeType: string;
  /** How `content` is encoded. */
  encoding: "utf-8" | "base64";
  filename?: string;
  /** All signatures on the document, in signing order. */
  signatures: SignatureInfo[];
}

/**
 * Converts a document's MIME type + encoding to the wire
 * `payloadMimeType` convention used by the desktop and AVM APIs
 * (a `";base64"` suffix marks Base64-encoded content).
 */
export function toPayloadMimeType(document: DocumentToSign): string {
  return document.encoding === "base64"
    ? `${document.mimeType};base64`
    : document.mimeType;
}

/**
 * Adapts a desktop `SignResponseBody`-shaped result to
 * {@link SignedDocumentResult}. The desktop API does not report the
 * artifact MIME type, so it is inferred (best effort) from the signature
 * parameters.
 */
export function fromDesktopResponse(
  response: { content: string; signedBy: string; issuedBy: string },
  parameters?: { level?: string | null; container?: string | null }
): SignedDocumentResult {
  return {
    content: response.content,
    mimeType: inferDesktopMimeType(parameters),
    encoding: "base64",
    signatures: [
      { signedBy: response.signedBy, issuedBy: response.issuedBy },
    ],
  };
}

function inferDesktopMimeType(parameters?: {
  level?: string | null;
  container?: string | null;
}): string {
  if (parameters?.container) {
    return "application/vnd.etsi.asic-e+zip";
  }
  const level = parameters?.level ?? "";
  if (level.startsWith("PAdES")) {
    return "application/pdf";
  }
  if (level.startsWith("XAdES")) {
    return "application/xml";
  }
  return "application/octet-stream";
}

/**
 * Adapts an AVM signed document to {@link SignedDocumentResult},
 * keeping every signer and the reported MIME type.
 */
export function fromAvmSignedDocument(document: {
  content: string;
  mimeType: string;
  filename?: string;
  signers?: SignatureInfo[];
}): SignedDocumentResult {
  return {
    content: document.content,
    mimeType: document.mimeType,
    encoding: "base64",
    filename: document.filename,
    signatures: document.signers ?? [],
  };
}

/**
 * Flattens a {@link SignedDocumentResult} to the legacy
 * {@link SignedObject} shape (last signer, with the historical fallback
 * identification).
 */
export function toLegacySignedObject(
  result: SignedDocumentResult
): SignedObject {
  const lastSignature = result.signatures[result.signatures.length - 1];
  return {
    content: result.content,
    signedBy: lastSignature?.signedBy ?? "Používateľ Autogramu",
    issuedBy: lastSignature?.issuedBy ?? "(neznámy)",
  };
}
