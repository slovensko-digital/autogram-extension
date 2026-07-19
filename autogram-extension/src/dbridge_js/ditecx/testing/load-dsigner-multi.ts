import fs from "fs";
import path from "path";
import { DitecX } from "../ditecx";

const FIXTURE_PATH = path.resolve(
  __dirname,
  "../../../../tests/fixtures/portals/DSignerMulti-20250601.js"
);

/**
 * The fixture is downloaded on demand (`npm run fetch:portal-fixtures`),
 * not vendored — it belongs to the portal operator. Tests that replay it
 * must skip (with a pointer to the fetch script) when it is absent.
 */
export function hasDSignerMultiFixture(): boolean {
  return fs.existsSync(FIXTURE_PATH);
}

export const FETCH_FIXTURES_HINT =
  "portal fixture missing — run `npm run fetch:portal-fixtures` to download " +
  "the portal signer scripts (see tests/fixtures/portals/README.md)";

/**
 * Records what the portal's page shell would show the user; the fixture
 * script talks to these instead of the real eDesk UI.
 */
export interface PortalShell {
  /** Messages passed to MessageBox.displayError (portal error dialog). */
  errors: string[];
  /** eDesk.core.modalShow/modalClose invocations. */
  modals: string[];
  /** window.alert fallbacks (DSignerMulti's "NotImplemented" callback). */
  alerts: string[];
}

interface DSignerInstance {
  sign(signRequest: unknown, resultCallback: (result: unknown) => void): void;
  checkPDFACompliance(
    signRequest: unknown,
    resultCallback: (invalid: unknown) => void
  ): void;
}

interface DSignerMultiExports {
  DSigner: new () => DSignerInstance;
  Callback: new (
    onSuccess?: (value?: unknown) => void,
    onError?: (e: unknown) => void,
    errorCodes?: unknown
  ) => { onSuccess: (value?: unknown) => void; onError: (e: unknown) => void };
  DSignerErrorMessages: {
    getErrorMessage(errorCodes: unknown, code: unknown, message: string): string;
  };
}

/**
 * Loads the vendored schranka.slovensko.sk DSignerMulti.js against a given
 * `ditec` object, with the portal page shell (eDesk, MessageBox, jQuery
 * helpers) replaced by recording stubs. Everything the script itself does —
 * argument marshalling, callback chaining, error branching, the getVersion
 * plugin gate — runs verbatim.
 */
export function loadDSignerMulti(
  ditec: DitecX
): DSignerMultiExports & { shell: PortalShell } {
  // strip the UTF-8 BOM the portal serves the file with
  const code = fs
    .readFileSync(FIXTURE_PATH, "utf-8")
    .replace(/^\uFEFF/, "");

  const shell: PortalShell = { errors: [], modals: [], alerts: [] };

  const eDesk = {
    core: {
      modalShow: (id: string) => shell.modals.push(`show:${id}`),
      modalClose: (id: string) => shell.modals.push(`close:${id}`),
      compareVersions,
    },
  };
  const MessageBox = {
    displayError: (message: string) => shell.errors.push(message),
  };
  // The fixture only uses $.grep (in the getVersion plugin gate).
  const $ = {
    grep: <T>(arr: T[], fn: (item: T, index: number) => boolean) =>
      arr.filter((item, index) => fn(item, index)),
  };
  const alert = (message: unknown) => shell.alerts.push(String(message));

  const factory = new Function(
    "ditec",
    "eDesk",
    "MessageBox",
    "$",
    "alert",
    `${code}
;return { DSigner: DSigner, Callback: Callback, DSignerErrorMessages: DSignerErrorMessages };`
  );

  const exported = factory(
    ditec,
    eDesk,
    MessageBox,
    $,
    alert
  ) as DSignerMultiExports;
  return { ...exported, shell };
}

/** Same semantics as eDesk.core.compareVersions for dotted versions. */
function compareVersions(a: string, b: string): number {
  const as = a.split(".").map(Number);
  const bs = b.split(".").map(Number);
  const length = Math.max(as.length, bs.length);
  for (let i = 0; i < length; i++) {
    const diff = (as[i] ?? 0) - (bs[i] ?? 0);
    if (diff !== 0) return diff < 0 ? -1 : 1;
  }
  return 0;
}
