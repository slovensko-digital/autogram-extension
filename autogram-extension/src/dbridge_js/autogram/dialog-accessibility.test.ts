import { setupDialogAccessibility } from "./dialog-accessibility";

describe("dialog-accessibility", () => {
  let dialogElement: HTMLElement;
  let sibling1: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";

    sibling1 = document.createElement("div");
    sibling1.id = "sibling1";
    document.body.appendChild(sibling1);

    dialogElement = document.createElement("autogram-root");
    dialogElement.style.display = "none";
    document.body.appendChild(dialogElement);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("adds role=dialog and aria-modal=true to the autogram-root element", () => {
    setupDialogAccessibility();

    expect(dialogElement.getAttribute("role")).toBe("dialog");
    expect(dialogElement.getAttribute("aria-modal")).toBe("true");
  });

  it("adds an aria-label to the autogram-root element", () => {
    setupDialogAccessibility();

    expect(dialogElement.getAttribute("aria-label")).toBeTruthy();
  });

  it("adds popover=manual to the autogram-root element", () => {
    setupDialogAccessibility();

    expect(dialogElement.getAttribute("popover")).toBe("manual");
  });

  it("adds tabindex=-1 to make the host focusable", () => {
    setupDialogAccessibility();

    expect(dialogElement.getAttribute("tabindex")).toBe("-1");
  });

  it("does not overwrite an existing tabindex attribute", () => {
    dialogElement.setAttribute("tabindex", "0");
    setupDialogAccessibility();

    expect(dialogElement.getAttribute("tabindex")).toBe("0");
  });

  it("moves focus to the dialog when it becomes visible", async () => {
    setupDialogAccessibility();

    sibling1.setAttribute("tabindex", "-1");
    sibling1.focus();

    // Simulate AutogramRoot.show() setting display: flex
    dialogElement.style.display = "flex";

    // Allow MutationObserver microtask to run
    await Promise.resolve();

    expect(document.activeElement).toBe(dialogElement);
  });

  it("restores focus to the previously focused element when dialog closes", async () => {
    setupDialogAccessibility();

    sibling1.setAttribute("tabindex", "-1");
    sibling1.focus();

    // Show
    dialogElement.style.display = "flex";
    await Promise.resolve();

    // Hide
    dialogElement.style.display = "none";
    await Promise.resolve();

    expect(document.activeElement).toBe(sibling1);
  });

  it("does nothing when autogram-root is not present in the DOM", () => {
    document.body.removeChild(dialogElement);

    // Should not throw
    expect(() => setupDialogAccessibility()).not.toThrow();
  });
});
