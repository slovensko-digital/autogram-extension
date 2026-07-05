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
