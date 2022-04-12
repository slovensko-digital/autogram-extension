import { ditecX } from "./ditecx";

/**
 * @jest-environment jsdom
 */

describe("has ditec structure", () => {
  test("XADES addXmlObject", () => {
    expect(ditecX.dSigXadesJs.addXmlObject).toStrictEqual(expect.any(Function));
  });
  test("XADES-BP", () => {
    expect(ditecX.dSigXadesBpJs.addXmlObject).toStrictEqual(
      expect.any(Function)
    );
  });
});

describe("mocked", () => {
  test("basic", (done) => {
    const ds = ditecX.dSigXadesJs;

    const runTest = (signedData) => {
      expect(signedData).toBeTruthy();
      done();
    };

    const runSign = () => {
      ds.sign("sign-id", ds.SHA256, ds.SHA256, {
        onSuccess: runTest,
        onError: (err) => {
          done(err);
        },
      });
    };

    ds.addXmlObject(
      "test-id",
      "object",
      "<xml>object",
      "<xsd",
      "http://namespace-uri",
      "xsd-reference",
      "<xsl",
      "xsl-reference",
      {
        onSuccess: runSign,
        onError: (err) => {
          done(err);
        },
      }
    );
  });
});
