import { createLogger } from "../../log";

const log = createLogger("ag-ext.dialog-accessibility");

const AUTOGRAM_ROOT_TAG = "autogram-root";
const DIALOG_LABEL = "Podpisovanie dokumentu";

/**
 * Sets up accessibility for the Autogram dialog overlay.
 *
 * Adds dialog semantics (role="dialog", aria-modal="true") to the autogram-root
 * custom element, and manages aria-hidden/inert on background content so that
 * keyboard focus and screen-reader access are restricted to the dialog while it
 * is open.
 */
export function setupDialogAccessibility(): void {
  const dialogElement = document.querySelector(
    AUTOGRAM_ROOT_TAG
  ) as HTMLElement | null;

  if (!dialogElement) {
    log.warn("autogram-root element not found, skipping accessibility setup");
    return;
  }

  // Add dialog ARIA semantics to the host element
  dialogElement.setAttribute("role", "dialog");
  dialogElement.setAttribute("aria-modal", "true");
  dialogElement.setAttribute("aria-label", DIALOG_LABEL);

  // Watch for visibility changes driven by show()/hide() on AutogramRoot
  const observer = new MutationObserver(() => {
    const isVisible = dialogElement.style.display === "flex";
    updateBackgroundAccessibility(dialogElement, isVisible);
  });

  observer.observe(dialogElement, {
    attributes: true,
    attributeFilter: ["style"],
  });
}

/**
 * When the dialog becomes visible, hide all other direct children of
 * document.body from the accessibility tree and prevent keyboard focus on them.
 * When the dialog closes, restore those attributes.
 */
function updateBackgroundAccessibility(
  dialogElement: Element,
  isDialogVisible: boolean
): void {
  const siblings = Array.from(document.body.children).filter(
    (el) => el !== dialogElement
  );

  for (const sibling of siblings) {
    if (isDialogVisible) {
      sibling.setAttribute("aria-hidden", "true");
      (sibling as HTMLElement).inert = true;
    } else {
      sibling.removeAttribute("aria-hidden");
      (sibling as HTMLElement).inert = false;
    }
  }
}
