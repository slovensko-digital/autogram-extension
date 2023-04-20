import crypto from "isomorphic-webcrypto";

// Precomputed 00-ff
const byteToHex = Array.from(Array(256).keys()).map((n) =>
  n.toString(16).padStart(2, "0")
);

/**
 * Convert 8-bit (byte) array to hex string
 */
export function toHex(input: Uint8Array): string {
  return Array.prototype.map.call(input, (n) => byteToHex[n]).join("");
}

/**
 * Convert 8-bit (byte) array to unsigned 32-bit integer represented as number
 */
export function toUint32(input: Uint8Array): number {
  const view = new DataView(input.buffer, 0);
  return view.getUint32(0);
}

/**
 * Generate random bytes
 */
export function getRandomBytes(length: number) {
  return crypto.getRandomValues(new Uint8Array(length));
}
