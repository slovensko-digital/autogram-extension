/**
 * @module types
 * Core types shared across signing backends (Autogram desktop, Autogram v Mobile).
 * This module must stay dependency-free so any layer can import it.
 */

/**
 * Result of a signing operation, unified across desktop and mobile backends.
 *
 * Mirrors the desktop `SignResponseBody` shape. Mobile (AVM) results are
 * adapted to this shape by the SDK.
 */
export interface SignedObject {
  /** Signed content of the original document, Base64 encoded. */
  content: string;
  /** Distinguished name of the certificate used to sign the document. */
  signedBy: string;
  /** Distinguished name of the issuer of the signing certificate. */
  issuedBy: string;
}
