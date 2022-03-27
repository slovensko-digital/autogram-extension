export interface ManifestV2 {
  manifest_version: "2" | 2;
  browser_specific_settings?: {
    gecko?: {
      id: string;
      strict_min_version: string;
    };
  };
  background?: {
    scripts: StringPath[];
  };
  browser_action?: {
    default_icon: {
      [num: string]: StringPath;
    };
    default_title: string;
    default_popup: StringPath;
  };

  commands?: {
    [key: string]: {
      suggested_key: {
        default: "Ctrl+Shift+Y";
        linux: "Ctrl+Shift+U";
      };
      description: "Send a 'toggle-feature' event";
    };
  };

  content_security_policy?: "script-src 'self' https://example.com; object-src 'self'";

  content_scripts?: [
    {
      exclude_matches?: string[];
      matches: string[];
      js: string[];
    }
  ];

  default_locale?: string;

  description?: string;

  icons: {
    [num: string]: StringPath;
  };

  name: string;

  page_action?: {
    default_icon: { [num: string]: StringPath };
    default_title: string;
    default_popup: StringPath;
  };

  permissions?: PermissionName[];

  version: string;

  user_scripts?: {
    api_script: StringPath;
  };

  web_accessible_resources?: StringPath[];
  [key: string]: unknown;
}

export interface ManifestV3 {
  manifest_version: "3" | 3;
  name: string;
  version: string;

  // Recommended
  action?: {
    default_icon?: {
      [num: string]: StringPath;
    };
    default_title?: string;
    default_popup?: StringPath;
  };
  /**
   * Specifies the subdirectory of _locales that contains the default strings for this extension.
   * This field is required in extensions that have a _locales directory; it must be absent in extensions that have no _locales directory.
   */
  default_locale?: string;
  /**
   * A plain text string (no HTML or other formatting; no more than 132 characters) that describes the extension.
   * The description should be suitable for both the browser's extension management UI and the Chrome Web Store.
   * You can specify locale-specific strings for this field.
   */
  description: string;
  /**
   * One or more icons that represent the extension, app, or theme.
   * You should always provide a 128x128 icon; it's used during installation and by the Chrome Web Store.
   * Extensions should also provide a 48x48 icon, which is used in the extensions management page (chrome://extensions).
   * You can also specify a 16x16 icon to be used as the favicon for an extension's pages.
   *
   * Icons should generally be in PNG format, because PNG has the best support for transparency.
   * They can, however, be in any format supported by WebKit, including BMP, GIF, ICO, and JPEG.
   */
  icons: {
    [num: string]: StringPath;
  };

