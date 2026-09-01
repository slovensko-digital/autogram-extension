/**
 * Portal contract test for pfseform.financnasprava.sk (PFS).
 *
 * Unlike schranka's DSignerMulti.js, the PFS signer lives inside a ~230 kB
 * page bundle coupled to their Knockout viewmodels, so it cannot be loaded
 * verbatim. This test is a line-for-line distillation of the EKR2 (ASiC)
 * signing path from `/bundles/pfs` (`Podanie.prototype.Sign` →
 * `deployCallback` → `initializedCallback` → `addObjectCallback` →
 * `signCalback`), including their `_ready` shortcut and
 * `getUserNameFromSignature` parsing. If the bundle changes, refresh via
 * scripts/check-portal-drift.sh + the vendored notes in
 * tests/fixtures/portals/README.md.
 */
jest.mock("../autogram/autogram-implementation", () => ({
  DBridgeAutogramImpl: {
    init: async () => {
      throw new Error("not used in portal contract tests");
    },
  },
}));

import { buildDitecX, DitecX } from "./ditecx";
import { FakeImplementation } from "./testing/fake-implementation";

/** Verbatim from the PFS bundle (fallback branch: no X509SubjectName tag). */
function getUserNameFromSignature(signature: string): string {
  let userStart = signature.indexOf("X509SubjectName>");
  if (userStart == -1) {
    userStart = signature.indexOf("CN=");
    let userEnd = signature.indexOf(",", userStart + 1);
    if (userEnd == -1) {
      userEnd = signature.indexOf("<", userStart + 1);
      if (userEnd == -1) {
        return signature.substring(userStart + 3);
      }
    }
    return signature.substring(userStart + 3, userEnd);
  } else {
    const user = signature.substring(
      userStart,
      signature.indexOf("X509SubjectName>", userStart + 1)
    );
    userStart = user.indexOf("CN=");
    let userEnd = user.indexOf(",", userStart + 1);
    if (userEnd == -1) userEnd = user.indexOf("<", userStart + 1);
    return user.substring(userStart + 3, userEnd);
  }
}

/**
 * The EKR2 signing sequence as the PFS bundle performs it. Callback shape
 * matches their `common.Callback` (onSuccess only; onError raises).
 */
function pfsSignFlow(
  ditec: DitecX,
  form: {
    objectId: string;
    objectDescription: string;
    xdcNamespaceUri: string;
    xdcVersion: string;
    contentXml: string;
    contentXsd: string;
    xsdReference: string;
    contentXslt: string;
    xslReference: string;
  }
): Promise<{ username: string; signature: string }> {
  return new Promise((resolve, reject) => {
    const callback = (onSuccess: (value?: never) => void) => ({
      onSuccess,
      onError: reject,
    });

    // Podanie.prototype.Sign: deploy is skipped entirely when _ready
    if (!ditec.dSigXadesBpJs._ready) {
      reject(new Error("PFS would run detectSupportedPlatforms + deploy"));
      return;
    }

    // objectFormatIdentifier derivation from Podanie.initializedCallback
    let objectFormatIdentifier = form.xdcNamespaceUri;
    const values = form.xdcNamespaceUri.split("/");
    if (values.length > 1 && form.xdcVersion !== values[values.length - 1]) {
      objectFormatIdentifier = form.xdcNamespaceUri + "/" + form.xdcVersion;
    }

    ditec.dSigXadesBpJs.initialize(
      callback(() => {
        ditec.dSigXadesBpJs.addXmlObject(
          "Object" + form.objectId,
          form.objectDescription,
          objectFormatIdentifier,
          form.contentXml,
          form.xdcNamespaceUri,
          form.xdcVersion,
          form.contentXsd,
          form.xsdReference,
          form.contentXslt,
          form.xslReference,
          "TXT",
          "",
          "",
          true,
          "http://data.gov.sk/def/container/xmldatacontainer+xml/1.1",
          callback(() => {
            ditec.dSigXadesBpJs.sign(
              "SignatureId20260710120000",
              ditec.dSigXadesBpJs.SHA256,
              "",
              callback(() => {
                ditec.dSigXadesBpJs.getSignerIdentification(
                  callback((name) => {
                    const username = getUserNameFromSignature(String(name));
                    ditec.dSigXadesBpJs.getSignatureWithASiCEnvelopeBase64(
                      callback((signature) => {
                        resolve({ username, signature: String(signature) });
                      })
                    );
                  })
                );
              })
            );
          })
        );
      })
    );
  });
}

describe("PFS EKR2 (ASiC) flow", () => {
  test("_ready shortcut, addXmlObject, signer identification and signature", async () => {
    const fake = new FakeImplementation();
    fake.signerIdentification = "SERIALNUMBER=PNOSK-1234567890, CN=Ing. Ján Testovací, C=SK";
    const ditec = buildDitecX(fake);

    const { username, signature } = await pfsSignFlow(ditec, {
      objectId: "123",
      objectDescription: "Daňové priznanie k DPH",
      xdcNamespaceUri: "http://ekrform.financnasprava.sk/Formulare/dphv17",
      xdcVersion: "1.5",
      contentXml: "<dokument/>",
      contentXsd: "<xs:schema/>",
      xsdReference: "http://ekrform.financnasprava.sk/Formulare/dphv17/form.xsd",
      contentXslt: "<xsl:stylesheet/>",
      xslReference: "http://ekrform.financnasprava.sk/Formulare/dphv17/form.xsl",
    });

    expect(signature).toBe(fake.signatureContent);
    // their CN= parse must extract a human name from our identification
    expect(username).toBe("Ing. Ján Testovací");
    // identifier = xdcNamespaceUri + "/" + version (their derivation)
    expect(fake.lastParameters).toMatchObject({
      identifier:
        "http://ekrform.financnasprava.sk/Formulare/dphv17/1.5",
      containerXmlns:
        "http://data.gov.sk/def/container/xmldatacontainer+xml/1.1",
    });
  });

  test("fallback signer identification still yields a usable name", () => {
    // our fallback when the SDK reports no subject:
    // "CN=(Používateľ Autogramu #N)" — must not parse to garbage
    const parsed = getUserNameFromSignature("CN=(Používateľ Autogramu #1)");
    expect(parsed).toBe("(Používateľ Autogramu #1)");
  });
});
