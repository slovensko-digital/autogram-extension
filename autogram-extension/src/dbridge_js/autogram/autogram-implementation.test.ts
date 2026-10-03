import type { SignedDocumentResult } from "autogram-sdk";
import type { ExtensionOptions } from "../../options/default";
import { SignRequest } from "../ditecx/sign-request";
import type { ObjectXadesBpTxt } from "../ditecx/types";
import { DBridgeAutogramImpl } from "./autogram-implementation";

// The dialog client is replaced by a fake; don't register its custom elements.
jest.mock("autogram-sdk/with-ui", () => ({ createAutogramClient: jest.fn() }));

const SIGNED: SignedDocumentResult = {
  content: "c2lnbmVk",
  mimeType: "application/vnd.etsi.asic-e+zip",
  encoding: "base64",
  signatures: [{ signedBy: "CN=John Smith", issuedBy: "CN=SVK eID ACA2" }],
};

const TXT: ObjectXadesBpTxt = {
  type: "XadesBpTxt",
  objectId: "doc-1",
  objectDescription: "description",
  sourceTxt: "text",
  objectFormatIdentifier: "http://example.com/format",
};

function createImpl() {
  const client = {
    sign: jest.fn(async () => SIGNED),
    setResetSignRequestCallback: jest.fn(),
    useRestorePoint: jest.fn(async () => null),
  };
  const options = { restorePointEnabled: false } as ExtensionOptions;
  const Impl = DBridgeAutogramImpl as unknown as new (
    c: typeof client,
    o: ExtensionOptions
  ) => DBridgeAutogramImpl;
  return { impl: new Impl(client, options), client };
}

describe("DBridgeAutogramImpl.getSignature", () => {
  test("converts the legacy D.Bridge parameters for CombinedClient.sign", async () => {
    const { impl, client } = createImpl();
    await impl.sign(
      "sig-1",
      "http://www.w3.org/2001/04/xmlenc#sha256",
      "policy"
    );
    impl.addObject(TXT);

    await expect(impl.getSignature({})).resolves.toBe(SIGNED.content);

    // what the D.Bridge layer computes in the legacy (`POST /sign`) shape
    const reference = new SignRequest();
    reference.addObject(TXT);
    const legacy = reference.signatureParameters({});

    const [document, parameters, options] = client.sign.mock
      .calls[0] as unknown as [
      Record<string, unknown> & { xdcParameters?: Record<string, unknown> },
      Record<string, unknown>,
      Record<string, unknown>,
    ];
    expect(document).toMatchObject(reference.documentToSign);
    expect(parameters).toMatchObject({
      form: "XAdES",
      profile: "BASELINE_B",
      packaging: legacy.packaging,
      digestAlgorithm: legacy.digestAlgorithm,
      checkPDFACompliance: legacy.checkPDFACompliance,
    });
    expect(parameters).not.toHaveProperty("level");
    expect(parameters).not.toHaveProperty("identifier");
    // XDC parameters travel with the document
    expect(document.xdcParameters).toMatchObject({
      identifier: legacy.identifier,
      embedUsedSchemas: legacy.embedUsedSchemas,
    });
    expect(options).toEqual({});
  });

  test("decodes the content when asked", async () => {
    const { impl } = createImpl();
    await impl.sign("sig-1", "alg", "policy");
    impl.addObject(TXT);
    await expect(impl.getSignature({}, true)).resolves.toBe("signed");
  });
});