  // Optional
  author?: string;
  automation?: string;
  /**
   * Extensions are event-based programs used to modify or enhance the Chrome browsing experience.
   * Events are browser triggers, such as navigating to a new page, removing a bookmark, or closing a tab.
   * Extensions monitor these events using scripts in their background service worker, which then react with specified instructions.
   *
   * https://developer.chrome.com/docs/extensions/mv3/service_workers/
   */
  background?: {
    // Required
    service_worker: StringPath;
    // Optional
    type?: "module" | null;
  };
  /**
   * Settings overrides are a way for extensions to override selected Chrome settings.
   */
  chrome_settings_overrides?: { [k: string]: unknown };
  chrome_url_overrides?: { [k: string]: unknown };
  /**
   * Use the commands API to add keyboard shortcuts that trigger actions in your extension, for example, an action to open the browser action or send a command to the extension.
   *
   * Each command an extension accepts must be declared as properties of the "commands" object in the extension's manifest.
   */
  commands?: {
    [name: string]: {
      suggested_key: {
        default: string;
        mac: string;
        windows: string;
        chromeos: string;
        linux: string;
      };
      description: string;
    };
  };
  content_capabilities?: unknown;
  /**
   * Content scripts are files that run in the context of web pages.
   * By using the standard Document Object Model (DOM), they are able to read details of the web pages the browser visits,
   * make changes to them, and pass information to their parent extension.
   *
   * https://developer.chrome.com/docs/extensions/mv3/content_scripts/
   */
  content_scripts?: {
    matches: string[];
    css?: StringPath[];
    js?: StringPath[];
    match_about_blank?: boolean;
    match_origin_as_fallback?: boolean;
  }[];
  /**
   *
   *
   * https://developer.chrome.com/docs/extensions/mv3/intro/mv3-migration/#content-security-policy
   */
  content_security_policy?: {
    /** This policy covers pages in your extension, including html files and service workers. */
    extension_pages?: string;
    /** This policy covers any sandboxed extension pages that your extension uses */
    sandbox?: string;
    "script-src": CSPLocal;
    "object-src": CSPLocal;
    "worker-src": CSPLocal;
  };
  converted_from_user_script?: unknown;
  /**
   * The cross_origin_embedder_policy manifest key lets the extension to specify a value for the Cross-Origin-Embedder-Policy (COEP)
   * response header for requests to the extension's origin. This includes the extension's background context (service worker or background page),
   * popup, options page, tabs that are open to an extension resource, etc.
   *
   * Together with cross_origin_opener_policy, this key allows the extension to opt into [cross-origin isolation](https://developer.chrome.com/docs/extensions/mv3/cross-origin-isolation/).
   *
   * https://developer.chrome.com/docs/extensions/mv3/manifest/cross_origin_embedder_policy/
   */
  cross_origin_embedder_policy?: { value: "require-corp" | string };
  /**
   * The cross_origin_opener_policy manifest key lets extensions specify a value for the Cross-Origin-Opener-Policy (COOP)
   * response header for requests to the extension's origin. This includes the extension's background context (service worker or background page),
   * popup, options page, tabs that are open to an extension resource, etc.
   *
   * Together with cross_origin_embedder_policy, this key allows extensions opt into [cross-origin isolation](https://developer.chrome.com/docs/extensions/mv3/cross-origin-isolation/).
   *
   * https://developer.chrome.com/docs/extensions/mv3/manifest/cross_origin_opener_policy/
   */
  cross_origin_opener_policy?: { value: "same-origin" | string };
  current_locale?: string;
  declarative_net_request?: unknown;
  /**
   * https://developer.chrome.com/docs/extensions/mv3/devtools/
   */
  devtools_page?: StringPath;
  differential_fingerprint?: unknown;
  /**
   * The event_rules manifest property provides a mechanism to add rules that intercept, block, or modify web requests
   *  in-flight using declarativeWebRequest or take actions depending on the content of a page, without requiring permission
   *  to read the page's content using declarativeContent.
   *
   * https://developer.chrome.com/docs/extensions/mv3/manifest/event_rules/
   */
  event_rules?: {
    event: string;
    actions: { type: string }[];
    conditions: { type: string; css: string[] }[];
  }[];
  /**
   * The externally_connectable manifest property declares which extensions, apps, and web pages can connect to your extension via runtime.connect and runtime.sendMessage.
   *
   * https://developer.chrome.com/docs/extensions/mv3/manifest/externally_connectable/
   */
  externally_connectable?: {
    matches: string[];
  };
  /**
   * Use the chrome.fileBrowserHandler API to extend the Chrome OS file browser. For example, you can use this API to enable users to upload files to your website.
   *
   * https://developer.chrome.com/docs/extensions/reference/fileBrowserHandler/
   */
  file_browser_handlers?: {
    id: string;
    default_title: string;
    file_filters: string[];
  }[];
  /**
   * Use the chrome.fileSystemProvider API to create file systems, that can be accessible from the file manager on Chrome OS.
   *
   * https://developer.chrome.com/docs/extensions/reference/fileSystemProvider/
   */
  file_system_provider_capabilities?: {
    configurable?: boolean;
    multiple_mounts?: boolean;
    watchable?: boolean;
    source: string;
  };
  homepage_url?: string;
  /**
   * Use the chrome.permissions API to request declared optional permissions at run time rather than install time, so users understand why the permissions are needed and grant only those that are necessary.
   * ://developer.chrome.com/docs/extensions/reference/permissions/
   */
  host_permissions?: PermissionName[];
  /** https://developer.chrome.com/docs/extensions/mv2/shared_modules/ */
  import?: { id: string; minimum_version?: string }[];
  /**
   * Use the "incognito" manifest key with either "spanning" or "split" to specify how this extension will behave if allowed to run in incognito mode. Using "not_allowed" to prevent this extension from being enabled in incognito mode.
   *
   * https://developer.chrome.com/docs/extensions/mv3/manifest/incognito/
   */
  incognito?: "spanning" | "split" | "not_allowed";
  input_components?: unknown;
  /**
   * This value can be used to control the unique ID of an extension, app, or theme when it is loaded during development.
   * https://developer.chrome.com/docs/extensions/mv3/manifest/key/
   */
  key?: "publicKey";
  minimum_chrome_version?: string;
  nacl_modules?: unknown[];
  natively_connectable?: unknown;
  oauth2?: unknown;
  offline_enabled?: boolean;
  /** https://developer.chrome.com/docs/extensions/reference/omnibox/ */
  omnibox?: {
    keyword: string;
  };
  /** https://developer.chrome.com/docs/extensions/reference/permissions/ */
  optional_permissions?: PermissionName[];
  /**
   * An extension's options page will be displayed in a new tab. The options HTML file is listed registered under the options_page field.
   *
   * https://developer.chrome.com/docs/extensions/mv3/options/
   */
  options_page?: StringPath;
  /**
   * Embedded options allows users to adjust extension options without navigating away from the extensions management page inside an embedded box. To declare an embedded options, register the HTML file under the options_ui field in the extension manifest, with the open_in_tab key set to false.
   *
   * https://developer.chrome.com/docs/extensions/mv3/options/
   */
  options_ui?: {
    page: StringPath;
    open_in_tab: boolean;
  };
  /** https://developer.chrome.com/docs/extensions/reference/permissions/ */
  permissions?: PermissionName[];
  platforms?: unknown;
  replacement_web_app?: unknown;
  /**
   * Technologies required by the extension. Hosting sites such as the Chrome Web Store may use this list to dissuade users from installing extensions that will not work on their computer. Supported requirements currently include "3D" and "plugins"; additional requirements checks may be added in the future.
   *
   * https://developer.chrome.com/docs/extensions/mv3/manifest/requirements/
   */
  requirements?: { unknown };
  /** https://developer.chrome.com/docs/extensions/mv3/manifest/sandbox/ */
  sandbox?: unknown;
  /**
   * The short_name (maximum of 12 characters recommended) is a short version of the extension's name.
   * It is an optional field and if not specified, the name will be used, though it will likely be truncated.
   * The short name is typically used where there is insufficient space to display the full name, such as:
   *
   * - App launcher
   * - New Tab page
   */
  short_name?: string;
  /**
   * Unlike the local and sync storage areas, the managed storage area requires its structure to be declared as JSON Schema and is strictly validated by Chrome. This schema must be stored in a file indicated by the "managed_schema" property of the "storage" manifest key and declares the enterprise policies supported by the extension.
   *
   * https://developer.chrome.com/docs/extensions/mv3/manifest/storage/
   */
  storage?: {
    managed_schema: StringPath;
  };
  system_indicator?: unknown;
  /** https://developer.chrome.com/docs/extensions/reference/ttsEngine/ */
  tts_engine?: { unknown };
  /** https://developer.chrome.com/docs/extensions/mv3/hosting/ */
  update_url?: string;
  /**
   * In addition to the version field, which is used for update purposes, version_name can be set to a descriptive version string and will be used for display purposes if present.
   */
  version_name?: string;
  /**
   * By default no resources are web accessible; only pages or scripts loaded from an extension's origin can access that extension's resources. Extension authors can use the web_accessible_resources manifest property to declare which resources are exposed and to what origins.
   *
   * https://developer.chrome.com/docs/extensions/mv3/manifest/web_accessible_resources/
   */
  web_accessible_resources?: {
    resources: StringPath[];
    matches: string[];
    extension_ids?: string[];
    use_dynamic_url?: boolean;
  }[];
}

