import { createLogger } from "../../log";

const log = createLogger("ag-ext.fixed-signer");

/**
 * `localStorage` key the nove.slovensko.sk message composer
 * (message-constructor-web.slovensko.sk) keeps its default signing method
 * in. Its store reads the key once, while booting: a missing value is
 * replaced by `"Dsigner"` and written back, and the "Predvolené
 * podpisovanie: {signerType}" switcher writes the user's pick here.
 * Verified against `assets/apiClient-*.js` of the deployed app.
 */
const SIGNER_TYPE_KEY = "signer-type";

/** The two values the composer understands (`_t`/`vt` in its bundle). */
const SIGNER_TYPE_DSIGNER = "Dsigner";

/**
 * Marker written by an earlier extension version, which preselected the
 * composer's own "Autogram" method once per origin. No longer used.
 */
const LEGACY_PRESELECT_MARKER_KEY =
  "autogram-extension.signer-type-preselected";

interface StorageHolder {
  localStorage: Pick<Storage, "getItem" | "setItem" | "removeItem">;
}

/**
 * Pins the composer's signing method to "Dsigner" on every page load. That
 * path signs through `window.ditec`, which the extension replaces with its
 * own implementation — so the user gets the full Autogram desktop + AVM
 * mobile signing dialog instead of D.Signer/D.Launcher. (The composer's own
 * "Autogram" method only talks to the desktop app.)
 *
 * Runs from the content script (which shares the page's `localStorage`)
 * before the composer's app bundle boots and reads the key. The switcher
 * that would let the user change it is hidden by
 * {@link replaceSignerTypeSwitcher}.
 */
export function forceDSignerSigner(target: StorageHolder): void {
  try {
    const storage = target.localStorage;
    storage.setItem(SIGNER_TYPE_KEY, SIGNER_TYPE_DSIGNER);
    storage.removeItem(LEGACY_PRESELECT_MARKER_KEY);
    log.info("Pinned the portal's signing method to D.Signer (extension)");
  } catch (error) {
    // localStorage can throw (disabled cookies, partitioned/opaque
    // origins) — a failed write must never break the injection.
    log.warn("Failed to pin the portal's signing method", error);
  }
}

/**
 * `aria-label` prefixes of the switcher's trigger button
 * (`messageConstructorPage.signer-type-button-label`, sk and en), rendered
 * by the IDSK `DropDownButton` as
 * `div.idsk-dropdown > span > button[aria-haspopup=menu]`.
 */
const SWITCHER_LABEL_PREFIXES = {
  sk: "Predvolené podpisovanie:",
  en: "Default signing:",
} as const;

const LABEL_TEXT = {
  sk: "Podpisovanie: Autogram (cez rozšírenie)",
  en: "Signing: Autogram (using extension)",
} as const;

const LABEL_TITLE = {
  sk: "Podpisovanie zabezpečuje rozšírenie Autogram v prehliadači – podpísať môžete aplikáciou Autogram v počítači alebo v mobile.",
  en: "Signing is handled by the Autogram browser extension – sign with the Autogram desktop app or on your phone.",
} as const;

const HIDDEN_ATTR = "data-autogram-extension-hidden";
const LABEL_ATTR = "data-autogram-extension-signer-label";

type Lang = keyof typeof SWITCHER_LABEL_PREFIXES;

function switcherLang(button: Element): Lang | null {
  const label = button.getAttribute("aria-label") ?? "";
  for (const lang of Object.keys(SWITCHER_LABEL_PREFIXES) as Lang[]) {
    if (label.startsWith(SWITCHER_LABEL_PREFIXES[lang])) {
      return lang;
    }
  }
  return null;
}

function createLabel(doc: Document): HTMLElement {
  const label = doc.createElement("span");
  label.setAttribute(LABEL_ATTR, "");
  label.className = "govuk-body idsk-margin-zero";
  label.style.display = "inline-flex";
  label.style.alignItems = "center";
  return label;
}

/** (Re)translates the label — the portal can switch language in place. */
function setLabelLang(label: HTMLElement, lang: Lang): void {
  if (label.getAttribute(LABEL_ATTR) === lang) {
    return;
  }
  label.setAttribute(LABEL_ATTR, lang);
  label.textContent = LABEL_TEXT[lang];
  label.title = LABEL_TITLE[lang];
}

function replaceSwitchers(doc: Document): void {
  const triggers = doc.querySelectorAll(
    '.idsk-dropdown button[aria-haspopup="menu"]'
  );
  triggers.forEach((trigger) => {
    const lang = switcherLang(trigger);
    if (!lang) {
      return;
    }
    const dropdown = trigger.closest(".idsk-dropdown") as HTMLElement | null;
    if (!dropdown) {
      return;
    }
    if (!dropdown.hasAttribute(HIDDEN_ATTR)) {
      dropdown.setAttribute(HIDDEN_ATTR, "");
      dropdown.style.display = "none";
      log.debug("Hid the portal's signing method switcher");
    }
    let label = dropdown.nextElementSibling as HTMLElement | null;
    if (!label || !label.hasAttribute(LABEL_ATTR)) {
      label = createLabel(doc);
      dropdown.after(label);
    }
    setLabelLang(label, lang);
  });
}

/**
 * Hides the composer's "Predvolené podpisovanie" switcher and puts an
 * "Autogram (cez rozšírenie)" label in its place, so users see that
 * signing goes through the extension (see {@link forceDSignerSigner}).
 *
 * The composer is a Vue SPA that (re)renders the switcher whenever the
 * message page mounts, and patches its `aria-label` in place when the user
 * switches language, so this keeps watching the document for both.
 */
export function replaceSignerTypeSwitcher(doc: Document): MutationObserver {
  const observer = new MutationObserver(() => replaceSwitchers(doc));
  observer.observe(doc.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-label"],
  });
  replaceSwitchers(doc);
  return observer;
}
