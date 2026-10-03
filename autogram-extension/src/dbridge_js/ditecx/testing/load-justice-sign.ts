import fs from "fs";
import path from "path";
import { DitecX } from "../ditecx";

const FIXTURE_PATH = path.resolve(
  __dirname,
  "../../../../tests/fixtures/portals/justice-sign-pdf-20260716.js"
);

/**
 * The fixture is downloaded on demand (`npm run fetch:portal-fixtures`,
 * which extracts it from an upload POST response via
 * scripts/fetch-justice-driver.mjs), not vendored — it belongs to the
 * portal operator. Tests that replay it must skip when it is absent.
 */
export function hasJusticeSignFixture(): boolean {
  return fs.existsSync(FIXTURE_PATH);
}

/**
 * Records what the obcan.justice.sk signing page would show/do; the driver
 * script talks to these doubles instead of the real Liferay page.
 */
export interface JusticePageShell {
  /** Messages shown in the #errorMessage box (portal error display). */
  errors: string[];
  /** #signedPdf value at each #signForm submit (one entry per signature). */
  submits: string[];
  /** $.post calls of the PDF/A conversion path (#saveConvertedForm). */
  convertedPosts: string[];
  /** Simulates the user clicking the "Podpísať" button. */
  clickSign(): void;
  /** Whether deploy+init revealed the sign button (onSuccessInit ran). */
  signButtonVisible(): boolean;
  /** Whether the loading overlay was removed (onSuccessInit ran). */
  loadingRemoved(): boolean;
}

/**
 * Loads the obcan.justice.sk/podpisovanie-dokumentov inline signing driver
 * against a given `ditec` object, with the page shell (jQuery helpers, the
 * sign form DOM) replaced by recording doubles. Everything the script
 * itself does — the deploy/initialize choreography on page load, the
 * checkPDFACompliance → addPdfObject → sign → getSignature chain, error
 * display via `ditec.utils.isDitecError` — runs verbatim.
 *
 * `sourcePdfBase64` stands in for the uploaded document the portal renders
 * into the #sourcePdf hidden input.
 */
export function loadJusticeSignDriver(
  ditec: DitecX,
  sourcePdfBase64: string
): { shell: JusticePageShell } {
  const code = fs.readFileSync(FIXTURE_PATH, "utf-8");

  const btnSignPdf = { style: { display: "none" } };
  const signedPdf = { value: "" };
  const convertedPdf = { value: "" };
  const removed = new Set<string>();
  let clickHandler: (() => void) | null = null;
  let errorText = "";

  const shell: JusticePageShell = {
    errors: [],
    submits: [],
    convertedPosts: [],
    clickSign: () => {
      if (!clickHandler) {
        throw new Error("driver did not register a #btnSignPdf click handler");
      }
      clickHandler();
    },
    signButtonVisible: () => btnSignPdf.style.display === "inline",
    loadingRemoved: () =>
      removed.has("#loadingBackground") && removed.has("#loadingMessage"),
  };

  const signForm = {
    submit: () => shell.submits.push(signedPdf.value),
  };

  const fakeDocument = {
    getElementById(id: string) {
      switch (id) {
        case "btnSignPdf":
          return btnSignPdf;
        case "signedPdf":
          return signedPdf;
        case "signForm":
          return signForm;
        default:
          throw new Error(`unexpected getElementById: ${id}`);
      }
    },
  };

  // The slice of jQuery the driver uses, keyed by the selectors it passes.
  const $ = (selector: unknown) => {
    if (selector === fakeDocument) {
      return { ready: (fn: () => void) => fn() };
    }
    switch (selector) {
      case "#errorMessage":
        return {
          text: (t: string) => {
            errorText = t;
          },
          show: () => shell.errors.push(errorText),
        };
      case "#loadingBackground":
      case "#loadingMessage":
        return { remove: () => removed.add(selector) };
      case "#btnSignPdf":
        return {
          click: (fn: () => void) => {
            clickHandler = fn;
          },
        };
      case "#sourcePdf":
        return { val: () => sourcePdfBase64 };
      case "#convertedPdf":
        return {
          val: (v: string) => {
            convertedPdf.value = v;
          },
        };
      case "#saveConvertedForm":
        // Present on the real page; only touched on the PDF/A convert path.
        return {
          length: 1,
          attr: () => "https://obcan.justice.sk/saveConverted",
          serialize: () => `convertedPdf=${convertedPdf.value}`,
        };
      default:
        throw new Error(`unexpected jQuery selector: ${String(selector)}`);
    }
  };
  $.post = (
    url: string,
    data: string,
    callback: (response: string) => void
  ) => {
    shell.convertedPosts.push(url);
    callback("server-assigned-object-id");
  };

  const factory = new Function("ditec", "$", "document", code);
  factory(ditec, $, fakeDocument);
  return { shell };
}
