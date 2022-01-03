/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

function log(...rest) {
  console.log("baseDSig", ...rest);
}

export const baseDSig = {
  _ready: true,
  SHA1: "http://www.w3.org/2000/09/xmldsig#sha1",
  SHA256: "http://www.w3.org/2001/04/xmlenc#sha256",
  SHA384: "http://www.w3.org/2001/04/xmldsig-more#sha384",
  SHA512: "http://www.w3.org/2001/04/xmlenc#sha512",
  LANG_SK: "SK",
  LANG_EN: "EN",
  XML_VISUAL_TRANSFORM_TXT: "TXT",
  XML_VISUAL_TRANSFORM_HTML: "HTML",
  PDF_CONFORMANCE_LEVEL_1A: 0,
  PDF_CONFORMANCE_LEVEL_1B: 1,
  PDF_CONFORMANCE_LEVEL_NONE: 2,
  ERROR_SIGNING_CANCELLED: 1,
  initialize: function (cb: { onSuccess: () => void }) {
    console.log("initalize", arguments);
    cb.onSuccess();
  },

  sign: function (
    signatureId,
    digestAlgUri,
    signaturePolicyIdentifier,
    callback: Callback
  ) {
    log("sign", arguments);
    callback.onSuccess();
  },
};

export interface Callback {
  onSuccess: () => void;
  onError: (err) => never;
}
