import type { LegacySignatureParameters } from "./autogram-api/index";
import { AutogramError } from "./errors";
import {
  formatLegacyLevel,
  fromLegacySignArgs,
  fromLegacySignatureParameters,
  fromPayloadMimeType,
  parseLegacyLevel,
  signRequestToLegacy,
  supportsSignV1,
  toSignRequest,
  unsupportedLegacyParameters,
  versionSatisfies,
  type SignRequest,
} from "./sign-request";

/** Legacy `sign(document, parameters, payloadMimeType)` call → wire request. */
function legacyToSignRequest(
  document: { content: string; filename?: string },
  parameters?: LegacySignatureParameters,
  payloadMimeType?: string
): SignRequest {
  const migrated = fromLegacySignArgs(document, parameters, payloadMimeType);
  return toSignRequest(
    migrated.documents,
    migrated.parameters,
    migrated.presentation
  );
}

describe("parseLegacyLevel", () => {
  test("splits form-prefixed levels", () => {
    expect(parseLegacyLevel("XAdES_BASELINE_B")).toEqual({
      form: "XAdES",
      profile: "BASELINE_B",
    });
    expect(parseLegacyLevel("PAdES_BASELINE_B")).toEqual({
      form: "PAdES",
      profile: "BASELINE_B",
    });
    expect(parseLegacyLevel("CAdES_BASELINE_B")).toEqual({
      form: "CAdES",
      profile: "BASELINE_B",
    });
    expect(parseLegacyLevel("XAdES_BASELINE_T")).toEqual({
      form: "XAdES",
      profile: "BASELINE_T",
    });
    expect(parseLegacyLevel("PAdES_BASELINE_T")).toEqual({
      form: "PAdES",
      profile: "BASELINE_T",
    });
    expect(parseLegacyLevel("CAdES_BASELINE_T")).toEqual({
      form: "CAdES",
      profile: "BASELINE_T",
    });
  });

  test("keeps bare profiles without a form", () => {
    expect(parseLegacyLevel("BASELINE_B")).toEqual({ profile: "BASELINE_B" });
    expect(parseLegacyLevel("BASELINE_T")).toEqual({ profile: "BASELINE_T" });
  });

  test("returns nothing for undefined and throws on unknown values", () => {
    expect(parseLegacyLevel(undefined)).toEqual({});
    expect(() => parseLegacyLevel("XAdES_BASELINE_LTA" as never)).toThrow(
      AutogramError
    );
  });
});

describe("formatLegacyLevel", () => {
  test("joins form and profile", () => {
    expect(formatLegacyLevel("XAdES", "BASELINE_T")).toBe("XAdES_BASELINE_T");
    expect(formatLegacyLevel("PAdES", "BASELINE_B")).toBe("PAdES_BASELINE_B");
  });

  test("defaults profile to BASELINE_B when only form is given", () => {
    expect(formatLegacyLevel("CAdES")).toBe("CAdES_BASELINE_B");
    expect(formatLegacyLevel("CAdES", null)).toBe("CAdES_BASELINE_B");
  });

  test("keeps a bare profile and returns undefined when nothing is set", () => {
    expect(formatLegacyLevel(undefined, "BASELINE_T")).toBe("BASELINE_T");
    expect(formatLegacyLevel()).toBeUndefined();
    expect(formatLegacyLevel(null, null)).toBeUndefined();
  });
});

const fullLegacyParameters: LegacySignatureParameters = {
  level: "XAdES_BASELINE_T",
  container: "ASiC_E",
  packaging: "ENVELOPING",
  digestAlgorithm: "SHA512",
  en319132: true,
  infoCanonicalization: "EXCLUSIVE",
  propertiesCanonicalization: "INCLUSIVE_11",
  keyInfoCanonicalization: "INCLUSIVE",
  checkPDFACompliance: false,
  autoLoadEform: false,
  identifier: "http://data.gov.sk/doc/eform/App.GeneralAgenda/1.9",
  containerXmlns: "http://data.gov.sk/def/container/xmldatacontainer+xml/1.1",
  embedUsedSchemas: true,
  schema: "<xs:schema/>",
  schemaIdentifier: "http://schemas.gov.sk/form/App.GeneralAgenda/1.9/form.xsd",
  transformation: "<xsl:stylesheet/>",
  transformationIdentifier:
    "http://schemas.gov.sk/form/App.GeneralAgenda/1.9/form.xslt",
  transformationLanguage: "sk",
  transformationMediaDestinationTypeDescription: "HTML",
  transformationTargetEnvironment: "web",
  fsFormId: "123",
  visualizationWidth: "lg",
};

