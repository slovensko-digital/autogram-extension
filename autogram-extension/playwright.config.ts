import { defineConfig } from "@playwright/test";

/**
 * E2E tests that load the built extension (dist/) into Chromium and drive
 * the live portals — see tests/e2e/README.md.
 *
 * Prerequisites: `npm run vite:build-dev` (dist/), `npx playwright install
 * chromium`, network access to the portals, and no real Autogram desktop
 * app running (the tests bind its port). Run with `npm run test:e2e`.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  // A single worker: the fake Autogram desktop server binds the fixed port
  // 37200 (hardcoded in the SDK).
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    trace: "retain-on-failure",
  },
});
