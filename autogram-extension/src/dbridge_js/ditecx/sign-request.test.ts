import { SignRequest, SigningStatus } from "./sign-request";
import { isDitecError, ObjectXadesBpTxt } from "./types";

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