const fullXdcParameters = {
  autoLoadEform: false,
  identifier: "http://data.gov.sk/doc/eform/App.GeneralAgenda/1.9",
  containerXmlns: "http://data.gov.sk/def/container/xmldatacontainer+xml/1.1",
  embedUsedSchemas: true,
  schema: "<xs:schema/>",
  schemaIdentifier: "http://schemas.gov.sk/form/App.GeneralAgenda/1.9/form.xsd",
  transformation: "<xsl:stylesheet/>",
  transformationIdentifier:
    "http://schemas.gov.sk/form/App.GeneralAgenda/1.9/form.xslt",
  transformationLanguage: "sk",
  transformationMediaDestinationTypeDescription: "HTML",
  transformationTargetEnvironment: "web",
  fsFormIdentifier: "123",
};

const fullV1Parameters = {
  form: "XAdES",
  profile: "BASELINE_T",
  container: "ASiC_E",
  packaging: "ENVELOPING",
  digestAlgorithm: "SHA512",
  en319132: true,
  infoCanonicalization: "EXCLUSIVE",
  propertiesCanonicalization: "INCLUSIVE_11",
  keyInfoCanonicalization: "INCLUSIVE",
  checkPDFACompliance: false,
};

describe("fromLegacySignArgs → wire request", () => {
  test("applies the legacy defaults", () => {
    expect(legacyToSignRequest({ content: "<a/>" })).toEqual({
      documents: [{ content: "<a/>", mimeType: "application/xml" }],
      parameters: {
        form: "XAdES",
        profile: "BASELINE_B",
        checkPDFACompliance: true,
      },
    });
  });

  test("moves mime type, XDC parameters and visualization width to their v1 places", () => {
    const request = legacyToSignRequest(
      { content: "PGEvPg==", filename: "a.xml" },
      fullLegacyParameters,
      "application/xml;base64"
    );
    expect(request).toEqual({
      documents: [
        {
          filename: "a.xml",
          content: "PGEvPg==",
          mimeType: "application/xml;base64",
          xdcParameters: fullXdcParameters,
        },
      ],
      parameters: fullV1Parameters,
      presentation: { visualizationWidth: "lg" },
    });
    // Autogram derives the schema encoding from document.mimeType, like the legacy endpoint
    expect("schemaMimeType" in request.documents[0].xdcParameters!).toBe(false);
  });

  test("omits xdcParameters and presentation when nothing XDC-related is set", () => {
    expect(
      legacyToSignRequest(
        { content: "x" },
        { level: "PAdES_BASELINE_B", checkPDFACompliance: false },
        "application/pdf;base64"
      )
    ).toEqual({
      documents: [{ content: "x", mimeType: "application/pdf;base64" }],
      parameters: {
        form: "PAdES",
        profile: "BASELINE_B",
        checkPDFACompliance: false,
      },
    });
  });
});

