import { Options as WMPOptions, FileDescriptor } from "webpack-manifest-plugin";
import { enabledUrls } from "../src/constants";
import { ManifestV2, ManifestV3 } from "./manifest-types";
import { manifestVersion } from "./manifest-version";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require("../package.json");

function generateManifest(
  seed: Record<string, unknown>,
  files: FileDescriptor[],
  entries: Record<string, string[]>
): ManifestV3 | ManifestV2 | Record<string, unknown> {
  const common = {
    name: packageJson.name,
    version: packageJson.version,
    description: packageJson.description,
    author: "pom",
    icons: {
      "16": "static/logo-16.png",
      "32": "static/logo-32.png",
      "64": "static/logo-64.png",
      "128": "static/logo-128.png",
      "512": "static/logo-512.png",
    },
  };

  switch (manifestVersion) {
    case 3:
      return <ManifestV3>{
        manifest_version: 3,

        /* Common properties */
        ...common,

        permissions: [
          "storage",
          "webRequest",
          "webNavigation",
          "scripting", //3
          "tabs", // 3
          "activeTab", //3
        ],

        content_scripts: [
          {
            matches: enabledUrls,
            js: entries.content,
          },
        ],
        // background: {
        //   service_worker: entries.background,
        // },
        action: {
          default_icon: {
            "16": "static/logo-16.png",
            "32": "static/logo-32.png",
            "64": "static/logo-64.png",
            "128": "static/logo-128.png",
            "512": "static/logo-512.png",
          },
          default_popup: "static/popup.html",
        },
        web_accessible_resources: [
          {
            resources: [
              ...entries.inject.map((x) => [x, x + ".map"]).flat(),
              ...entries.content.map((x) => [x, x + ".map"]).flat(),
              "static/logo.png",
            ],
            matches: enabledUrls,
          },
        ],
      };

    case 2:
    default:
      return <ManifestV2>{
        manifest_version: 2,

        /* Common properties */
        ...common,

        /* 
        Browser toolbar/urlbar icon and button showing popup
        */
        page_action: {
          default_icon: {
            "16": "static/logo-16.png",
            "32": "static/logo-32.png",
            "64": "static/logo-64.png",
            "128": "static/logo-128.png",
            "512": "static/logo-512.png",
          },
          /* Show page_action icon on matching urls - probably working only in firefox */
          show_matches: enabledUrls,
          default_title: packageJson.name,
          /* Insert browser css to popup html */
          browser_style: true,
          default_popup: "static/popup.html",
        },

        background: {
          scripts: entries.background,
        },

        permissions: [
          "storage",
          "declarativeContent", // chrome only
          ...enabledUrls,
        ],
        content_scripts: [
          {
            matches: enabledUrls,
            js: entries.content,
          },
        ],
        web_accessible_resources: [
          // ...entries.inject.map((x) => [x, x + ".map"]).flat(),
          // ...entries.content.map((x) => [x, x + ".map"]).flat(),
          // ...entries.background.map((x) => [x, x + ".map"]).flat(),
          ...Object.keys(entries)
            .map((key) => entries[key].map((x) => [x, x + ".map"]).flat())
            .flat(),
          "static/logo.png",
          ...enabledUrls,
        ],
        externally_connectable: {
          // chrome only
          matches: enabledUrls,
        },
        // options_page: "static/options.html",

        options_ui: {
          page: "static/options.html",
          open_in_tab: true,
          browser_style: true,
        },
        // browser_specific_settings: {
        //   gecko: {
        //     id: "extension@aaa.sk",
        //   },
        // },
      };
  }
}

export const manifestOptions: WMPOptions = {
  fileName: "manifest.json",
  generate: generateManifest,
};
