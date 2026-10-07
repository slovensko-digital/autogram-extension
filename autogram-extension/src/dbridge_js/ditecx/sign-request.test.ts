import { SignRequest, SigningStatus } from "./sign-request";
import { isDitecError, ObjectXadesBpTxt, ObjectXadesBpXml } from "./types";

function txtObject(objectId: string): ObjectXadesBpTxt {
  return {
    type: "XadesBpTxt",
    objectId,
    objectDescription: "description",
    sourceTxt: "text",
    objectFormatIdentifier: "http://example.com/format",
  };
}

describe("SignRequest.addObject", () => {
  test("accepts a single object", () => {
    const request = new SignRequest();
    request.addObject(txtObject("doc-1"));
    expect(request.object.objectId).toBe("doc-1");
  });

  test("rejects a second unsigned object with a DitecError", () => {
    // Portals chain several add*Object calls to sign multiple documents
    // at once; we support one document per signature and must not
    // silently sign only the last one.
    const request = new SignRequest();
    request.addObject(txtObject("doc-1"));
    let thrown: unknown;
    try {
      request.addObject(txtObject("doc-2"));
    } catch (e) {
      thrown = e;
    }
    expect(isDitecError(thrown)).toBe(true);
    expect(request.object.objectId).toBe("doc-1");
  });

  test("allows a new object after the previous one was signed", () => {
    const request = new SignRequest();
    request.addObject(txtObject("doc-1"));
    request.signingStatus = SigningStatus.signed;
    request.addObject(txtObject("doc-2"));
    expect(request.object.objectId).toBe("doc-2");
  });
});

describe("XadesBpXml identifier", () => {
  function xmlObject(
    overrides: Partial<ObjectXadesBpXml> = {}
  ): ObjectXadesBpXml {
    return {
      type: "XadesBpXml",
      objectId: "object_1",
      objectDescription: "XML",
      objectFormatIdentifier: "http://schemas.gov.sk/form/App.Form/1.0",
      xdcXMLData: "<Form/>",
      xdcIdentifier: "http://data.gov.sk/doc/eform/App.Form",
      xdcVersion: "1.0",
      xdcUsedXSD: "<xs:schema/>",
      xsdReferenceURI: "http://schemas.gov.sk/form/App.Form/1.0/form.xsd",
      xdcUsedXSLT: "<xsl:stylesheet/>",
      xslReferenceURI: "http://schemas.gov.sk/form/App.Form/1.0/form.xslt",
      xslMediaDestinationTypeDescription: "TXT",
      xslXSLTLanguage: "sk",
      xslTargetEnvironment: "",
      xdcIncludeRefs: true,
      xdcNamespaceURI:
        "http://data.gov.sk/def/container/xmldatacontainer+xml/1.1",
      ...overrides,
    };
  }

  function identifierOf(obj: ObjectXadesBpXml) {
    const request = new SignRequest();
    request.addObject(obj);
    return request.signatureParameters({}).identifier;
  }

  test("appends xdcVersion to a versionless xdcIdentifier", () => {
    expect(identifierOf(xmlObject())).toBe(
      "http://data.gov.sk/doc/eform/App.Form/1.0"
    );
  });

  test("falls back to objectFormatIdentifier when xdcIdentifier and xdcVersion are empty", () => {
    // esluzbykosice.sk lomtec Signer widget: addXmlObject(id, "XML",
    // XmlReference, Xml, "", "", Xsd, XsdReference, ...)
    const formId =
      "http://schemas.gov.sk/form/esmao.eforms.kosice.egov_1985/201501.4";
    expect(
      identifierOf(
        xmlObject({
          objectFormatIdentifier: formId,
          xdcIdentifier: "",
          xdcVersion: "",
        })
      )
    ).toBe(formId);
  });
});
