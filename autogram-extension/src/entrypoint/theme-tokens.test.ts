import { readFileSync } from "fs";
import { resolve } from "path";

/** `--ag-*` custom properties declared in a source file, whitespace-normalized */
function tokens(file: string): Record<string, string> {
  const source = readFileSync(resolve(__dirname, file), "utf8");
  const result: Record<string, string> = {};
  const pattern = /(--ag-[a-z-]+):([^;]+);/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(source)) !== null) {
    result[match[1]] = match[2].replace(/\s+/g, " ").trim();
  }
  return result;
}

const sdk = tokens("../../../autogram-sdk/src/injected-ui/theme.ts");

test.each(["options.html", "popup.html"])(
  "%s uses the same design tokens as the SDK dialog",
  (page) => {
    expect(Object.keys(sdk).length).toBeGreaterThan(10);
    // pages may only reference tokens via var(), never redefine them
    expect(tokens(`../static/${page}`)).toEqual(sdk);
  }
);
