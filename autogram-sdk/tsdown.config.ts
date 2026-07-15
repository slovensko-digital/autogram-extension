import { defineConfig } from "tsdown";

const entries = [
  "src/index-all.ts",
  "src/index.ts",
  "src/demo.ts",
  "src/with-ui.ts",
  "src/autogram-api/index.ts",
  "src/avm-api/index.ts",
];

function flatEntryName(entry: string): string {
  // "src/index.ts" -> "index", "src/avm-api/index.ts" -> "avm-api"
  const parts = entry.replace(/^src\//, "").replace(/\.ts$/, "").split("/");
  return parts.at(-1) === "index" && parts.length > 1
    ? parts.slice(0, -1).join("-")
    : parts.join("-");
}

// Deps stay external (bare imports) — for consumers with their own bundler.
const externalizedDeps = {
  skipNodeModulesBundle: true,
};

// All deps inlined — for script tags and static hosting without a bundler.
// `alwaysBundle` cannot be combined with `skipNodeModulesBundle`, and
// `onlyBundle: false` silences the per-dependency bundling warnings.
const bundledDeps = {
  alwaysBundle: /./,
  onlyBundle: false as const,
};

const commonOptions = {
  platform: "browser" as const,
  minify: true,
  sourcemap: true,
  outDir: "dist",
  loader: {
    ".css": "text" as const,
  },
};

export default defineConfig([
  // ESM + CJS with externalized deps: the npm package entry points.
  {
    ...commonOptions,
    deps: externalizedDeps,
    format: ["cjs", "esm"],
    entry: entries,
    dts: {
      compilerOptions: {
        composite: false,
      },
    },
  },
  // ESM with bundled deps: self-contained modules loadable directly from a
  // static server via <script type="module">.
  {
    ...commonOptions,
    deps: bundledDeps,
    format: "esm" as const,
    outDir: "dist/bundled",
    entry: Object.fromEntries(entries.map((e) => [flatEntryName(e), e])),
    // Types are already emitted by the externalized build above.
    dts: false,
    // Each config in this array runs separately; only the first may clean
    // dist, otherwise later builds delete the earlier output.
    clean: false,
  },
  // IIFE with bundled deps: classic <script> tag, exposes AutogramSDK global.
  ...entries.map((entry) => ({
    ...commonOptions,
    deps: bundledDeps,
    format: "iife" as const,
    // Name entries explicitly: the nested index.ts entries would otherwise all
    // emit a colliding "index.iife.js". Keep "index-all" etc. as flat names.
    entry: { [flatEntryName(entry)]: entry },
    globalName: "AutogramSDK",
    dts: false,
    clean: false,
  })),
]);