describe("signRequestToLegacy", () => {
  test("round-trips a fully populated legacy request", () => {
    const document = { content: "PGEvPg==", filename: "a.xml" };
    expect(
      signRequestToLegacy(
        legacyToSignRequest(
          document,
          fullLegacyParameters,
          "application/xml;base64"
        )
      )
    ).toEqual({
      document,
      parameters: fullLegacyParameters,
      payloadMimeType: "application/xml;base64",
    });
  });

  test("round-trips bare and missing levels", () => {
    for (const level of ["BASELINE_B", "BASELINE_T", undefined] as const) {
      const parameters: LegacySignatureParameters = level
        ? { level, container: "ASiC_E" }
        : { container: "ASiC_E" };
      const legacy = signRequestToLegacy(
        legacyToSignRequest({ content: "x" }, parameters, "text/plain")
      );
      expect(legacy.parameters).toEqual(parameters);
    }
  });

  test("drops v1-only presentation hints and normalizes nulls", () => {
    expect(
      signRequestToLegacy({
        documents: [
          {
            content: "x",
            mimeType: "application/pdf;base64",
            xdcParameters: {
              schemaMimeType: "application/xml;base64",
              identifier: null as unknown as undefined,
            },
          },
        ],
        parameters: {
          form: "PAdES",
          container: null,
          checkPDFEmbeddedAttachments: false,
          requireQualifiedCertificate: false,
        },
      })
    ).toEqual({
      document: { content: "x" },
      parameters: { level: "PAdES_BASELINE_B" },
      payloadMimeType: "application/pdf;base64",
    });
  });

  test("refuses to silently skip opt-in safety checks", () => {
    for (const parameters of [
      { requireQualifiedCertificate: true },
      { checkPDFEmbeddedAttachments: true },
    ]) {
      expect(() =>
        signRequestToLegacy({
          documents: [{ content: "x", mimeType: "text/plain" }],
          parameters,
        })
      ).toThrow(expect.objectContaining({ code: "not-supported" }));
    }
  });

  test("rejects anything but exactly one document", () => {
    expect(() => signRequestToLegacy({ documents: [] })).toThrow(AutogramError);
    expect(() =>
      signRequestToLegacy({
        documents: [
          { content: "a", mimeType: "text/plain" },
          { content: "b", mimeType: "text/plain" },
        ],
      })
    ).toThrow(expect.objectContaining({ code: "not-supported" }));
  });
});

describe("fromLegacySignArgs", () => {
  test("splits the payload mime type into mimeType + encoding", () => {
    expect(
      fromLegacySignArgs(
        { content: "JVBERg==", filename: "a.pdf" },
        { level: "PAdES_BASELINE_B" },
        "application/pdf;base64"
      )
    ).toEqual({
      documents: [
        {
          content: "JVBERg==",
          filename: "a.pdf",
          mimeType: "application/pdf",
          encoding: "base64",
        },
      ],
      parameters: { form: "PAdES", profile: "BASELINE_B" },
    });
  });

  test("applies the legacy defaults", () => {
    expect(fromLegacySignArgs({ content: "<a/>" })).toEqual({
      documents: [{ content: "<a/>", mimeType: "application/xml" }],
      parameters: {
        form: "XAdES",
        profile: "BASELINE_B",
        checkPDFACompliance: true,
      },
    });
  });

  test("moves XDC parameters onto the document and visualizationWidth to presentation", () => {
    expect(
      fromLegacySignArgs(
        { content: "<a/>" },
        fullLegacyParameters,
        "application/xml"
      )
    ).toEqual({
      documents: [
        {
          content: "<a/>",
          mimeType: "application/xml",
          xdcParameters: fullXdcParameters,
        },
      ],
      parameters: fullV1Parameters,
      presentation: { visualizationWidth: "lg" },
    });
  });
});

describe("fromLegacySignatureParameters", () => {
  test("drops nulls, which mean 'default' in both shapes", () => {
    expect(
      fromLegacySignatureParameters({
        level: "XAdES_BASELINE_B",
        container: null as never,
        schemaIdentifier: null as never,
        identifier: "id",
      })
    ).toEqual({
      parameters: { form: "XAdES", profile: "BASELINE_B" },
      xdcParameters: { identifier: "id" },
    });
  });
});

describe("fromPayloadMimeType", () => {
  test("is the inverse of toPayloadMimeType", () => {
    expect(fromPayloadMimeType("application/pdf;base64")).toEqual({
      mimeType: "application/pdf",
      encoding: "base64",
    });
    expect(fromPayloadMimeType("application/xml; base64")).toEqual({
      mimeType: "application/xml",
      encoding: "base64",
    });
    expect(fromPayloadMimeType("text/plain")).toEqual({
      mimeType: "text/plain",
    });
  });
});

