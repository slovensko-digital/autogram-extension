import { describe, it } from "node:test";
import assert from "node:assert/strict";

import type { SignatureParameters } from "./autogram-api/index";
import { AutogramSdkException } from "./errors";
import {
  DEFAULT_PAYLOAD_MIME_TYPE,
  LEGACY_DEFAULT_PARAMETERS,
  formatLegacyLevel,
  isLegacyDocument,
  legacyToSignRequest,
  normalizeSignArgs,
  parseLegacyLevel,
  signRequestToLegacy,
  supportsSignV1,
  unsupportedLegacyParameters,
  versionSatisfies,
} from "./sign-request";

describe("parseLegacyLevel", () => {
  it("splits form-prefixed levels", () => {
    assert.deepEqual(parseLegacyLevel("XAdES_BASELINE_B"), { form: "XAdES", profile: "BASELINE_B" });
    assert.deepEqual(parseLegacyLevel("PAdES_BASELINE_B"), { form: "PAdES", profile: "BASELINE_B" });
    assert.deepEqual(parseLegacyLevel("CAdES_BASELINE_B"), { form: "CAdES", profile: "BASELINE_B" });
    assert.deepEqual(parseLegacyLevel("XAdES_BASELINE_T"), { form: "XAdES", profile: "BASELINE_T" });
    assert.deepEqual(parseLegacyLevel("PAdES_BASELINE_T"), { form: "PAdES", profile: "BASELINE_T" });
    assert.deepEqual(parseLegacyLevel("CAdES_BASELINE_T"), { form: "CAdES", profile: "BASELINE_T" });
  });

  it("keeps bare profiles without a form", () => {
    assert.deepEqual(parseLegacyLevel("BASELINE_B"), { profile: "BASELINE_B" });
    assert.deepEqual(parseLegacyLevel("BASELINE_T"), { profile: "BASELINE_T" });
  });

  it("returns nothing for undefined and throws on unknown values", () => {
    assert.deepEqual(parseLegacyLevel(undefined), {});
    assert.throws(() => parseLegacyLevel("XAdES_BASELINE_LTA" as never), AutogramSdkException);
  });
});

describe("formatLegacyLevel", () => {
  it("joins form and profile", () => {
    assert.equal(formatLegacyLevel("XAdES", "BASELINE_T"), "XAdES_BASELINE_T");
    assert.equal(formatLegacyLevel("PAdES", "BASELINE_B"), "PAdES_BASELINE_B");
  });
  it("defaults profile to BASELINE_B when only form is given", () => {
    assert.equal(formatLegacyLevel("CAdES"), "CAdES_BASELINE_B");
    assert.equal(formatLegacyLevel("CAdES", null), "CAdES_BASELINE_B");
  });
  it("keeps a bare profile and returns undefined when nothing is set", () => {
    assert.equal(formatLegacyLevel(undefined, "BASELINE_T"), "BASELINE_T");
    assert.equal(formatLegacyLevel(), undefined);
    assert.equal(formatLegacyLevel(null, null), undefined);
  });
});

const fullLegacyParameters: SignatureParameters = {
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
  transformationIdentifier: "http://schemas.gov.sk/form/App.GeneralAgenda/1.9/form.xslt",
  transformationLanguage: "sk",
  transformationMediaDestinationTypeDescription: "HTML",
  transformationTargetEnvironment: "web",
  fsFormId: "123",
  visualizationWidth: "lg",
};

