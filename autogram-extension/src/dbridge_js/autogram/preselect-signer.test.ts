import { preselectAutogramSigner } from "./preselect-signer";

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    localStorage: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => void data.set(key, value),
    },
    data,
  };
}

describe("preselectAutogramSigner", () => {
  it("selects Autogram on a fresh origin", () => {
    const target = fakeStorage();
    preselectAutogramSigner(target);
    expect(target.data.get("signer-type")).toBe("Autogram");
  });

  it("overrides the portal's D.Signer default once", () => {
    const target = fakeStorage({ "signer-type": "Dsigner" });
    preselectAutogramSigner(target);
    expect(target.data.get("signer-type")).toBe("Autogram");
  });

  it("keeps the user's later choice on subsequent loads", () => {
    const target = fakeStorage();
    preselectAutogramSigner(target);

    // user switches back via the portal's signing-method switcher
    target.data.set("signer-type", "Dsigner");
    preselectAutogramSigner(target);

    expect(target.data.get("signer-type")).toBe("Dsigner");
  });

  it("does not throw when localStorage is unavailable", () => {
    const target = {
      localStorage: {
        getItem: () => {
          throw new Error("access denied");
        },
        setItem: () => undefined,
      },
    };
    expect(() => preselectAutogramSigner(target)).not.toThrow();
  });
});
