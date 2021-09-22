import {
  WebpackManifestPlugin,
  Options as WMPOptions,
  FileDescriptor,
} from "webpack-manifest-plugin";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require("../package.json");

function generateManifest(
  seed: Record<string, unknown>,
  files: FileDescriptor[],
  entries: Record<string, string[]>
): Record<string, unknown> {
  // console.log(seed);
  // console.log(files);
  // console.log(entries);
  return {
    manifest_version: 3, //2
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    author: "pom",

    permissions: [
      "storage",
      "webRequest",
      // "webRequestBlocking", //2
      "webNavigation",
      "scripting", //3
      "tabs", // 3
      "activeTab", //3
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
    // background: {
    //   scripts: entries.background,
    //   persistent: true,
    // },
    // background: {
    //   service_worker: entries.background,
    // },
    // action: {
    //   default_icon: "static/logo.png",
    //   default_popup: "popup.html",
    // },
    web_accessible_resources: [
      {
        resources: [
          ...entries.inject.map((x) => [x, x + ".map"]).flat(),
          "static/logo.png",
        ],
        matches: [
          "https://www.slovensko.sk/*",
          "https://schranka.slovensko.sk/*",
        ],
      },
    ],
  };
}

export const manifestOptions: WMPOptions = {
  fileName: "manifest.json",
  generate: generateManifest,
};
