/**
 * Portal contract tests: replay the real nove.slovensko.sk message
 * composer's signing driver
 * (tests/fixtures/portals/DSignerMulti-nove-20260830.js, served from
 * message-constructor-web.slovensko.sk) against our `window.ditec`
 * replacement.
 *
 * This is the same DSignerMulti family as schranka.slovensko.sk
 * (portal-schranka.test.ts) but a newer build, with two behavioural
 * differences confirmed by diffing the two vendored fixtures:
 *  - the default `Callback.onError` no longer shows a MessageBox dialog for
 *    a `DitecError`; it `throw`s the error code instead (see the
 *    "default onError" test below).
 *  - `DSigner` now exposes a public `setLanguage(language)` that forwards
 *    to `dSigXadesJs`/`dSigXadesBpJs` if present — already supported by our
 *    adapter (dsig-base-adapter.ts).
 * Everything else (deploy → initialize → getVersion gate → addXmlObject2 →
 * sign → getSignatureWithASiCEnvelopeBase64 choreography) runs verbatim
 * from the portal script.
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
  hasDSignerMultiNoveFixture,
  loadDSignerMulti,
  NOVE_FIXTURE_PATH,
} from "./testing/load-dsigner-multi";

// The portal script is fetched on demand, not vendored (licensing) —
// without it these suites skip visibly instead of failing.
const describeWithFixture = hasDSignerMultiNoveFixture()
  ? describe
  : describe.skip;
if (!hasDSignerMultiNoveFixture()) {
  console.warn(`portal-nove.test.ts: ${FETCH_FIXTURES_HINT}`);
}

const XDC_MIME = "application/vnd.gov.sk.xmldatacontainer+xml";
const XDC_XMLNS_V1_1 =
  "http://data.gov.sk/def/container/xmldatacontainer+xml/1.1";

function setup() {
  const fake = new FakeImplementation();
  const ditec = buildDitecX(fake);
  const portal = loadDSignerMulti(ditec, NOVE_FIXTURE_PATH);
  const signer = new portal.DSigner();
  return { fake, ditec, signer, shell: portal.shell };
}

/** eDesk XDC document, same shape as schranka's. */
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

function asicRequest(documents: unknown[], overrides: object = {}) {
  return {
    SignatureType: "ASiC",
    SignatureId: "Signature-1",
    Documents: documents,
    ...overrides,
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

/**
 * Same `DitecError` shape `dsig-base-adapter.ts`'s `resolve()` hands to
 * `Callback.onError` on a rejected implementation call
 * (`callback.onError?.(toDitecError(error))`).
 */
function ditecError(code: number, message: string) {
  const error = new Error(message) as Error & { name: string; code: number };
  error.name = "DitecError";
  error.code = code;
  return error;
}

describeWithFixture("nove ASiC flow (dSigXadesBpJs)", () => {
  test("signs an XML data container end to end", async () => {
    const { fake, signer, shell } = setup();
    const document = xdcDocument();

    const result = await signAsync(signer, asicRequest([document]));

    expect(result).toBe(fake.signatureContent);
    expect(shell.errors).toEqual([]);
    expect(shell.alerts).toEqual([]);
    expect(fake.lastDocument).toMatchObject({
      content: document.Data,
      mimeType: XDC_MIME,
      encoding: "base64",
    });
    expect(fake.lastParameters).toMatchObject({
      identifier: document.Uri,
      containerXmlns: XDC_XMLNS_V1_1,
      packaging: "ENVELOPING",
    });
  });

  test("passes the getVersion plugin gate (XmlBpPlugin >= 2.0.0.13)", async () => {
    const { signer, shell } = setup();

    await signAsync(signer, asicRequest([xdcDocument()]));

    expect(shell.errors.filter((e) => e.includes("najnovší"))).toEqual([]);
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

    // DSignerMulti: DitecError with code 1 → return; (no dialog, no result,
    // no throw) — unchanged from schranka's build
    expect(result).toBe("not-called");
    expect(shell.errors).toEqual([]);
    expect(shell.alerts).toEqual([]);
  });

  // A real ERROR_GENERAL/multi-document failure reaching the *default*
  // Callback.onError (the two paths schranka's build reports through
  // MessageBox.displayError, see portal-schranka.test.ts) can't be driven
  // end to end through signer.sign() here: nove's onError now does
  // `throw e.code` instead of showing a dialog, and that throw happens
  // inside a `Promise.resolve().then(...)` microtask
  // (dsig-base-adapter.ts's `resolve()`) that jsdom/jest sandbox from the
  // test file's own `process`/`window` — see the investigation in this PR.
  // Instead we exercise `Callback`'s default `onError` directly, exactly as
  // the portal script would invoke it via `callback.onError(toDitecError(e))`.
  test("default onError throws the bare error code instead of showing a dialog", () => {
    // Behavioural difference from schranka's build: the default onError no
    // longer calls MessageBox.displayError(getErrorMessage(...)) for a
    // DitecError — it `throw`s just `e.code`. The human-readable message
    // ("podpisovanie zlyhalo" / "...viacerých dokumentov...") is lost;
    // only the bare error code (e.g. ERROR_GENERAL, -200) escapes.
    const { ditec, shell } = setup();
    const portal = loadDSignerMulti(ditec, NOVE_FIXTURE_PATH);
    const callback = new portal.Callback();

    let thrown: unknown;
    try {
      callback.onError(ditecError(-200, "podpisovanie zlyhalo"));
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBe(-200);
    // ...whereas schranka's build would have called MessageBox.displayError
    // with the mapped message and never thrown.
    expect(shell.errors).toEqual([]);
  });

  test("cancellation (code 1) is still silenced, not thrown", () => {
    // Unchanged from schranka's build: `if (e.code === 1) return;` runs
    // before the throw branch.
    const { ditec } = setup();
    const portal = loadDSignerMulti(ditec, NOVE_FIXTURE_PATH);
    const callback = new portal.Callback();

    expect(() => callback.onError(ditecError(1, "Storno"))).not.toThrow();
  });
});

describeWithFixture("nove setLanguage", () => {
  test("forwards to the implementation via the adapter", () => {
    const { fake, signer } = setup();

    (signer as unknown as { setLanguage(language: string): void }).setLanguage(
      "sk"
    );

    // DSigner.setLanguage forwards to both dSigXadesJs and dSigXadesBpJs
    // when present, so the fake implementation sees it twice.
    expect(fake.languages).toEqual(["sk", "sk"]);
  });
});