describe("legacyToSignRequest", () => {
  it("applies the legacy defaults", () => {
    const request = legacyToSignRequest({ content: "<a/>" });
    assert.deepEqual(request, {
      documents: [{ content: "<a/>", mimeType: DEFAULT_PAYLOAD_MIME_TYPE }],
      parameters: { form: "XAdES", profile: "BASELINE_B", checkPDFACompliance: true },
    });
    assert.deepEqual(LEGACY_DEFAULT_PARAMETERS, { level: "XAdES_BASELINE_B", checkPDFACompliance: true });
  });

  it("moves mime type, XDC parameters and visualization width to their v1 places", () => {
    const request = legacyToSignRequest(
      { content: "PGEvPg==", filename: "a.xml" },
      fullLegacyParameters,
      "application/xml;base64"
    );
    assert.deepEqual(request, {
      documents: [
        {
          filename: "a.xml",
          content: "PGEvPg==",
          mimeType: "application/xml;base64",
          xdcParameters: {
            autoLoadEform: false,
            identifier: "http://data.gov.sk/doc/eform/App.GeneralAgenda/1.9",
            containerXmlns: "http://data.gov.sk/def/container/xmldatacontainer+xml/1.1",
            embedUsedSchemas: true,
            schema: "<xs:schema/>",
            schemaIdentifier: "http://schemas.gov.sk/form/App.GeneralAgenda/1.9/form.xsd",
            transformation: "<xsl:stylesheet/>",
            transformationIdentifier: "http://schemas.gov.sk/form/App.GeneralAgenda/1.9/form.xslt",
            transformationLanguage: "sk",
            transformationMediaDestinationTypeDescription: "HTML",
            transformationTargetEnvironment: "web",
            fsFormIdentifier: "123",
          },
        },
      ],
      parameters: {
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
      },
      presentation: { visualizationWidth: "lg" },
    });
    assert.equal("schemaMimeType" in request.documents[0].xdcParameters!, false);
  });

  it("omits xdcParameters and presentation when nothing XDC-related is set", () => {
    const request = legacyToSignRequest(
      { content: "x" },
      { level: "PAdES_BASELINE_B", checkPDFACompliance: false },
      "application/pdf;base64"
    );
    assert.deepEqual(request, {
      documents: [{ content: "x", mimeType: "application/pdf;base64" }],
      parameters: { form: "PAdES", profile: "BASELINE_B", checkPDFACompliance: false },
    });
  });
});

describe("signRequestToLegacy", () => {
  it("round-trips a fully populated legacy request", () => {
    const document = { content: "PGEvPg==", filename: "a.xml" };
    const legacy = signRequestToLegacy(
      legacyToSignRequest(document, fullLegacyParameters, "application/xml;base64")
    );
    assert.deepEqual(legacy, {
      document,
      parameters: fullLegacyParameters,
      payloadMimeType: "application/xml;base64",
    });
  });

  it("round-trips bare and missing levels", () => {
    for (const level of ["BASELINE_B", "BASELINE_T", undefined] as const) {
      const parameters: SignatureParameters = level ? { level, container: "ASiC_E" } : { container: "ASiC_E" };
      const legacy = signRequestToLegacy(legacyToSignRequest({ content: "x" }, parameters, "text/plain"));
      assert.deepEqual(legacy.parameters, parameters);
    }
  });

  it("drops v1-only presentation hints and normalizes nulls", () => {
    const legacy = signRequestToLegacy({
      documents: [
        {
          content: "x",
          mimeType: "application/pdf;base64",
          xdcParameters: { schemaMimeType: "application/xml;base64", identifier: null as unknown as undefined },
        },
      ],
      parameters: {
        form: "PAdES",
        container: null,
        checkPDFEmbeddedAttachments: false,
        requireQualifiedCertificate: false,
      },
    });
    assert.deepEqual(legacy, {
      document: { content: "x" },
      parameters: { level: "PAdES_BASELINE_B" },
      payloadMimeType: "application/pdf;base64",
    });
  });

  it("refuses to silently skip opt-in safety checks", () => {
    for (const parameters of [
      { requireQualifiedCertificate: true },
      { checkPDFEmbeddedAttachments: true },
    ]) {
      assert.throws(
        () => signRequestToLegacy({ documents: [{ content: "x", mimeType: "text/plain" }], parameters }),
        AutogramSdkException
      );
    }
  });

  it("rejects anything but exactly one document", () => {
    assert.throws(() => signRequestToLegacy({ documents: [] }), AutogramSdkException);
    assert.throws(
      () =>
        signRequestToLegacy({
          documents: [
            { content: "a", mimeType: "text/plain" },
            { content: "b", mimeType: "text/plain" },
          ],
        }),
      AutogramSdkException
    );
  });
});

