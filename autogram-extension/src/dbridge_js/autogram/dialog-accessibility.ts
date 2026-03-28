import { createLogger } from "../../log";

const log = createLogger("ag-ext.dialog-accessibility");

const AUTOGRAM_ROOT_TAG = "autogram-root";
const DIALOG_LABEL = "Podpisovanie dokumentu";

/**
 * Sets up accessibility for the Autogram dialog overlay.
 *
 * Adds dialog semantics and a manual popover role to the autogram-root custom
 * element. When the dialog opens, keyboard focus is moved into it; when it
 * closes, focus is returned to wherever the user was before.
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

  // Register as a manual popover so the browser exposes correct accessibility
  // semantics. Display is still controlled by AutogramRoot.show()/hide().
  dialogElement.setAttribute("popover", "manual");

  // Ensure the host element is focusable for programmatic focus on open
  if (!dialogElement.hasAttribute("tabindex")) {
    dialogElement.setAttribute("tabindex", "-1");
  }

  let previouslyFocused: Element | null = null;

  // Watch for visibility changes driven by show()/hide() on AutogramRoot
  const observer = new MutationObserver(() => {
    const isVisible = dialogElement.style.display === "flex";
    if (isVisible) {
      previouslyFocused = document.activeElement;
      dialogElement.focus();
    } else {
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
      previouslyFocused = null;
    }
  });

  observer.observe(dialogElement, {
    attributes: true,
    attributeFilter: ["style"],
  });
}