describe("toSignRequest", () => {
  test("encodes the wire mime type and keeps per-document XDC parameters", () => {
    expect(
      toSignRequest(
        [
          {
            content: "<a/>",
            mimeType: "application/xml",
            filename: "a.xml",
            xdcParameters: { autoLoadEform: true },
          },
          {
            content: "JVBERg==",
            mimeType: "application/pdf",
            encoding: "base64",
            filename: "b.pdf",
          },
        ],
        { form: "XAdES", container: "ASiC_E" },
        { visualizationWidth: "xl" }
      )
    ).toEqual({
      documents: [
        {
          content: "<a/>",
          mimeType: "application/xml",
          filename: "a.xml",
          xdcParameters: { autoLoadEform: true },
        },
        {
          content: "JVBERg==",
          mimeType: "application/pdf;base64",
          filename: "b.pdf",
        },
      ],
      parameters: { form: "XAdES", container: "ASiC_E" },
      presentation: { visualizationWidth: "xl" },
    });
  });

  test("rejects legacy-shaped parameters instead of silently ignoring them", () => {
    const legacy: object = {
      level: "PAdES_BASELINE_B",
      container: "ASiC_E",
      fsFormId: "1",
    };
    expect(() =>
      toSignRequest({ content: "x", mimeType: "application/pdf" }, legacy)
    ).toThrow(/level, fsFormId.*fromLegacySignatureParameters/);
  });

  test("accepts a single document and rejects an empty list", () => {
    expect(toSignRequest({ content: "x", mimeType: "text/plain" })).toEqual({
      documents: [{ content: "x", mimeType: "text/plain" }],
    });
    expect(() => toSignRequest([])).toThrow(AutogramError);
  });
});

describe("versionSatisfies / supportsSignV1", () => {
  test("compares versions numerically per segment", () => {
    expect(versionSatisfies("2.8.0", "2.8.0")).toBe(true);
    expect(versionSatisfies("2.8.1", "2.8.0")).toBe(true);
    expect(versionSatisfies("2.10.0", "2.8.1")).toBe(true);
    expect(versionSatisfies("3.0.0", "2.8.0")).toBe(true);
    expect(versionSatisfies("2.8", "2.8.0")).toBe(true);
    expect(versionSatisfies("2.7.9", "2.8.0")).toBe(false);
    expect(versionSatisfies("2.7.99", "2.8.0")).toBe(false);
    expect(versionSatisfies("1.9.9", "2.8.0")).toBe(false);
  });

  test("ignores pre-release suffixes and garbage segments", () => {
    expect(versionSatisfies("3.0.0-beta", "3.0.0")).toBe(true);
    expect(versionSatisfies("2.8.0-rc1", "2.8.0")).toBe(true);
    expect(versionSatisfies("2.x", "2.8.0")).toBe(false);
  });

  test("decides the endpoint", () => {
    expect(supportsSignV1("dev")).toBe(true);
    expect(supportsSignV1("2.8.0")).toBe(true);
    expect(supportsSignV1("2.7.6")).toBe(false);
    expect(supportsSignV1(undefined)).toBe(false);
  });
});

describe("unsupportedLegacyParameters", () => {
  test("reports only the checks that are actually enabled", () => {
    expect(unsupportedLegacyParameters(undefined)).toEqual([]);
    expect(unsupportedLegacyParameters({ form: "XAdES" })).toEqual([]);
    expect(
      unsupportedLegacyParameters({
        requireQualifiedCertificate: false,
        checkPDFEmbeddedAttachments: false,
      })
    ).toEqual([]);
    expect(
      unsupportedLegacyParameters({ requireQualifiedCertificate: true })
    ).toEqual(["requireQualifiedCertificate"]);
    expect(
      unsupportedLegacyParameters({
        requireQualifiedCertificate: true,
        checkPDFEmbeddedAttachments: true,
      })
    ).toEqual(["requireQualifiedCertificate", "checkPDFEmbeddedAttachments"]);
  });
});
