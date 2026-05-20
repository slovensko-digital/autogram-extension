import fs from "fs/promises";
import path from "path";
import { execSync } from "child_process";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { build, type InlineConfig } from "vite";
import { generateManifest } from "../webpack/manifest";

type FileDescriptor = {
  chunk?: undefined;
  isAsset: boolean;
  isChunk: boolean;
  isInitial: boolean;
  isModuleAsset: boolean;
  name: string;
  path: string;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.resolve(projectRoot, "dist");
const staticDir = path.resolve(projectRoot, "src/static");
const localesDir = path.resolve(projectRoot, "src/_locales");
const require = createRequire(import.meta.url);
const packageJson = require("../package.json");

const manifestVersion = parseInt(process.env.AE_MANIFEST_VERSION || "2", 10);
const isProduction = process.env.NODE_ENV === "production";
const includeDebugUrls = process.env.AE_INCLUDE_DEBUG_URLS === "1";
const shouldWatch = process.argv.includes("--watch");

let commitHash: string;
try {
  commitHash = execSync("git describe --always --dirty").toString().trim();
} catch {
  commitHash = "unknown";
}

const entryInputs: Record<string, string> = {
  background: path.resolve(projectRoot, "src/entrypoint/background.ts"),
  content: path.resolve(projectRoot, "src/entrypoint/content.ts"),
  inject: path.resolve(projectRoot, "src/entrypoint/inject.ts"),
  injectIntervalDetectDitec: path.resolve(
    projectRoot,
    "src/entrypoint/inject-interval-detect-ditec.ts"
  ),
  popup: path.resolve(projectRoot, "src/entrypoint/popup.ts"),
  options: path.resolve(projectRoot, "src/entrypoint/options.ts"),
  redirect: path.resolve(projectRoot, "src/entrypoint/redirect.ts"),
};

const defineValues = {
  "import.meta.env.AE_MANIFEST_VERSION": JSON.stringify(manifestVersion),
  __MANIFEST_VERSION__: JSON.stringify(String(manifestVersion)),
  __PACKAGE_VERSION__: JSON.stringify(packageJson.version),
  __COMMIT_HASH__: JSON.stringify(commitHash),
  __IS_PRODUCTION__: JSON.stringify(isProduction),
  __INCLUDE_DEBUG_URLS__: JSON.stringify(includeDebugUrls),
  __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
};

function toPosixPath(filePath: string) {
  return filePath.split(path.sep).join("/");
}

async function copyDirectory(sourceDir: string, targetDir: string) {
  await fs.mkdir(targetDir, { recursive: true });
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
      continue;
    }

    await fs.copyFile(sourcePath, targetPath);
  }
}

function createManifestEntries() {
  return Object.fromEntries(
    Object.keys(entryInputs).map((entryName) => [
      entryName,
      [`autogram-${entryName}.bundle.js`],
    ])
  ) as Record<string, string[]>;
}

function createManifestFiles(entries: Record<string, string[]>) {
  const files: FileDescriptor[] = [];

  for (const [name, paths] of Object.entries(entries)) {
    for (const filePath of paths) {
      files.push({
        name,
        path: filePath,
        isAsset: false,
        isChunk: true,
        isInitial: true,
        isModuleAsset: false,
        chunk: undefined,
      });

      files.push({
        name: `${name}.map`,
        path: `${filePath}.map`,
        isAsset: true,
        isChunk: false,
        isInitial: false,
        isModuleAsset: false,
        chunk: undefined,
      });
    }
  }

  return files;
}

async function buildEntry(entryName: string, entryPath: string) {
  const config: InlineConfig = {
    configFile: false,
    define: defineValues,
    resolve: {
      alias: {
        "autogram-sdk": path.resolve(projectRoot, "../autogram-sdk/src"),
      },
    },
    build: {
      outDir: distDir,
      emptyOutDir: false,
      sourcemap: true,
      minify: isProduction ? "terser" : false,
      lib: {
        entry: entryPath,
        name: `autogram_${entryName}`,
        formats: ["iife"],
        fileName: () => `autogram-${entryName}.bundle.js`,
      },
      rollupOptions: {
        external: ["crypto", "stream", "vm", "buffer", "events"],
        output: {
          inlineDynamicImports: true,
          extend: true,
        },
      },
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      watch: shouldWatch ? {} : undefined,
    },
  };

  await build(config);
}

async function setupDist() {
  if (!shouldWatch) {
    await fs.rm(distDir, { recursive: true, force: true });
  }

  await fs.mkdir(distDir, { recursive: true });
  await copyDirectory(staticDir, path.join(distDir, "static"));
  await copyDirectory(localesDir, path.join(distDir, "_locales"));
  await fs.copyFile(path.join(projectRoot, "LICENSE"), path.join(distDir, "static/LICENSE"));
}

async function writeManifest() {
  const manifestEntries = createManifestEntries();
  const manifestFiles = createManifestFiles(manifestEntries);
  const manifest = generateManifest({}, manifestFiles, manifestEntries);

  await fs.writeFile(
    path.join(distDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );
}

async function main() {
  await setupDist();

  for (const [entryName, entryPath] of Object.entries(entryInputs)) {
    await buildEntry(entryName, entryPath);
  }

  await writeManifest();

  const mode = isProduction ? "production" : "development";
  const watchNote = shouldWatch ? " (watch mode)" : "";
  console.log(`Built extension bundles in ${mode}${watchNote}.`);
  console.log(`Output: ${toPosixPath(path.relative(projectRoot, distDir))}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