describe("normalizeSignArgs", () => {
  it("detects the legacy shape by the missing mimeType", () => {
    assert.equal(isLegacyDocument({ content: "x" }), true);
    assert.equal(isLegacyDocument({ content: "x", mimeType: "text/plain" }), false);
    assert.equal(isLegacyDocument([{ content: "x", mimeType: "text/plain" }]), false);
  });

  it("handles legacy calls with and without payloadMimeType / options", () => {
    const options = { batchId: "b" };
    const withMime = normalizeSignArgs({ content: "x" }, { level: "PAdES_BASELINE_B" }, "application/pdf;base64", options);
    assert.equal(withMime.legacy, true);
    assert.equal(withMime.options, options);
    assert.deepEqual(withMime.request.documents, [{ content: "x", mimeType: "application/pdf;base64" }]);

    const twoArgs = normalizeSignArgs({ content: "x" }, { level: "CAdES_BASELINE_B" });
    assert.deepEqual(twoArgs.request.documents, [{ content: "x", mimeType: DEFAULT_PAYLOAD_MIME_TYPE }]);
    assert.equal(twoArgs.options, undefined);

    const optionsInThird = normalizeSignArgs({ content: "x" }, undefined, options);
    assert.equal(optionsInThird.options, options);
    assert.deepEqual(optionsInThird.request.parameters, { form: "XAdES", profile: "BASELINE_B", checkPDFACompliance: true });
  });

  it("wraps a single v1 document and passes arrays and presentation through", () => {
    const doc = { content: "x", mimeType: "text/plain" };
    const single = normalizeSignArgs(doc, { form: "XAdES" }, { presentation: { visualizationWidth: "xl" } });
    assert.equal(single.legacy, false);
    assert.deepEqual(single.request, {
      documents: [doc],
      parameters: { form: "XAdES" },
      presentation: { visualizationWidth: "xl" },
    });

    const multi = normalizeSignArgs([doc, doc]);
    assert.deepEqual(multi.request, { documents: [doc, doc] });
  });

  it("rejects an empty document list", () => {
    assert.throws(() => normalizeSignArgs([]), AutogramSdkException);
  });
});

describe("versionSatisfies / supportsSignV1", () => {
  it("compares versions numerically per segment", () => {
    assert.equal(versionSatisfies("2.8.0", "2.8.0"), true);
    assert.equal(versionSatisfies("2.8.1", "2.8.0"), true);
    assert.equal(versionSatisfies("2.10.0", "2.8.1"), true);
    assert.equal(versionSatisfies("3.0.0", "2.8.0"), true);
    assert.equal(versionSatisfies("2.8", "2.8.0"), true);
    assert.equal(versionSatisfies("2.7.9", "2.8.0"), false);
    assert.equal(versionSatisfies("2.7.99", "2.8.0"), false);
    assert.equal(versionSatisfies("1.9.9", "2.8.0"), false);
  });

  it("ignores pre-release suffixes and garbage segments", () => {
    assert.equal(versionSatisfies("3.0.0-beta", "3.0.0"), true);
    assert.equal(versionSatisfies("2.8.0-rc1", "2.8.0"), true);
    assert.equal(versionSatisfies("2.x", "2.8.0"), false);
  });

  it("decides the endpoint", () => {
    assert.equal(supportsSignV1("dev"), true);
    assert.equal(supportsSignV1("2.8.0"), true);
    assert.equal(supportsSignV1("2.7.6"), false);
    assert.equal(supportsSignV1(undefined), false);
  });
});

describe("unsupportedLegacyParameters", () => {
  it("reports only the checks that are actually enabled", () => {
    assert.deepEqual(unsupportedLegacyParameters(undefined), []);
    assert.deepEqual(unsupportedLegacyParameters({ form: "XAdES" }), []);
    assert.deepEqual(
      unsupportedLegacyParameters({ requireQualifiedCertificate: false, checkPDFEmbeddedAttachments: false }),
      []
    );
    assert.deepEqual(unsupportedLegacyParameters({ requireQualifiedCertificate: true }), [
      "requireQualifiedCertificate",
    ]);
    assert.deepEqual(
      unsupportedLegacyParameters({ requireQualifiedCertificate: true, checkPDFEmbeddedAttachments: true }),
      ["requireQualifiedCertificate", "checkPDFEmbeddedAttachments"]
    );
  });
});
