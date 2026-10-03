import { forceDSignerSigner, replaceSignerTypeSwitcher } from "./fixed-signer";

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    localStorage: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => void data.set(key, value),
      removeItem: (key: string) => void data.delete(key),
    },
    data,
  };
}

describe("forceDSignerSigner", () => {
  it("selects D.Signer on a fresh origin", () => {
    const target = fakeStorage();
    forceDSignerSigner(target);
    expect(target.data.get("signer-type")).toBe("Dsigner");
  });

  it("overrides a previously chosen Autogram method on every load", () => {
    const target = fakeStorage({
      "signer-type": "Autogram",
      "autogram-extension.signer-type-preselected": "2026-09-01T00:00:00Z",
    });
    forceDSignerSigner(target);
    expect(target.data.get("signer-type")).toBe("Dsigner");
    expect(target.data.has("autogram-extension.signer-type-preselected")).toBe(
      false
    );
  });

  it("does not throw when localStorage is unavailable", () => {
    const target = {
      localStorage: {
        getItem: () => null,
        setItem: () => {
          throw new Error("access denied");
        },
        removeItem: () => undefined,
      },
    };
    expect(() => forceDSignerSigner(target)).not.toThrow();
  });
});

/** Markup of the composer's IDSK `DropDownButton` switcher. */
function switcherHtml(label: string) {
  return `
    <div class="flex flex-col md:flex-row gap-4 justify-end mt-2">
      <button class="favorites">Pridať do obľúbených</button>
      <div class="idsk-dropdown">
        <span style="display: contents">
          <button aria-haspopup="menu" aria-label="${label}">${label}</button>
        </span>
      </div>
    </div>`;
}

const flushMutations = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("replaceSignerTypeSwitcher", () => {
  let observer: MutationObserver | null = null;

  afterEach(() => {
    observer?.disconnect();
    observer = null;
    document.body.innerHTML = "";
  });

  it("hides an already rendered switcher and labels it", () => {
    document.body.innerHTML = switcherHtml("Predvolené podpisovanie: Dsigner");
    observer = replaceSignerTypeSwitcher(document);

    const dropdown = document.querySelector(".idsk-dropdown") as HTMLElement;
    expect(dropdown.style.display).toBe("none");
    const label = dropdown.nextElementSibling as HTMLElement;
    expect(label.textContent).toBe("Podpisovanie: Autogram (cez rozšírenie)");
  });

  it("handles a switcher rendered later by the SPA, in English", async () => {
    observer = replaceSignerTypeSwitcher(document);
    document.body.innerHTML = switcherHtml("Default signing: Dsigner");
    await flushMutations();

    const dropdown = document.querySelector(".idsk-dropdown") as HTMLElement;
    expect(dropdown.style.display).toBe("none");
    expect(dropdown.nextElementSibling?.textContent).toBe(
      "Signing: Autogram (using extension)"
    );
  });

  it("re-translates the label when the portal switches language", async () => {
    document.body.innerHTML = switcherHtml("Predvolené podpisovanie: Dsigner");
    observer = replaceSignerTypeSwitcher(document);

    document
      .querySelector('button[aria-haspopup="menu"]')
      ?.setAttribute("aria-label", "Default signing: Dsigner");
    await flushMutations();

    const labels = document.querySelectorAll(
      "[data-autogram-extension-signer-label]"
    );
    expect(labels).toHaveLength(1);
    expect(labels[0].textContent).toBe("Signing: Autogram (using extension)");
  });

  it("inserts the label only once", async () => {
    document.body.innerHTML = switcherHtml("Predvolené podpisovanie: Dsigner");
    observer = replaceSignerTypeSwitcher(document);
    document.body.appendChild(document.createElement("div"));
    await flushMutations();

    expect(
      document.querySelectorAll("[data-autogram-extension-signer-label]")
    ).toHaveLength(1);
  });

  it("leaves other dropdowns alone", () => {
    document.body.innerHTML = switcherHtml("Ďalšie akcie");
    observer = replaceSignerTypeSwitcher(document);

    const dropdown = document.querySelector(".idsk-dropdown") as HTMLElement;
    expect(dropdown.style.display).toBe("");
    expect(
      document.querySelector("[data-autogram-extension-signer-label]")
    ).toBeNull();
  });
});
