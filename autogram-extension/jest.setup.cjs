// jsdom does not provide TextEncoder/TextDecoder, which `jose`
// (pulled in via autogram-sdk) needs at import time.
const { TextEncoder, TextDecoder } = require("util");

if (typeof globalThis.TextEncoder === "undefined") {
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === "undefined") {
  globalThis.TextDecoder = TextDecoder;
}
