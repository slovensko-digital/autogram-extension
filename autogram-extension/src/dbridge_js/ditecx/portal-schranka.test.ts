/**
 * Portal contract tests: replay the real schranka.slovensko.sk signing
 * driver (tests/fixtures/portals/DSignerMulti-20250601.js) against our
 * `window.ditec` replacement. The portal script runs verbatim — argument
 * order, callback chaining, the getVersion plugin gate and error branching
 * are theirs; only the page shell (eDesk/MessageBox) and the signer backend
 * (FakeImplementation) are test doubles.
 */
// Neutralize the SDK-client import chain (autogram-sdk/with-ui) that
// ditecx.ts pulls in for constructDitecX; these tests only use buildDitecX
// with a FakeImplementation.
jest.mock("../autogram/autogram-implementation", () => ({
  DBridgeAutogramImpl: {
    init: async () => {
      throw new Error("not used in portal contract tests");
    },
  },
}));

import { Base64 } from "js-base64";
import { buildDitecX } from "./ditecx";
import { FakeImplementation } from "./testing/fake-implementation";
import {
  FETCH_FIXTURES_HINT,
  hasDSignerMultiFixture,
  loadDSignerMulti,
} from "./testing/load-dsigner-multi";

// The portal script is fetched on demand, not vendored (licensing) —
// without it these suites skip visibly instead of failing.
const describeWithFixture = hasDSignerMultiFixture()
  ? describe
  : describe.skip;
if (!hasDSignerMultiFixture()) {
  console.warn(`portal-schranka.test.ts: ${FETCH_FIXTURES_HINT}`);
}

const XDC_MIME = "application/vnd.gov.sk.xmldatacontainer+xml";
const XDC_XMLNS_V1_1 =
  "http://data.gov.sk/def/container/xmldatacontainer+xml/1.1";

function setup() {
  const fake = new FakeImplementation();
  const ditec = buildDitecX(fake);
  const portal = loadDSignerMulti(ditec);
  const signer = new portal.DSigner();
  return { fake, ditec, signer, shell: portal.shell };
}

/** schranka XDC document as built by their eDesk backend. */
function xdcDocument(objectId = "form-object") {
  return {
    IsXml: true,
    XmlFormId: XDC_MIME,
    ObjectId: objectId,
    Description: "Všeobecná agenda",
    Uri: "http://data.gov.sk/doc/eform/App.GeneralAgenda/1.9",
    Data: Base64.encode("<XMLDataContainer><XMLData/></XMLDataContainer>"),
    Xsd: "<xs:schema/>",
    Xslt: "<xsl:stylesheet/>",
  };
}

/** schranka plain-XML (non-container) document for the 15-arg addXmlObject. */
function plainXmlDocument() {
  return {
    IsXml: true,
    XmlFormId: "http://schemas.gov.sk/form/App.GeneralAgenda/1.9",
    XmlFormVersion: "1.9",
    ObjectId: "plain-xml-object",
    Description: "Všeobecná agenda",
    Uri: "http://data.gov.sk/doc/eform/App.GeneralAgenda/1.9",
    Data: "<GeneralAgenda/>",
    Xsd: "<xs:schema/>",
    XsdUri: "http://schemas.gov.sk/form/App.GeneralAgenda/1.9/form.xsd",
    Xslt: "<xsl:stylesheet/>",
    XsltUri: "http://schemas.gov.sk/form/App.GeneralAgenda/1.9/form.xslt",
    XsltIsHtml: false,
    Language: "sk",
    TargetEnvironment: "",
    EmbedSchemaAndTransformation: false,
  };
}

function asicRequest(documents: unknown[], overrides: object = {}) {
  return {
    SignatureType: "ASiC",
    SignatureId: "Signature-1",
    Documents: documents,
    ...overrides,
  };
}

function xadesRequest(version: string, documents: unknown[]) {
  return {
    SignatureType: "XAdES",
    SignatureId: "Signature-1",
    XadesZepSignatureVersion: version,
    Documents: documents.map((d) => ({
      ...(d as object),
      XadesZepXMLVerificationDataVersion: "1.0",
    })),
  };
}

function signAsync(
  signer: { sign(request: unknown, cb: (r: unknown) => void): void },
  request: unknown
): Promise<unknown> {
  return new Promise((resolve) => signer.sign(request, resolve));
}

