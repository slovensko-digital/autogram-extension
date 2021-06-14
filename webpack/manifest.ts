import {
  WebpackManifestPlugin,
  Options as WMPOptions,
  FileDescriptor,
} from "webpack-manifest-plugin";

const packageJson = require("../package.json");

function generateManifest(
  seed: object,
  files: FileDescriptor[],
  entries: Record<string, string[]>
): object {
  // console.log(seed);
  // console.log(files);
  // console.log(entries);
  return {
    manifest_version: 2,
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    author: "pom",

    permissions: [
      "storage",
      "webRequest",
      "webRequestBlocking",
      "webNavigation",
    ],

    // icons: {
    //   "128": "logo.png",
    // },
    // options_page: "src/ui/options.html",
    content_scripts: [
      {
        matches: [
          "https://www.slovensko.sk/*",
          "https://schranka.slovensko.sk/*",
        ],
        js: entries.content,
      },
    ],
    background: {
      scripts: entries.background,
      persistent: true,
    },
  };
}

export const manifestOptions: WMPOptions = {
  fileName: "manifest.json",
  generate: generateManifest,
};
