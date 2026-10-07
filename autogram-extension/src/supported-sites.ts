import { createLogger } from "./log";

const log = createLogger("ag-ext.supported-sites");

export const extensionId = "kbiiffakfklnmcideniiecbgkoocemif";

/**
 * Inject the script as soon as possible
 */
export const DIRECT_INJECTION = "direct" as const;

/**
 *  Inject the script when the document is loaded
 */
export const ON_DOCUMENT_LOAD_INJECTION = "on-document-load" as const;
// /**
//  * Inject the script based on MutationObserver
//  */
// export const MUTATION_OBSERVER_INJECTION = "mutation-observer" as const;
/**
 * Periodically check if the dsigner is initialized, then inject the script
 */
export const INTERVAL_INJECTION = "interval" as const;
export type InjectionStrategy =
  | typeof DIRECT_INJECTION
  | typeof ON_DOCUMENT_LOAD_INJECTION
  // | typeof MUTATION_OBSERVER_INJECTION
  | typeof INTERVAL_INJECTION;

/**
 * Replace `ditec` object with the injected one. This is done just once, at the injection time.
 */
export const CONFLICT_RESOLUTION_REPLACE_ORIGINAL = "replace-original" as const;
/**
 * Replace `ditec` object with a proxy object wrapping our injected version that will be used instead of the original object,
 * this proxy is immutable, every `set()` operation will be ignored.
 */
export const CONFLICT_RESOLUTION_IMMUTABLE_PROXY = "immutable-proxy" as const;

/**
 * Replace `ditec` object with a proxy object of original object that will be used instead of the original object, this proxy is mutable,
 * every `set()` operation will be ignored.
 */
export const CONFLICT_RESOLUTION_PROXY_ORIGINAL = "proxy-original" as const;
export type ConflictResolutionStrategy =
  | typeof CONFLICT_RESOLUTION_REPLACE_ORIGINAL
  | typeof CONFLICT_RESOLUTION_IMMUTABLE_PROXY;

/** Optional per-site behavior, on top of the `window.ditec` replacement. */
interface SiteFeatures {
  /**
   * Also install the native-Autogram network interceptor (see
   * `native-autogram-intercept.ts`) on this site, alongside the usual
   * `window.ditec` replacement. For portals that ship their own direct
   * client to the local Autogram desktop app (e.g. nove.slovensko.sk's
   * message composer), independent of `window.ditec`.
   */
  interceptNativeAutogram?: boolean;

  /**
   * Fix the picker on nove.slovensko.sk's message composer: pin its
   * signing method to "Dsigner" (served by our `window.ditec`, so Autogram
   * desktop + AVM) and replace the method switcher with a label — see
   * `fixed-signer.ts`.
   */
  fixPickerNoveSlovenskoSk?: boolean;
}

class Site {
  public interceptNativeAutogram: boolean;
  public fixPickerNoveSlovenskoSk: boolean;

  constructor(
    public url: string,
    public injectionStrategy: InjectionStrategy,
    public conflictResolution: ConflictResolutionStrategy,
    features: SiteFeatures = {}
  ) {
    this.interceptNativeAutogram = features.interceptNativeAutogram ?? false;
    this.fixPickerNoveSlovenskoSk = features.fixPickerNoveSlovenskoSk ?? false;
  }

  matchRuleExpl(str: string, rule: string) {
    // for this solution to work on any string, no matter what characters it has
    const escapeRegex = (str: string) =>
      str.replace(/([.*+?^=!:${}()|\\[\]\\/\\])/g, "\\$1");

    // "."  => Find a single character, except newline or line terminator
    // ".*" => Matches any string that contains zero or more characters
    rule = rule.split("*").map(escapeRegex).join(".*");

    rule = "^" + rule + "$";
    const regex = new RegExp(rule);
    return regex.test(str);
  }

  matchUrl(url: string) {
    return this.matchRuleExpl(url, this.url);
  }
}
class SupportedSites {
  sites: Site[] = [];
  constructor() {}

