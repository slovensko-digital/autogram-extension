import fs from "fs/promises";
import path from "path";
import type { OutputBundle, OutputChunk, Plugin, PluginContext } from "rollup";
import { fileURLToPath } from "url";
import { generateManifest } from "./webpack/manifest";

interface FileDescriptor {
  chunk?: undefined;
  isAsset: boolean;
  isChunk: boolean;
  isInitial: boolean;
  isModuleAsset: boolean;
  name: string;
  path: string;
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function toPosixPath(filePath: string) {
  return filePath.split(path.sep).join("/");
}

async function emitDirectory(
  pluginContext: PluginContext,
  sourceDir: string,
  targetDir: string,
  baseDir = sourceDir
) {
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    if (entry.isDirectory()) {
      await emitDirectory(pluginContext, sourcePath, targetDir, baseDir);
      continue;
    }

    const relativePath = path.relative(baseDir, sourcePath);
    pluginContext.emitFile({
      type: "asset",
      fileName: toPosixPath(path.join(targetDir, relativePath)),
      source: await fs.readFile(sourcePath),
    });
  }
}

function collectImportedChunks(
  chunk: OutputChunk,
  bundle: OutputBundle,
  seen = new Set<string>()
): string[] {
  const files: string[] = [];

  for (const importedFileName of [...chunk.imports, ...chunk.dynamicImports]) {
    if (seen.has(importedFileName)) {
      continue;
    }

    seen.add(importedFileName);
    const importedChunk = bundle[importedFileName];
    if (!importedChunk || importedChunk.type !== "chunk") {
      continue;
    }

    files.push(importedChunk.fileName);
    files.push(...collectImportedChunks(importedChunk, bundle, seen));
  }

  return files;
}

function createManifestEntries(bundle: OutputBundle) {
  const entries: Record<string, string[]> = {};

  for (const output of Object.values(bundle)) {
    if (output.type !== "chunk" || !output.isEntry) {
      continue;
    }

    entries[output.name] = [
      output.fileName,
      ...collectImportedChunks(output, bundle),
    ];
  }

  return entries;
}

function createManifestFiles(bundle: OutputBundle): FileDescriptor[] {
  const fileDescriptors: FileDescriptor[] = [];

  for (const output of Object.values(bundle)) {
    if (output.type === "chunk") {
      fileDescriptors.push({
        name: output.name,
        path: output.fileName,
        isAsset: false,
        isChunk: true,
        isInitial: output.isEntry,
        isModuleAsset: false,
        chunk: undefined,
      });

      if (bundle[`${output.fileName}.map`]) {
        fileDescriptors.push({
          name: `${output.name}.map`,
          path: `${output.fileName}.map`,
          isAsset: true,
          isChunk: false,
          isInitial: false,
          isModuleAsset: false,
          chunk: undefined,
        });
      }

      for (const importedChunkFileName of collectImportedChunks(output, bundle)) {
        fileDescriptors.push({
          name: importedChunkFileName,
          path: importedChunkFileName,
          isAsset: false,
          isChunk: true,
          isInitial: false,
          isModuleAsset: false,
          chunk: undefined,
        });

        if (bundle[`${importedChunkFileName}.map`]) {
          fileDescriptors.push({
            name: `${importedChunkFileName}.map`,
            path: `${importedChunkFileName}.map`,
            isAsset: true,
            isChunk: false,
            isInitial: false,
            isModuleAsset: false,
            chunk: undefined,
          });
        }
      }
    }

    if (output.type === "asset" && output.fileName.endsWith(".map")) {
      fileDescriptors.push({
        name: output.fileName,
        path: output.fileName,
        isAsset: true,
        isChunk: false,
        isInitial: false,
        isModuleAsset: false,
        chunk: undefined,
      });
    }
  }

  return Array.from(
    new Map(fileDescriptors.map((file) => [file.path, file])).values()
  );
}

export function extensionManifestPlugin(): Plugin {
  return {
    name: "extension-manifest",
    async generateBundle(_, bundle) {
      await emitDirectory(this, path.resolve(__dirname, "src/static"), "static");
      await emitDirectory(this, path.resolve(__dirname, "src/_locales"), "_locales");

      this.emitFile({
        type: "asset",
        fileName: "static/LICENSE",
        source: await fs.readFile(path.resolve(__dirname, "LICENSE")),
      });

      const manifest = generateManifest(
        {},
        createManifestFiles(bundle),
        createManifestEntries(bundle)
      );

      this.emitFile({
        type: "asset",
        fileName: "manifest.json",
        source: `${JSON.stringify(manifest, null, 2)}\n`,
      });
    },
  };
}
