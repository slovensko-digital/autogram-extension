import { test, expect } from "./extension.fixtures";

/**
 * The toolbar popup: wired into the manifest and its button opens the
 * options page. Runs offline (no portals).
 */
test("toolbar popup opens the options page", async ({ context }) => {
  const worker =
    context.serviceWorkers()[0] ??
    (await context.waitForEvent("serviceworker"));
  const extensionId = new URL(worker.url()).host;

  const manifest = await worker.evaluate(() => chrome.runtime.getManifest());
  const popupPath =
    manifest.manifest_version === 3
      ? manifest.action?.default_popup
      : // MV2 shows it from the page action
        (manifest as { page_action?: { default_popup?: string } }).page_action
          ?.default_popup;
  expect(popupPath).toBe("static/popup.html");

  const popup = await context.newPage();
  const errors: string[] = [];
  popup.on("pageerror", (error) => errors.push(error.message));
  popup.on("requestfailed", (request) => errors.push(request.url()));
  await popup.goto(`chrome-extension://${extensionId}/${popupPath}`);

  await expect(
    popup.getByRole("heading", { name: "na štátnych weboch" })
  ).toBeVisible();

  const optionsPage = context.waitForEvent("page");
  await popup.getByRole("button", { name: "Nastavenia" }).click();
  await expect(await optionsPage).toHaveURL(
    `chrome-extension://${extensionId}/static/options.html`
  );
  expect(errors).toEqual([]);
});
