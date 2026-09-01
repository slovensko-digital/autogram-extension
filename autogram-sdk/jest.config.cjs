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
          types: ["jest", "node"],
        },
      },
    ],
  },
  // apiClient.test.ts is a parked integration test: it registers against the
  // real AVM server and needs dev dependencies (fake-indexeddb, core-js)
  // that are not installed. Only unit tests run here.
  testPathIgnorePatterns: ["<rootDir>/avm-api/lib/apiClient.test.ts"],
};

module.exports = config;