/** Let the adapter promise chains and portal callbacks settle. */
function settle(ms = 30): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describeWithFixture("schranka ASiC flow (dSigXadesBpJs)", () => {
  test("signs an XML data container end to end", async () => {
    const { fake, signer, shell } = setup();
    const document = xdcDocument();

    const result = await signAsync(signer, asicRequest([document]));

    // deploy → initialize → getVersion gate → addXmlObject2 → sign →
    // getSignatureWithASiCEnvelopeBase64, all completed without errors
    expect(result).toBe(fake.signatureContent);
    expect(shell.errors).toEqual([]);
    expect(shell.alerts).toEqual([]);

    // the base64 XDC went through as base64 container content
    expect(fake.lastDocument).toMatchObject({
      content: document.Data,
      mimeType: XDC_MIME,
      encoding: "base64",
    });
    // form identifier comes from the portal's Uri argument
    expect(fake.lastParameters).toMatchObject({
      identifier: document.Uri,
      containerXmlns: XDC_XMLNS_V1_1,
      packaging: "ENVELOPING",
    });
  });

  test("passes the getVersion plugin gate (XmlBpPlugin >= 2.0.0.13)", async () => {
    const { signer, shell } = setup();

    await signAsync(signer, asicRequest([xdcDocument()]));

    // an old/unparseable version string makes the portal show OLD_DSIGNER
    // ("Nainštalujte si najnovší balík aplikácií...") and never sign
    expect(shell.errors.filter((e) => e.includes("najnovší"))).toEqual([]);
  });

  test("signs a plain XML form via the 15-argument addXmlObject", async () => {
    const { fake, signer, shell } = setup();
    const document = plainXmlDocument();

    const result = await signAsync(signer, asicRequest([document]));

    expect(result).toBe(fake.signatureContent);
    expect(shell.errors).toEqual([]);
    expect(fake.lastDocument).toMatchObject({
      content: document.Data,
      mimeType: "application/xml",
    });
    expect(fake.lastParameters).toMatchObject({
      identifier: document.XmlFormId,
      schemaIdentifier: document.XsdUri,
      transformationIdentifier: document.XsltUri,
      // portal passes ditec.dSigXadesBpJs.XML_MEDIA_DESTINATION_TYPE_DESC_TXT;
      // undefined here means the constant is missing from our adapter
      transformationMediaDestinationTypeDescription: "TXT",
      transformationLanguage: document.Language,
      // EmbedSchemaAndTransformation=false → xdcIncludeRefs=true → no embedding
      embedUsedSchemas: false,
    });
  });

  test("user cancellation is silenced by the portal's error handler", async () => {
    const { fake, signer, shell } = setup();
    fake.nextSignError = {
      name: "AutogramError",
      code: "user-cancelled",
      message: "User cancelled signing",
    };

    let result: unknown = "not-called";
    signer.sign(asicRequest([xdcDocument()]), (r: unknown) => {
      result = r;
    });
    await settle();

    // DSignerMulti: DitecError with code 1 → return; (no dialog, no result)
    expect(result).toBe("not-called");
    expect(shell.errors).toEqual([]);
    expect(shell.alerts).toEqual([]);
  });

  test("signing failure reaches the portal's error dialog with our message", async () => {
    const { fake, signer, shell } = setup();
    fake.nextSignError = new Error("podpisovanie zlyhalo");

    signer.sign(asicRequest([xdcDocument()]), () => {
      throw new Error("must not succeed");
    });
    await settle();

    // unknown code (-200) → getErrorMessage falls back to e.message;
    // without name === "DitecError" the portal would rethrow instead
    expect(shell.errors).toEqual(["podpisovanie zlyhalo"]);
  });

  test("multiple documents fail loudly instead of signing only the last one", async () => {
    const { signer, shell } = setup();

    let result: unknown = "not-called";
    signer.sign(
      asicRequest([xdcDocument("doc-1"), xdcDocument("doc-2")]),
      (r: unknown) => {
        result = r;
      }
    );
    await settle();

    expect(result).toBe("not-called");
    expect(shell.errors).toHaveLength(1);
    expect(shell.errors[0]).toContain("viacerých dokumentov");
  });
});

describeWithFixture("schranka XAdES flow (dSigXadesJs, legacy XAdES_ZEP)", () => {
  test("envelope version 1.0 completes deploy → setSigningTimeProcessing → sign", async () => {
    const { fake, signer, shell } = setup();

    const result = await signAsync(
      signer,
      xadesRequest("1.0", [plainXmlDocument()])
    );

    // getSignedXmlWithEnvelopeBase64 currently maps to an ASiC container;
    // this locks the flow (deploy exists, nothing hangs), not the artifact
    expect(result).toBe(fake.signatureContent);
    expect(shell.errors).toEqual([]);
  });

  test("envelope version 1.1 (sign11) fails visibly instead of hanging", async () => {
    const { signer, shell } = setup();

    let result: unknown = "not-called";
    signer.sign(xadesRequest("1.1", [plainXmlDocument()]), (r: unknown) => {
      result = r;
    });
    await settle();

    expect(result).toBe("not-called");
    expect(shell.errors).toHaveLength(1);
    expect(shell.errors[0]).toContain("sign11");
  });

  test("envelope version 2.0 (sign20) fails visibly instead of hanging", async () => {
    const { signer, shell } = setup();

    let result: unknown = "not-called";
    signer.sign(xadesRequest("2.0", [plainXmlDocument()]), (r: unknown) => {
      result = r;
    });
    await settle();

    expect(result).toBe("not-called");
    expect(shell.errors).toHaveLength(1);
    expect(shell.errors[0]).toContain("sign20");
  });
});
