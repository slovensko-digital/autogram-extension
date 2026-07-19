import {
  fromAvmSignedDocument,
  fromDesktopResponse,
  toLegacySignedObject,
  toPayloadMimeType,
} from "./types";

describe("toPayloadMimeType", () => {
  test("adds the ;base64 suffix for base64 encoding", () => {
    expect(
      toPayloadMimeType({
        content: "x",
        mimeType: "application/pdf",
        encoding: "base64",
      })
    ).toBe("application/pdf;base64");
  });

  test("leaves utf-8 (default) untouched", () => {
    expect(toPayloadMimeType({ content: "x", mimeType: "text/plain" })).toBe(
      "text/plain"
    );
    expect(
      toPayloadMimeType({
        content: "x",
        mimeType: "text/plain",
        encoding: "utf-8",
      })
    ).toBe("text/plain");
  });
});

describe("fromDesktopResponse", () => {
  const response = { content: "c", signedBy: "s", issuedBy: "i" };

  test("infers an ASiC-E container when a container is requested", () => {
    const result = fromDesktopResponse(response, {
      level: "XAdES_BASELINE_B",
      container: "ASiC_E",
    });
    expect(result.mimeType).toBe("application/vnd.etsi.asic-e+zip");
    expect(result.encoding).toBe("base64");
    expect(result.signatures).toEqual([{ signedBy: "s", issuedBy: "i" }]);
  });

  test("infers PDF for PAdES without a container", () => {
    expect(
      fromDesktopResponse(response, { level: "PAdES_BASELINE_B" }).mimeType
    ).toBe("application/pdf");
  });

  test("infers XML for XAdES without a container", () => {
    expect(
      fromDesktopResponse(response, { level: "XAdES_BASELINE_B" }).mimeType
    ).toBe("application/xml");
  });

  test("falls back to octet-stream when nothing is known", () => {
    expect(fromDesktopResponse(response).mimeType).toBe(
      "application/octet-stream"
    );
  });
});

describe("fromAvmSignedDocument", () => {
  test("keeps every signer, the MIME type and the filename", () => {
    const result = fromAvmSignedDocument({
      content: "c",
      mimeType: "application/vnd.etsi.asic-e+zip",
      filename: "doc.asice",
      signers: [
        { signedBy: "a", issuedBy: "x" },
        { signedBy: "b", issuedBy: "y" },
      ],
    });
    expect(result).toEqual({
      content: "c",
      mimeType: "application/vnd.etsi.asic-e+zip",
      encoding: "base64",
      filename: "doc.asice",
      signatures: [
        { signedBy: "a", issuedBy: "x" },
        { signedBy: "b", issuedBy: "y" },
      ],
    });
  });

  test("tolerates a document with no signers", () => {
    expect(
      fromAvmSignedDocument({ content: "c", mimeType: "text/plain" }).signatures
    ).toEqual([]);
  });
});

describe("toLegacySignedObject", () => {
  test("takes the last signer", () => {
    expect(
      toLegacySignedObject({
        content: "c",
        mimeType: "application/xml",
        encoding: "base64",
        signatures: [
          { signedBy: "first", issuedBy: "i1" },
          { signedBy: "last", issuedBy: "i2" },
        ],
      })
    ).toEqual({ content: "c", signedBy: "last", issuedBy: "i2" });
  });

  test("applies the historical fallback identification when unsigned", () => {
    expect(
      toLegacySignedObject({
        content: "c",
        mimeType: "application/xml",
        encoding: "base64",
        signatures: [],
      })
    ).toEqual({
      content: "c",
      signedBy: "Používateľ Autogramu",
      issuedBy: "(neznámy)",
    });
  });
});