  matchUrl(url: string): Site {
    log.debug("matchUrl", url);
    const site = this.sites.find((site) => site.matchUrl(url));
    log.debug("site", site);
    if (site) {
      return site;
    }
    log.debug(this.sites);
    throw new Error(`Site ${url} is not supported`);
  }

  addSite(
    url: string,
    injection: InjectionStrategy,
    conflictResolution: ConflictResolutionStrategy,
    features: SiteFeatures = {}
  ) {
    this.sites.push(new Site(url, injection, conflictResolution, features));
  }

  get enabledUrls() {
    return this.sites.map((site) => site.url);
  }
}

// MARK: supported sites
export const supportedSites = new SupportedSites();

const basicUrls = [
  "https://www.slovensko.sk/*",
  "https://nove.slovensko.sk/*",
  "https://prihlasenie.slovensko.sk/*",
  "https://schranka.slovensko.sk/*",
  "https://schranka.upvsfixnew.gov.sk/*",
  "https://schranka3.slovensko.sk/*",
  "https://pfseform.financnasprava.sk/*",
  "https://www.financnasprava.sk/*",
  "https://cep.financnasprava.sk/*",
  "https://www.cep.financnasprava.sk/*",
  "https://eformulare.socpoist.sk/*",
  "https://eform.esluzbykosice.sk/*",
  "https://sluzby.orsr.sk/*",
];

for (const url of basicUrls) {
  supportedSites.addSite(
    url,
    ON_DOCUMENT_LOAD_INJECTION,
    CONFLICT_RESOLUTION_REPLACE_ORIGINAL
  );
}

supportedSites.addSite(
  "https://obcan.justice.sk/*",
  DIRECT_INJECTION,
  CONFLICT_RESOLUTION_IMMUTABLE_PROXY
);

supportedSites.addSite(
    "https://www.esluzbykosice.sk/*",
    INTERVAL_INJECTION,
    CONFLICT_RESOLUTION_REPLACE_ORIGINAL
);

// The message composer also ships its own direct client to the local
// Autogram desktop app (see native-autogram-intercept.ts) — independent of
// window.ditec. We pin it to its D.Signer path (our window.ditec) and hide
// its signing-method picker; the intercept stays as a fallback for when
// that pin fails.
supportedSites.addSite(
  "https://message-constructor-web.slovensko.sk/*",
  ON_DOCUMENT_LOAD_INJECTION,
  CONFLICT_RESOLUTION_REPLACE_ORIGINAL,
  { fixPickerNoveSlovenskoSk: true }
);

[
  "https://city-account-next.dev.bratislava.sk/*",
  "https://city-account-next.staging.bratislava.sk/*",
  "https://konto.bratislava.sk/*",
].forEach((url) => {
  supportedSites.addSite(
    url,
    INTERVAL_INJECTION,
    CONFLICT_RESOLUTION_REPLACE_ORIGINAL
  );
});

const isProductionBuild =
  typeof __IS_PRODUCTION__ !== "undefined"
    ? __IS_PRODUCTION__
    : process.env.NODE_ENV === "production";

const includeDebugUrlsFromDefine =
  typeof __INCLUDE_DEBUG_URLS__ !== "undefined" && __INCLUDE_DEBUG_URLS__;

const includeDebugUrlsFromEnv =
  typeof process !== "undefined" &&
  typeof process.env !== "undefined" &&
  process.env.AE_INCLUDE_DEBUG_URLS === "1";

const debugUrls =
  !isProductionBuild || includeDebugUrlsFromDefine || includeDebugUrlsFromEnv
    ? [
        "http://localhost:3000/*",
        "http://localhost:49675/*",
        "http://localhost/*",
        "http://127.0.0.1/*",
        "http://127.0.0.1:49675/*",
      ]
    : [];

for (const url of debugUrls) {
  supportedSites.addSite(
    url,

    /* injection type */
    // INTERVAL_INJECTION,
    ON_DOCUMENT_LOAD_INJECTION,

    /* conflict resolution */
    CONFLICT_RESOLUTION_REPLACE_ORIGINAL
  );
}

export const enabledUrls = supportedSites.enabledUrls;
