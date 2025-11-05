import { defineConfig } from "tsup";

export default defineConfig({
  platform: "browser",
  minify: true,
  dts: true,
  sourcemap: true,
  format: ["cjs", "esm", "iife"],
  outDir: "dist",
  entry: [
    "src/index-all.ts",
    "src/index.ts",
    "src/demo.ts",
    "src/with-ui.ts",
    "src/autogram-api/index.ts",
    "src/avm-api/index.ts",
  ],
  noExternal: ["@bwip-js/generic"],
  esbuildOptions(options, context) {
    options.loader = {
      ...options.loader,
      ".css": "text",
    };
    options.globalName = "AutogramSDK";
    return options;
  },
});
