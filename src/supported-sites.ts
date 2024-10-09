export const extensionId = "kbiiffakfklnmcideniiecbgkoocemif";

export const DIRECT_INJECTION = "direct" as const;
export const ON_DOCUMENT_LOAD_INJECTION = "on-document-load" as const;
export type InjectionStrategy =
  | typeof DIRECT_INJECTION
  | typeof ON_DOCUMENT_LOAD_INJECTION;

export const CONFLICT_RESOLUTION_REPLACE_ORIGINAL = "replace-original" as const;
export const CONFLICT_RESOLUTION_IMMUTABLE_PROXY = "immutable-proxy" as const;
export const CONFLICT_RESOLUTION_PROXY_ORIGINAL = "proxy-original" as const;
export type ConflictResolutionStrategy =
  | typeof CONFLICT_RESOLUTION_REPLACE_ORIGINAL
  | typeof CONFLICT_RESOLUTION_IMMUTABLE_PROXY;

class Site {
  constructor(
    public url: string,
    public injectionStrategy: InjectionStrategy,
    public conflictResolution: ConflictResolutionStrategy
  ) {}

  matchRuleExpl(str, rule) {
    // for this solution to work on any string, no matter what characters it has
    const escapeRegex = (str) =>
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
    const site = this.sites.find((site) => site.matchUrl(url));
    if (site) {
      return site;
    }
    console.log(this.sites);
    throw new Error(`Site ${url} is not supported`);
  }

  addSite(
    url: string,
    injection: InjectionStrategy,
    conflictResolution: ConflictResolutionStrategy
  ) {
    this.sites.push(new Site(url, injection, conflictResolution));
  }

  get enabledUrls() {
    return this.sites.map((site) => site.url);
  }
}

export const supportedSites = new SupportedSites();
const basicUrls = [
  "https://www.slovensko.sk/*",
  "https://schranka.slovensko.sk/*",
  "https://pfseform.financnasprava.sk/*",
  "https://www.financnasprava.sk/*",
  "https://cep.financnasprava.sk/*",
  "https://www.cep.financnasprava.sk/*",
  "https://eformulare.socpoist.sk/*",
  "https://sluzby.orsr.sk/*",
];

const debugUrls =
  process.env.NODE_ENV !== "production"
    ? [
        "http://localhost:3000/*",
        "http://localhost:49675/*",
        "http://localhost/*",
        "http://127.0.0.1/*",
        "http://127.0.0.1:49675/*",
      ]
    : [];

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

for (const url of debugUrls) {
  supportedSites.addSite(
    url,
    ON_DOCUMENT_LOAD_INJECTION,
    CONFLICT_RESOLUTION_REPLACE_ORIGINAL
  );
}

export const enabledUrls = supportedSites.enabledUrls;