type StringPath = string;
type CSPLocal =
  | "self"
  | "none"
  | "http://localhost"
  | "http://127.0.0.1"
  | "http://localhost:3000";

type PermissionName =
  | "activeTab"
  | "alarms"
  | "background"
  | "bookmarks"
  | "browsingData"
  | "certificateProvider"
  | "clipboardRead"
  | "clipboardWrite"
  | "contentSettings"
  | "contextMenus"
  | "cookies"
  | "debugger"
  | "declarativeContent"
  | "declarativeNetRequest"
  | "declarativeNetRequestFeedback"
  | "declarativeWebRequest"
  | "desktopCapture"
  | "documentScan"
  | "downloads"
  | "enterprise.deviceAttributes"
  | "enterprise.hardwarePlatform"
  | "enterprise.networkingAttributes"
  | "enterprise.platformKeys"
  | "experimental"
  | "fileBrowserHandler"
  | "fileSystemProvider"
  | "fontSettings"
  | "gcm"
  | "geolocation"
  | "history"
  | "identity"
  | "idle"
  | "loginState"
  | "management"
  | "nativeMessaging"
  | "notifications"
  | "pageCapture"
  | "platformKeys"
  | "power"
  | "printerProvider"
  | "printing"
  | "printingMetrics"
  | "privacy"
  | "processes"
  | "proxy"
  | "scripting"
  | "search"
  | "sessions"
  | "signedInDevices"
  | "storage"
  | "system.cpu"
  | "system.display"
  | "system.memory"
  | "system.storage"
  | "tabCapture"
  | "tabGroups"
  | "tabs"
  | "topSites"
  | "tts"
  | "ttsEngine"
  | "unlimitedStorage"
  | "vpnProvider"
  | "wallpaper"
  | "webNavigation"
  | "webRequest"
  | "webRequestBlocking";
