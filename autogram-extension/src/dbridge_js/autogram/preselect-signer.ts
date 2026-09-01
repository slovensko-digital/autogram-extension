import { createLogger } from "../../log";

const log = createLogger("ag-ext.preselect-signer");

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
const SIGNER_TYPE_AUTOGRAM = "Autogram";

/**
 * Our own marker, so the preselect happens exactly once per browser
 * profile + origin. After that the stored value is the user's own choice —
 * including a deliberate switch back to D.Signer — and we must not keep
 * overriding it on every page load.
 */
const PRESELECT_MARKER_KEY = "autogram-extension.signer-type-preselected";

interface StorageHolder {
  localStorage: Pick<Storage, "getItem" | "setItem">;
}

/**
 * Makes "Autogram" the composer's preselected signing method the first
 * time we see this origin, so signing goes through the extension (see
 * `native-autogram-intercept.ts`) instead of D.Signer/D.Launcher.
 *
 * Runs from the content script (which shares the page's `localStorage`) at
 * `document_start`, before the composer's app bundle boots and reads the
 * key.
 */
export function preselectAutogramSigner(target: StorageHolder): void {
  try {
    const storage = target.localStorage;
    if (storage.getItem(PRESELECT_MARKER_KEY) !== null) {
      log.debug("Signer type already preselected once, keeping user's choice");
      return;
    }
    storage.setItem(SIGNER_TYPE_KEY, SIGNER_TYPE_AUTOGRAM);
    storage.setItem(PRESELECT_MARKER_KEY, new Date().toISOString());
    log.info("Preselected Autogram as the portal's signing method");
  } catch (error) {
    // localStorage can throw (disabled cookies, partitioned/opaque
    // origins) — a failed preselect must never break the injection.
    log.warn("Failed to preselect Autogram as signing method", error);
  }
}
