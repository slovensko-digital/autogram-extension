/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "./src",
  transform: {
    "^.+\\.[tj]s$": [
      "ts-jest",
      {
        tsconfig: {
          // Match the real build target (tsdown/esbuild, modern JS);
          // downleveling `class extends Error` would break `instanceof`.
          target: "ES2022",
          composite: false,
          allowJs: true,
          types: ["jest", "node"],
        },
      },
    ],
  },
  // apiClient.test.ts is a parked integration test: it registers against the
  // real AVM server and needs dev dependencies (fake-indexeddb, core-js)
  // that are not installed. Only unit tests run here.
  // The jsdom tests (with-ui) load ESM-only browser packages; let ts-jest
  // transform them instead of skipping node_modules.
  transformIgnorePatterns: [
    "/node_modules/(?!(jose|lit|lit-html|lit-element|@lit|@lit-labs|@bwip-js)/)",
  ],
  testPathIgnorePatterns: ["<rootDir>/avm-api/lib/apiClient.test.ts"],
};

module.exports = config;
