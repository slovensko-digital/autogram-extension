import { setupDialogAccessibility } from "./dialog-accessibility";

describe("dialog-accessibility", () => {
  let dialogElement: HTMLElement;
  let sibling1: HTMLElement;
  let sibling2: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";

    sibling1 = document.createElement("div");
    sibling1.id = "sibling1";
    document.body.appendChild(sibling1);

    sibling2 = document.createElement("nav");
    sibling2.id = "sibling2";
    document.body.appendChild(sibling2);

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

  it("does not hide siblings when dialog is initially hidden", () => {
    setupDialogAccessibility();

    expect(sibling1.getAttribute("aria-hidden")).toBeNull();
    expect(sibling2.getAttribute("aria-hidden")).toBeNull();
  });

  it("hides siblings when dialog becomes visible", async () => {
    setupDialogAccessibility();

    // Simulate AutogramRoot.show() setting display: flex
    dialogElement.style.display = "flex";

    // Allow MutationObserver microtask to run
    await Promise.resolve();

    expect(sibling1.getAttribute("aria-hidden")).toBe("true");
    expect(sibling2.getAttribute("aria-hidden")).toBe("true");
    expect(sibling1.inert).toBe(true);
    expect(sibling2.inert).toBe(true);
  });

  it("restores siblings when dialog becomes hidden again", async () => {
    setupDialogAccessibility();

    // Show
    dialogElement.style.display = "flex";
    await Promise.resolve();

    // Hide
    dialogElement.style.display = "none";
    await Promise.resolve();

    expect(sibling1.getAttribute("aria-hidden")).toBeNull();
    expect(sibling2.getAttribute("aria-hidden")).toBeNull();
    expect(sibling1.inert).toBe(false);
    expect(sibling2.inert).toBe(false);
  });

  it("does not apply aria-hidden to the dialog element itself", async () => {
    setupDialogAccessibility();

    dialogElement.style.display = "flex";
    await Promise.resolve();

    expect(dialogElement.getAttribute("aria-hidden")).toBeNull();
  });

  it("does nothing when autogram-root is not present in the DOM", () => {
    document.body.removeChild(dialogElement);

    // Should not throw
    expect(() => setupDialogAccessibility()).not.toThrow();
  });
});
