import { defineConfig } from "tsdown";

const entries = [
  "src/index-all.ts",
  "src/index.ts",
  "src/demo.ts",
  "src/with-ui.ts",
  "src/autogram-api/index.ts",
  "src/avm-api/index.ts",
];

function iifeEntryName(entry: string): string {
  // "src/index.ts" -> "index", "src/avm-api/index.ts" -> "avm-api"
  const parts = entry.replace(/^src\//, "").replace(/\.ts$/, "").split("/");
  return parts.at(-1) === "index" && parts.length > 1
    ? parts.slice(0, -1).join("-")
    : parts.join("-");
}

const commonOptions = {
  platform: "browser" as const,
  minify: true,
  sourcemap: true,
  outDir: "dist",
  deps: {
    skipNodeModulesBundle: true,

    // This is stupid and we shouldn't bundle dependencies that have their own types, but it makes the package much easier to consume without extra configuration, and the size increase is acceptable.
    // But since it's monorepo it detects them in node_modules and starts panicking
    // alwaysBundle: [
    //   "@bwip-js/generic",
    //   "cross-fetch",
    //   "jose",
    //   "lit",
    //   "lit-html",
    //   "lit/decorators.js",
    //   "lit/html.js",
    //   "lit/directives/unsafe-svg.js",
    //   "@peculiar/webcrypto",
    //   "js-base64",
    //   "loglevel",
    //   "zod",
    //   "idb-keyval",
    // ],
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
    // Name entries explicitly: the nested index.ts entries would otherwise all
    // emit a colliding "index.iife.js". Keep "index-all" etc. as flat names.
    entry: { [iifeEntryName(entry)]: entry },
    globalName: "AutogramSDK",
    // Each config in this array runs separately; only the first may clean dist,
    // otherwise the iife builds delete the cjs/esm/dts output.
    clean: false,
  })),
]);
