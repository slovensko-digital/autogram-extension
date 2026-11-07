/** Regression for #272: the SPA loads D.Bridge after the document load event. */
jest.mock("./autogram/autogram-implementation", () => ({
  DBridgeAutogramImpl: { init: jest.fn() },
}));
jest.mock("../sentry", () => ({ captureException: jest.fn() }));
jest.mock("./autogram/native-autogram-intercept", () => ({
  installNativeAutogramIntercept: jest.fn(),
}));

import { DBridgeAutogramImpl } from "./autogram/autogram-implementation";
import { inject } from "./inject-ditec";
import { DitecX } from "./ditecx/ditecx";
import { FakeImplementation } from "./ditecx/testing/fake-implementation";
import { defaultOptionsStorage } from "../options/default";
import {
  supportedSites,
  enabledUrls,
  DIRECT_INJECTION,
  CONFLICT_RESOLUTION_IMMUTABLE_PROXY,
} from "../supported-sites";

const PORTAL_URL = "https://esluzby.socpoist.sk/moj-portal/podanie/test";

type PortalWindow = { location: Location; ditec?: DitecX };

/**
 * The no-attachment signing path of SignerService.signXml in the public
 * portal bundle TGOACPpS.js, inspected for #272. Only synthetic form data
 * is used; no request is made to SP or to a real signing application.
 */
function signForm(ditec: DitecX, xml: string): Promise<string> {
  const bp = ditec.dSigXadesBpJs;
  return new Promise((resolve, reject) => {
    const callback = (onSuccess: (value?: never) => void) => ({
      onSuccess,
      onError: reject,
    });
    const namespace = "https://example.invalid/test-form";
    bp.deploy(
      { platforms: ["dLauncher2"] },
      callback(() => {
        bp.initialize(
          callback(() => {
            bp.addXmlObject(
              "oIDtest",
              "Test form",
              namespace,
              xml,
              namespace,
              "1.0",
              "<xs:schema/>",
              namespace + "/form.xsd",
              "<xsl:stylesheet/>",
              namespace + "/form.xslt",
              bp.XML_MEDIA_DESTINATION_TYPE_DESC_HTML,
              "sk",
              "",
              true,
              bp.XML_XDC_NAMESPACE_URI_V1_1,
              callback(() => {
                bp.sign(
                  "sIDtest",
                  bp.SHA256,
                  "urn:oid:1.3.158.36061701.1.2.2",
                  callback(() => {
                    bp.getSignatureWithASiCEnvelopeBase64({
                      onSuccess: resolve,
                      onError: reject,
                    });
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

describe("new Sociálna poisťovňa portal (#272)", () => {
  beforeEach(() => {
    Object.assign(globalThis, {
      __MANIFEST_VERSION__: 3,
      __COMMIT_HASH__: "test",
    });
  });

  test("registers all eServices paths for early injection, including manifest matches", () => {
    for (const url of [
      PORTAL_URL,
      "https://esluzby.socpoist.sk/",
      "https://esluzby.socpoist.sk/iup2/",
      "https://esluzby.socpoist.sk/portal/",
    ]) {
      expect(supportedSites.matchUrl(url)).toMatchObject({
        injectionStrategy: DIRECT_INJECTION,
        conflictResolution: CONFLICT_RESOLUTION_IMMUTABLE_PROXY,
      });
    }
    expect(enabledUrls).toContain("https://esluzby.socpoist.sk/*");
    for (const url of [
      "https://esluzby.socpoist.sk.example.invalid/moj-portal/",
      "https://other.socpoist.sk/moj-portal/",
      "http://esluzby.socpoist.sk/moj-portal/",
    ]) {
      expect(() => supportedSites.matchUrl(url)).toThrow("is not supported");
    }
  });

  async function setup() {
    const fake = new FakeImplementation();
    // Substitute only the signing backend, keeping the real injection,
    // conflict resolver, D.Bridge adapters and signature parameter mapping.
    jest
      .mocked(DBridgeAutogramImpl.init)
      .mockResolvedValue(fake as unknown as DBridgeAutogramImpl);
    const portal: PortalWindow = {
      location: new URL(PORTAL_URL) as unknown as Location,
    };
    inject(portal, defaultOptionsStorage.options);
    // constructDitecX and the proxy module are both asynchronous.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(portal.ditec?.isAutogram).toBe(true);
    return { fake, portal, ditec: portal.ditec! };
  }

  test("installs without an original ditec and survives late component scripts", async () => {
    const { fake, portal, ditec } = await setup();
    const originalDeploy = jest.fn(() => {
      throw new Error("DB206: D.Launcher 2 web extension not found");
    });
    // Like the portal's strict-mode classic scripts: initialize the
    // namespace, then assign config and components.
    new Function(
      "window",
      "deploy",
      `
      "use strict";
      window.ditec = window.ditec || {};
      window.ditec.config = { downloadPage: { url: "dlauncher", title: "D.Launcher" } };
      window.ditec.dSigXadesBpJs = { deploy: deploy };
      window.ditec.dSigXadesBpJs.deploy = deploy;
    `
    )(portal, originalDeploy);

    expect(portal.ditec).toBe(ditec);
    const result = await signForm(portal.ditec!, "<form>test</form>");
    expect(originalDeploy).not.toHaveBeenCalled();
    expect(result).toBe(fake.signatureContent);
    expect(fake.lastParameters).toMatchObject({
      identifier: "https://example.invalid/test-form/1.0",
      container: "ASiC_E",
      packaging: "ENVELOPING",
      level: "XAdES_BASELINE_B",
      transformationMediaDestinationTypeDescription: "HTML",
      transformationLanguage: "sk",
    });
  });

  test("can sign another form without reloading the SPA", async () => {
    const { fake, ditec } = await setup();
    await expect(signForm(ditec, "<form>first</form>")).resolves.toBe(
      fake.signatureContent
    );
    await expect(signForm(ditec, "<form>second</form>")).resolves.toBe(
      fake.signatureContent
    );
    expect(fake.lastDocument).toMatchObject({
      content: "<form>second</form>",
      mimeType: "application/xml",
      encoding: "utf-8",
    });
  });

  test("returns user cancellation to the portal's error callback", async () => {
    const { fake, ditec } = await setup();
    fake.nextSignError = {
      name: "AutogramError",
      code: "user-cancelled",
      message: "User cancelled signing",
    };
    await expect(signForm(ditec, "<form/>")).rejects.toMatchObject({
      name: "DitecError",
      code: 1,
    });
  });
});
