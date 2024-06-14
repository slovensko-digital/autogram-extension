/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  // testEnvironment: 'node',
  testEnvironment: "jsdom",
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
