/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  // testEnvironment: 'node',
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/../jest.setup.cjs"],
  // setupFiles: ["fake-indexeddb/auto"],

  rootDir: "./src",
  verbose: true,
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.[tj]s$": [
      "ts-jest",
      {
        tsconfig: {
          allowJs: true,
          // The real build (vite/esbuild) targets modern JS; the tsconfig's
          // ES5 target would downlevel `class extends Error` in a way that
          // breaks `instanceof` and misrepresents production behavior.
          target: "ES2022",
        },
      },
    ],
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!jose)"],
  // moduleNameMapper: {
  //   "\\.(css|less)$": "identity-obj-proxy",
  // },
};

module.exports = config;
