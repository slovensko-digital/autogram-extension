/**
 * Live-portal e2e for https://obcan.justice.sk/podpisovanie-dokumentov,
 * reproducing the report in issue #101
 * (https://github.com/slovensko-digital/autogram-extension/issues/101#issuecomment-4978486015):
 * the first signature goes through the extension, but the second attempt
 * falls back to D.Launcher — an injection-level failure the jest portal
 * contract tests (portal-justice.test.ts) cannot see.
 *
 * The test drives the real, login-free portal page with the real built
 * extension loaded, so the whole production injection path runs: content
 * script → inject bundle → immutable proxy over `window.ditec`, racing the
 * portal's own D.Bridge scripts. Only two things are not real:
 *  - the Autogram desktop app is a local fake on port 37200
 *    (fake-autogram-desktop.ts), so signing completes without eID;
 *  - the final POST of the signed document (`action=signFile`) is
 *    intercepted, so the fake signature never reaches the portal.
 */
import type { Page } from "@playwright/test";
import { test, expect } from "./extension.fixtures";
import {
  startFakeAutogramDesktop,
  type FakeAutogramDesktop,
} from "./fake-autogram-desktop";

const PORTAL_URL = "https://obcan.justice.sk/podpisovanie-dokumentov";
const SIGN_FILE_ACTION = "_eZalobySignForm_WAR_ressezaloby_action=signFile";

/** Minimal valid single-page PDF; the portal only type-checks the upload. */
const SAMPLE_PDF = [
  "%PDF-1.4",
  "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj",
  "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj",
  "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj",
  "xref",
  "0 4",
  "0000000000 65535 f ",
  "0000000009 00000 n ",
  "0000000052 00000 n ",
  "0000000101 00000 n ",
  "trailer<</Size 4/Root 1 0 R>>",
  "startxref",
  "164",
  "%%EOF",
  "",
].join("\n");

let desktop: FakeAutogramDesktop;

test.beforeAll(async () => {
  desktop = await startFakeAutogramDesktop();
});

test.afterAll(async () => {
  await desktop?.close();
});

test("signs twice in a row via the extension (issue #101: second attempt must not fall back to D.Launcher)", async ({
  context,
  page,
}) => {
  // Capture the portal-bound POST of the signed document instead of
  // letting the fake signature reach the government server.
  const postedSignatures: string[] = [];
  await context.route(
    (url) => url.href.includes(SIGN_FILE_ACTION),
    async (route) => {
      const body = route.request().postData() ?? "";
      // multipart field extraction: the signed container is base64, one line
      const signedPdf = /name="signedPdf"\r?\n\r?\n([\s\S]*?)\r?\n--/.exec(
        body
      )?.[1];
      postedSignatures.push(signedPdf ?? "");
      await route.fulfill({
        contentType: "text/html",
        body: "<h1 id='e2e-captured'>E2E: signed document captured</h1>",
      });
    }
  );

  await signOnce(page, postedSignatures, 1);
  // the reported failure mode: the second attempt opened D.Launcher
  await signOnce(page, postedSignatures, 2);
});

async function signOnce(
  page: Page,
  postedSignatures: string[],
  attempt: number
) {
  await test.step(`signature attempt ${attempt}`, async () => {
    await page.goto(PORTAL_URL);
    // selecting a file auto-submits the upload form → sign page
    await page.locator("#signFile").setInputFiles({
      name: "sample.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from(SAMPLE_PDF),
    });
    await page.waitForURL(/_eZalobySignForm_WAR_ressezaloby_action=sign(&|$)/);

    // The extension must own window.ditec before the page's driver deploys.
    // When this fails, the injection race was lost (issue #101 root cause:
    // constructDitecX rejects while document.body is still null, the
    // immutable proxy is never installed) and the portal's real D.Bridge
    // drives the page into D.Launcher.
    await expect
      .poll(
        () =>
          page.evaluate(
            () =>
              (window as { ditec?: { isAutogram?: boolean } }).ditec
                ?.isAutogram === true
          ),
        {
          message:
            "window.ditec was not replaced by the extension — injection " +
            "race lost, the portal's own D.Bridge (→ D.Launcher) is driving " +
            "the page (issue #101)",
          timeout: 20_000,
        }
      )
      .toBe(true);

    // deploy + initialize completed through the extension: the driver
    // reveals the sign button only from deploy's onSuccess
    await expect(page.locator("#btnSignPdf")).toBeVisible({
      timeout: 20_000,
    });
    await expect(page.locator("#errorMessage")).toBeHidden();

    await page.locator("#btnSignPdf").click();
    // the extension's signing dialog → sign with the (fake) desktop app
    await page.getByRole("button", { name: /v tomto počítači/ }).click();

    // the driver posts the signed container to the portal; our route
    // captured it instead
    await page.waitForURL((url) => url.href.includes(SIGN_FILE_ACTION));
    expect(postedSignatures).toHaveLength(attempt);
    expect(postedSignatures[attempt - 1]).toBe(desktop.signedContent);
  });
}
