import { Options as WMPOptions, FileDescriptor } from "webpack-manifest-plugin";

const manifestVersion: 2 | 3 =
  process.env.SKSE_MANIFEST_VERSION === "3" ? 3 : 2;

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

  const common = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    author: "pom",
  };

  switch (manifestVersion) {
    case 3:
      return {
        manifest_version: 3, //2

        ...common,

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
              "https://pfseform.financnasprava.sk/*",
              "https://pfseform.financnasprava.sk",
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
              ...entries.content.map((x) => [x, x + ".map"]).flat(),
              "static/logo.png",
            ],
            matches: [
              "https://www.slovensko.sk/*",
              "https://schranka.slovensko.sk/*",
              "https://pfseform.financnasprava.sk/*",
              "https://pfseform.financnasprava.sk",
            ],
          },
        ],
      };

    case 2:
    default:
      return {
        manifest_version: 2,

        ...common,

        permissions: [
          "storage",
          "webRequest",
          "webNavigation",
          // "tabs", // 3
          // "activeTab", //3
        ],
        content_scripts: [
          {
            matches: [
              "https://www.slovensko.sk/*",
              "https://schranka.slovensko.sk/*",
              "https://pfseform.financnasprava.sk/*",
              "https://pfseform.financnasprava.sk",
            ],
            js: entries.content,
          },
        ],
        web_accessible_resources: [
          ...entries.inject.map((x) => [x, x + ".map"]).flat(),
          ...entries.content.map((x) => [x, x + ".map"]).flat(),
          "static/logo.png",
          "https://www.slovensko.sk/*",
          "https://schranka.slovensko.sk/*",
          "https://pfseform.financnasprava.sk/*",
          "https://pfseform.financnasprava.sk",
        ],
      };
  }
}

export const manifestOptions: WMPOptions = {
  fileName: "manifest.json",
  generate: generateManifest,
};
