
jest.mock("../../injected-ui");
jest.mock("../../client");

import { ditecX } from "./ditecx";
// import { AutogramRoot, createUI, SigningMethod } from "../../injected-ui";
// import { apiClient } from "../../client";
// import { AvmChannelWeb } from "../autogram/avm-channel";

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

describe("upvs", async () => {
  beforeAll(() => {});
  test("basic", async () => {
    const ds = ditecX.dSigXadesJs;
    await asPromise(ds.addTxtObject)(
      "objectId.txt",
      "objectDescription",
      "sourceTxt",
      "objectFormatIdentifier"
    );
    await asPromise(ds.sign)(
      "signatureId",
      ds.SHA256,
      "signaturePolicyIdentifier"
    );
    const signature = await asPromise(ds.getSignedXmlWithEnvelopeBase64)();

    expect(signature).toBe(expect.any(String));
  });
});

describe("financnasprava", () => {});

function asPromise<T = unknown>(
  fn: (...args: unknown[]) => void
): (...args: unknown[]) => Promise<T> {
  function wrapped(...args: unknown[]) {
    return new Promise<T>((resolve, reject) => {
      const newArgs = [
        ...args,
        {
          onSuccess: resolve,
          onError: reject,
        },
      ];
      fn(...newArgs);
    });
  }
  return wrapped;
}
