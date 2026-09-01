import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { test as base, chromium, type BrowserContext } from "@playwright/test";

const DIST_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../dist"
);

/**
 * Playwright test with the built extension (dist/) loaded into a Chromium
 * persistent context — the only way Chromium loads extensions. Build it
 * first: `npm run vite:build-dev` (MV3 is the default).
 */
export const test = base.extend<{ context: BrowserContext }>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    if (!fs.existsSync(path.join(DIST_PATH, "manifest.json"))) {
      throw new Error(
        `extension build not found at ${DIST_PATH} — run \`npm run vite:build-dev\` first`
      );
    }
    const context = await chromium.launchPersistentContext("", {
      // Extensions require the real Chromium; the default headless shell
      // does not support them.
      channel: "chromium",
      args: [
        `--disable-extensions-except=${DIST_PATH}`,
        `--load-extension=${DIST_PATH}`,
      ],
    });
    await use(context);
    await context.close();
  },
  page: async ({ context }, use) => {
    // reuse the tab the persistent context opens on launch
    await use(context.pages()[0] ?? (await context.newPage()));
  },
});

export const expect = test.expect;
