import { ManifestPluginOptions as WMPOptions } from "webpack-manifest-plugin";
import { enabledUrls } from "../src/supported-sites";
import { CommonManifest, ManifestV2, ManifestV3 } from "./manifest-types";
import { manifestVersion } from "./manifest-version";
import { FileDescriptor } from "webpack-manifest-plugin/dist/helpers";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require("../package.json");

function generateManifest(
  seed: Record<string, unknown>,
  files: FileDescriptor[],
  entries: Record<string, string[]>
): ManifestV3 | ManifestV2 | Record<string, unknown> {
  const common: CommonManifest = {
    name: "Autogram na štátnych weboch",
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
    default_locale: "sk",

    options_ui: {
      page: "static/options.html",
      open_in_tab: true,
      browser_style: true,
    },

    homepage_url: "https://sluzby.slovensko.digital/autogram/",
  };

  switch (manifestVersion) {
    // MARK: manifest v3
    case 3:
      return <ManifestV3>{
        manifest_version: 3,

        /* Common properties */
        ...common,

        // https://developer.chrome.com/docs/webstore/i18n/
        name: "__MSG_appName__",
        description: "__MSG_appDesc__",

        permissions: [
          "storage",
          "alarms",
          "local-network-access",
          // "declarativeContent",
          // "webRequest",
          // "webNavigation",
          // "scripting", //3
          // "tabs", // 3
          // "activeTab", //3
        ],

        content_scripts: [
          {
            matches: enabledUrls,
            js: entries.content,
            all_frames: true,
            run_at: "document_start",
          },

          {
            matches: ["*://*.slovensko.sk/*", "*://slovensko.sk/*"],
            css: ["static/upvs-fix-sksk.css"],
            all_frames: true,
            run_at: "document_start",
          },

          {
            matches: [
              "*://*.schranka.slovensko.sk/*",
              "*://schranka.slovensko.sk/*",
            ],
            css: ["static/upvs-fix-schranka-sksk.css"],
            all_frames: true,
            run_at: "document_start",
          },
        ],
        background: {
          service_worker: entries.background[0],
          type: "module",
        },
        action: {
          default_icon: {
            "16": "static/logo-16.png",
            "32": "static/logo-32.png",
            "64": "static/logo-64.png",
            "128": "static/logo-128.png",
            "512": "static/logo-512.png",
          },
          // default_popup: "static/popup.html",
        },
        options_page: "static/options.html",
        web_accessible_resources: [
          {
            resources: [
              // ...entries.inject.map((x) => [x, x + ".map"]).flat(),
              // ...entries.content.map((x) => [x, x + ".map"]).flat(),

              ...Object.keys(entries)
                .map((key) => entries[key].map((x) => [x, x + ".map"]).flat())
                .flat(),
              "static/logo-64.png",
            ],
            matches: enabledUrls,
          },
        ],

        // externally_connectable: {
        //   // chrome only
        //   matches: enabledUrls,
        // },
      };

    // MARK: manifest v2
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
          persistent: false,
        },

        permissions: [
          "storage",
          "alarms",
          "local-network-access",
          // "declarativeContent", // chrome only - does not work in firefox
          ...enabledUrls,
        ],
        content_scripts: [
          {
            matches: enabledUrls,
            js: entries.content,
          },
          {
            matches: ["*://*.slovensko.sk/*", "*://slovensko.sk/*"],
            css: ["static/upvs-fix-sksk.css"],
            all_frames: true,
            run_at: "document_start",
          },
          {
            matches: [
              "*://*.schranka.slovensko.sk/*",
              "*://schranka.slovensko.sk/*",
            ],
            css: ["static/upvs-fix-schranka-sksk.css"],
            all_frames: true,
            run_at: "document_start",
          },
        ],
        web_accessible_resources: [
          // ...entries.inject.map((x) => [x, x + ".map"]).flat(),
          // ...entries.content.map((x) => [x, x + ".map"]).flat(),
          // ...entries.background.map((x) => [x, x + ".map"]).flat(),
          ...Object.keys(entries)
            .map((key) => entries[key].map((x) => [x, x + ".map"]).flat())
            .flat(),
          "static/logo-64.png",
          ...enabledUrls,
        ],
        // TODO check if this is needed
        // externally_connectable: {
        //   // chrome only
        //   matches: enabledUrls,
        // },
        options_page: "static/options.html",
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
