import { defineConfig } from "tsdown";

const entries = [
  "src/index-all.ts",
  "src/index.ts",
  "src/demo.ts",
  "src/with-ui.ts",
  "src/autogram-api/index.ts",
  "src/avm-api/index.ts",
];

const commonOptions = {
  platform: "browser" as const,
  minify: true,
  sourcemap: true,
  outDir: "dist",
  deps: {
    alwaysBundle: ["@bwip-js/generic"],
  },
  loader: {
    ".css": "text" as const,
  },
};

export default defineConfig([
  {
    ...commonOptions,
    format: ["cjs", "esm"],
    entry: entries,
    dts: {
      compilerOptions: {
        composite: false,
      },
    },
  },
  ...entries.map((entry) => ({
    ...commonOptions,
    format: "iife" as const,
    entry: [entry],
    globalName: "AutogramSDK",
  })),
]);
