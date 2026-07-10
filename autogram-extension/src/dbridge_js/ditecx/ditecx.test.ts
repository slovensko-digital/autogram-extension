jest.mock("../autogram/autogram-implementation", () => {
  const implementation = {
    launch: async () => {},
    setLanguage: () => {},
    sign: async () => {},
    addObject: () => {},
    getSignature: async () => "signature-base64",
    getSignerIdentification: () => "signer",
    getOriginalObject: () => "original",
    getVersion: () => "test-version",
  };
  return {
    DBridgeAutogramImpl: {
      init: async () => implementation,
    },
  };
});

import { constructDitecX, DitecX } from "./ditecx";

/**
 * @jest-environment jsdom
 */

describe("has ditec structure", () => {
  let ditecX: DitecX;
  beforeAll(async () => {
    ditecX = await constructDitecX();
  });
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
  let ditecX: DitecX;
  beforeAll(async () => {
    ditecX = await constructDitecX();
  });
  test("basic", (done) => {
    const ds = ditecX.dSigXadesJs;

    // sign() resolves void; reaching onSuccess means the add→sign chain completed.
    const runTest = () => {
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

describe("upvs", () => {
  let ditecX: DitecX;
  beforeAll(async () => {
    ditecX = await constructDitecX();
  });
  test("basic", async () => {
    const ds = ditecX.dSigXadesJs;
    await asPromise(ds.addTxtObject.bind(ds))(
      "objectId.txt",
      "objectDescription",
      "sourceTxt",
      "objectFormatIdentifier"
    );
    await asPromise(ds.sign.bind(ds))(
      "signatureId",
      ds.SHA256,
      "signaturePolicyIdentifier"
    );
    const signature = await asPromise(
      ds.getSignedXmlWithEnvelopeBase64.bind(ds)
    )();

    expect(signature).toEqual(expect.any(String));
  });
});

describe("financnasprava", () => {});

// Method surface exercised by schranka.slovensko.sk DSignerMulti.js
describe("schranka portal compatibility", () => {
  let ditecX: DitecX;
  beforeAll(async () => {
    ditecX = await constructDitecX();
  });

  test("deploy exists on the non-BP object and succeeds", (done) => {
    ditecX.dSigXadesJs.deploy(
      { platforms: ["dotNet", "java"] },
      { onSuccess: () => done(), onError: done }
    );
  });

  test("setSigningTimeProcessing completes via onSuccess", (done) => {
    ditecX.dSigXadesJs.setSigningTimeProcessing(false, true, {
      onSuccess: () => done(),
      onError: done,
    });
  });

  test("unsupported methods fail via onError with a DitecError", (done) => {
    ditecX.dSigXadesJs.sign11("id", "alg", "policy", "eid", "euri", "edescr", {
      onSuccess: () => done(new Error("sign11 must not succeed")),
      onError: (e: { name?: string; code?: number }) => {
        expect(e.name).toBe("DitecError");
        expect(e.code).toBeLessThan(0);
        done();
      },
    });
  });

  test("BP timestamp methods fail via onError instead of TypeError", (done) => {
    ditecX.dSigXadesBpJs.getSignatureTimeStampTokenBase64({
      onSuccess: () => done(new Error("must not succeed")),
      onError: (e: { name?: string }) => {
        expect(e.name).toBe("DitecError");
        done();
      },
    });
  });
});

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
