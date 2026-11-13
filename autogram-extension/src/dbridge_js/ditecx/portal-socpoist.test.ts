/**
 * Portal contract tests for the new Sociálna poisťovňa portal
 * (esluzby.socpoist.sk/moj-portal, issue #272): replay the portal's real
 * SignerService together with the slovensko.sk D.Bridge v1.0 scripts it
 * loads, against our `window.ditec` behind the production immutable proxy.
 * The scripts run verbatim; only the signer backend (FakeImplementation)
 * is a test double.
 *
 * The portal loads these scripts lazily, after the extension installed its
 * `ditec`, so the real D.Bridge library always evaluates on top of ours.
 */
jest.mock("../autogram/autogram-implementation", () => ({
  DBridgeAutogramImpl: {
    init: async () => {
      throw new Error("not used in portal contract tests");
    },
  },
}));

import { buildDitecX, DitecX } from "./ditecx";
import { immutableDitec } from "../immutable-ditec";
import { FakeImplementation } from "./testing/fake-implementation";
import { FETCH_FIXTURES_HINT } from "./testing/load-dsigner-multi";
import {
  hasSocpoistSignerFixtures,
  loadSocpoistSigner,
  SignXmlData,
} from "./testing/load-socpoist-signer";

const describeWithFixture = hasSocpoistSignerFixtures()
  ? describe
  : describe.skip;
if (!hasSocpoistSignerFixtures()) {
  console.warn(`portal-socpoist.test.ts: ${FETCH_FIXTURES_HINT}`);
}

const FORM: SignXmlData = {
  namespace: "http://socpoist.sk/test-form",
  uuid: "11111111-1111-1111-1111-111111111111",
  formTitle: "Testovací formulár",
  xml: "<form>test</form>",
  formVersion: "1.0",
  xsd: "<xs:schema/>",
  xslt: "<xsl:stylesheet/>",
  langId: "sk",
};

function setup() {
  const fake = new FakeImplementation();
  const ditecX = buildDitecX(fake);
  const original = {
    dSigXadesJs: ditecX.dSigXadesJs,
    dSigXadesBpJs: ditecX.dSigXadesBpJs,
    isDitecError: ditecX.utils.isDitecError,
    keys: Object.keys(ditecX).sort(),
    utilsKeys: Object.keys(ditecX.utils).sort(),
  };
  const page = loadSocpoistSigner(immutableDitec(ditecX));
  return { fake, ditecX, original, page };
}

describeWithFixture("esluzby.socpoist.sk signing (#272)", () => {
  test("the late D.Bridge library leaves our ditec untouched", () => {
    const { ditecX, original, page } = setup();

    expect(ditecX.dSigXadesJs).toBe(original.dSigXadesJs);
    expect(ditecX.dSigXadesBpJs).toBe(original.dSigXadesBpJs);
    expect(ditecX.utils.isDitecError).toBe(original.isDitecError);
    // Nothing was added either — in particular no original
    // dSigXadesExtenderJs / dbridge2 / dLauncher the portal could find.
    expect(Object.keys(ditecX).sort()).toEqual(original.keys);
    expect(Object.keys(ditecX.utils).sort()).toEqual(original.utilsKeys);
    expect((page.ditec as DitecX).isAutogram).toBe(true);
  });

  test("the strict-mode D.Bridge scripts stop at their first write", () => {
    const { page } = setup();

    // Each is an isolated <script>: the error ends that script only.
    expect(Object.keys(page.scriptErrors).sort()).toEqual([
      "sksk-dbridge-v1.0-dCommon-20261113.js",
      "sksk-dbridge-v1.0-dSigXades-20261113.js",
      "sksk-dbridge-v1.0-dSigXadesBp-20261113.js",
      "sksk-dbridge-v1.0-dSigXadesExtender-20261113.js",
      "sksk-dbridge-v1.0-dViewer-20261113.js",
    ]);
    for (const error of Object.values(page.scriptErrors)) {
      expect((error as Error).name).toBe("TypeError");
    }
  });

  test("signs a form", async () => {
    const { fake, page } = setup();

    await expect(page.signXml(FORM)).resolves.toEqual({
      status: "success",
      response: fake.signatureContent,
    });
    expect(fake.lastParameters).toMatchObject({
      container: "ASiC_E",
      level: "XAdES_BASELINE_B",
    });
    expect(fake.lastDocument).toMatchObject({ content: FORM.xml });
  });

  test("signs again without reloading the page", async () => {
    const { fake, page } = setup();

    await expect(page.signXml(FORM)).resolves.toMatchObject({
      status: "success",
    });
    await expect(
      page.signXml({ ...FORM, xml: "<form>second</form>" })
    ).resolves.toMatchObject({ status: "success" });
    expect(fake.lastDocument).toMatchObject({ content: "<form>second</form>" });
  });

  test("reports user cancellation as the portal's cancel status", async () => {
    const { fake, page } = setup();
    fake.nextSignError = {
      name: "AutogramError",
      code: "user-cancelled",
      message: "User cancelled signing",
    };

    await expect(page.signXml(FORM)).resolves.toEqual({
      status: "cancel",
      response: "signingCancelledByUserLauncher2",
    });
  });

  test("an ASiC attachment fails with the portal's own message, not D.Launcher", async () => {
    const { page } = setup();

    // SignerService joins ASiC attachments via the optional extender
    // component. It must not find the original D.Bridge one (which would
    // launch D.Launcher → DB206), so the portal reports it as unavailable.
    await expect(
      page.signXml(FORM, [
        {
          id: "att1",
          fileName: "priloha.asice",
          mimeType: "application/vnd.etsi.asic-e+zip",
          contentBase64: "UEsDBAo=",
        },
      ])
    ).resolves.toEqual({
      status: "error",
      response: "errorAsicFactoryUnavailable",
    });
  });
});
