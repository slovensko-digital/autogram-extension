import { execSync } from "child_process";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import { extensionManifestPlugin } from "./extension-manifest.plugin";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const manifestVersion = parseInt(process.env.AE_MANIFEST_VERSION || "2", 10);

let commitHash: string;
try {
  commitHash = execSync("git describe --always --dirty").toString().trim();
} catch (e) {
  commitHash = "unknown";
  console.error("Failed to get commit hash", e);
}

const packageJson = require("./package.json");
const entryInputs = {
  background: path.resolve(__dirname, "src/entrypoint/background.ts"),
  content: path.resolve(__dirname, "src/entrypoint/content-loader.ts"),
  contentModule: path.resolve(__dirname, "src/entrypoint/content.ts"),
  inject: path.resolve(__dirname, "src/entrypoint/inject.ts"),
  injectLoader: path.resolve(__dirname, "src/entrypoint/inject-loader.ts"),
  injectIntervalDetectDitec: path.resolve(
    __dirname,
    "src/entrypoint/inject-interval-detect-ditec.ts"
  ),
  popup: path.resolve(__dirname, "src/entrypoint/popup.ts"),
  options: path.resolve(__dirname, "src/entrypoint/options-loader.ts"),
  optionsModule: path.resolve(__dirname, "src/entrypoint/options.ts"),
  redirect: path.resolve(__dirname, "src/entrypoint/redirect.ts"),
};

export default defineConfig({
  define: {
    "import.meta.env.AE_MANIFEST_VERSION": JSON.stringify(manifestVersion),
    __MANIFEST_VERSION__: JSON.stringify(String(manifestVersion)),
    __PACKAGE_VERSION__: JSON.stringify(packageJson.version),
    __COMMIT_HASH__: JSON.stringify(commitHash),
    __IS_PRODUCTION__: JSON.stringify(process.env.NODE_ENV === "production"),
    __INCLUDE_DEBUG_URLS__: JSON.stringify(
      process.env.AE_INCLUDE_DEBUG_URLS === "1"
    ),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: process.env.NODE_ENV === "production" ? "terser" : false,
    sourcemap: true,
    rollupOptions: {
      input: entryInputs,
      output: {
        entryFileNames: "autogram-[name].bundle.js",
        chunkFileNames: "chunks/[name].[hash].js",
        assetFileNames: "assets/[name].[hash][extname]",
      },
      external: ["crypto", "stream", "vm", "buffer", "events"],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      "autogram-sdk": path.resolve(__dirname, "../autogram-sdk/src"),
    },
  },
  plugins: [extensionManifestPlugin()],
});
