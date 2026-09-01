/**
 * Portal contract tests: replay the real obcan.justice.sk
 * "Podpisovanie dokumentov" signing driver
 * (tests/fixtures/portals/justice-sign-pdf-20260716.js) against our
 * `window.ditec` replacement. The driver script runs verbatim — the
 * deploy/initialize choreography on page load, the checkPDFACompliance →
 * addPdfObject → sign → getSignatureWithASiCEnvelopeBase64 chain and the
 * `ditec.utils.isDitecError` error branching are theirs; only the page
 * shell (jQuery, sign form DOM) and the signer backend
 * (FakeImplementation) are test doubles.
 *
 * obcan.justice.sk is configured with the immutable-proxy conflict
 * resolution (supported-sites.ts), so the replay talks to
 * `wrapWithProxy(buildDitecX(...))` exactly like the production page.
 *
 * The repeated-signature scenarios pin down the report in issue #101
 * (https://github.com/slovensko-digital/autogram-extension/issues/101#issuecomment-4978486015):
 * the first signature works, but signing again — another document, adding
 * a signature, or re-signing after removing the first one — falls back to
 * D.Launcher / fails.
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
import { wrapWithProxy } from "../proxy";
import { FakeImplementation } from "./testing/fake-implementation";
import { FETCH_FIXTURES_HINT } from "./testing/load-dsigner-multi";
import {
  hasJusticeSignFixture,
  loadJusticeSignDriver,
} from "./testing/load-justice-sign";

// The portal script is fetched on demand, not vendored (licensing) —
// without it these suites skip visibly instead of failing.
const describeWithFixture = hasJusticeSignFixture() ? describe : describe.skip;
if (!hasJusticeSignFixture()) {
  console.warn(`portal-justice.test.ts: ${FETCH_FIXTURES_HINT}`);
}

/** Stands in for the uploaded PDF the page renders into #sourcePdf. */
const SOURCE_PDF_BASE64 = Base64.encode("%PDF-1.4 sample");

function setup() {
  const fake = new FakeImplementation();
  const ditecX = buildDitecX(fake);
  // The site's production conflict resolution: page code talks to an
  // immutable proxy around our ditec, never to the object directly.
  const ditec = wrapWithProxy(ditecX);
  const { shell } = loadJusticeSignDriver(ditec, SOURCE_PDF_BASE64);
  return { fake, ditecX, shell };
}

/** Let the adapter promise chains and portal callbacks settle. */
function settle(ms = 30): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describeWithFixture("justice.sk sign page load", () => {
  test("deploy + initialize complete and reveal the sign button", async () => {
    const { shell } = setup();
    await settle();

    // The driver deploys with dLauncher platforms in the list
    // (["dotNet","java","dLauncherJava","dLauncherDotNet"]); our deploy
    // must answer onSuccess itself — if the real D.Bridge handled it,
    // D.Launcher would open. onSuccessInit then reveals the button.
    expect(shell.signButtonVisible()).toBe(true);
    expect(shell.loadingRemoved()).toBe(true);
    expect(shell.errors).toEqual([]);
  });

  test("the driver's ditec.config.downloadPage assignment is absorbed by the immutable proxy", async () => {
    const { ditecX } = setup();
    await settle();

    // The page sets ditec.config.downloadPage on load; the immutable proxy
    // must swallow it silently (sloppy-mode set) without mutating ours.
    expect(ditecX.config.downloadPage).toEqual({ url: "", title: "" });
  });
});

describeWithFixture("justice.sk PDF signing (dSigXadesBpJs, ASiC)", () => {
  test("signs the uploaded PDF end to end", async () => {
    const { fake, shell } = setup();

    shell.clickSign();
    await settle();

    // checkPDFACompliance → addPdfObject → sign →
    // getSignatureWithASiCEnvelopeBase64 → signForm.submit, no errors
    expect(shell.errors).toEqual([]);
    expect(shell.submits).toEqual([fake.signatureContent]);
    // the PDF/A conversion path must not run (our compliance check passes)
    expect(shell.convertedPosts).toEqual([]);

    expect(fake.lastDocument).toMatchObject({
      content: SOURCE_PDF_BASE64,
      // the driver passes the uploaded filename as the object id
      filename: "sample.pdf",
      mimeType: "application/pdf",
      encoding: "base64",
    });
    expect(fake.lastParameters).toMatchObject({
      identifier: "http://schemas.gov.sk/attachment/pdf",
      container: "ASiC_E",
      packaging: "ENVELOPING",
    });
  });

  test("a second signature on the same page signs again (issue #101)", async () => {
    const { fake, shell } = setup();

    // First signature succeeds (per the report), then the user signs again
    // — another document / re-adding a signature — without a page reload.
    shell.clickSign();
    await settle();
    shell.clickSign();
    await settle();

    expect(shell.errors).toEqual([]);
    expect(shell.submits).toEqual([
      fake.signatureContent,
      fake.signatureContent,
    ]);
  });

  // Currently broken (issue #101 "second attempt fails"): after a cancelled
  // attempt the sign request keeps its document (signingStatus stays
  // "started", never "signed"), so the retry's addPdfObject hits the
  // multiple-documents guard in SignRequest.addObject and the user can
  // never sign. Flip to a plain `test` once the shim resets the request
  // on a failed/cancelled attempt.
  test.failing("retrying after the user cancelled signs the document", async () => {
    const { fake, shell } = setup();
    fake.nextSignError = {
      name: "AutogramError",
      code: "user-cancelled",
      message: "User cancelled signing",
    };

    shell.clickSign();
    await settle();
    expect(shell.submits).toEqual([]);

    shell.clickSign();
    await settle();

    expect(shell.submits).toEqual([fake.signatureContent]);
    expect(
      shell.errors.filter((e) => e.includes("viacerých dokumentov"))
    ).toEqual([]);
  });

  // Same stuck-request bug as above, for a non-cancel signing failure.
  test.failing("retrying after a signing failure signs the document", async () => {
    const { fake, shell } = setup();
    fake.nextSignError = new Error("podpisovanie zlyhalo");

    shell.clickSign();
    await settle();
    expect(shell.submits).toEqual([]);

    shell.clickSign();
    await settle();

    expect(shell.submits).toEqual([fake.signatureContent]);
    expect(
      shell.errors.filter((e) => e.includes("viacerých dokumentov"))
    ).toEqual([]);
  });

  // Currently broken: the driver passes an onError handler to sign() but
  // only onSuccess to getSignatureWithASiCEnvelopeBase64 (with the real
  // D.Signer the user interaction happens in sign(); the getter cannot
  // fail). Our implementation defers the actual signing to the getter, so
  // a failure (or user cancel) there has no onError to land in and
  // vanishes — the page shows nothing and the user is left with the stuck
  // request covered by the retry tests above. Signing must fail at the
  // sign() step (or the getter's error must be routed to the page) for the
  // message to reach the error box.
  test.failing("a signing failure reaches the page's error box with our message", async () => {
    const { fake, shell } = setup();
    fake.nextSignError = new Error("podpisovanie zlyhalo");

    shell.clickSign();
    await settle();

    // showError branches on ditec.utils.isDitecError: our adapter edge must
    // emit name === "DitecError", otherwise the page shows the generic
    // "Nastala neočakávaná chyba." instead of the real message
    expect(shell.errors).toEqual(["podpisovanie zlyhalo"]);
    expect(shell.submits).toEqual([]);
  });
});
