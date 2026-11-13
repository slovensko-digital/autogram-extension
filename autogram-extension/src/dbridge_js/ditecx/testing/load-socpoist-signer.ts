import fs from "fs";
import path from "path";
import vm from "vm";

const FIXTURE_DIR = path.resolve(
  __dirname,
  "../../../../tests/fixtures/portals"
);

/**
 * The scripts esluzby.socpoist.sk/moj-portal appends to the page, in order,
 * when a signature is requested (the "Podpisovac" Nuxt component): its own
 * SignerService, then the slovensko.sk D.Bridge v1.0 library. Downloaded on
 * demand (`npm run fetch:portal-fixtures`), not vendored.
 */
const SCRIPTS = [
  "socpoist-SignerService-20261113.js",
  "sksk-dbridge-v1.0-config-20261113.js",
  "sksk-dbridge-v1.0-dCommon-20261113.js",
  "sksk-dbridge-v1.0-dSigXades-20261113.js",
  "sksk-dbridge-v1.0-dSigXadesBp-20261113.js",
  "sksk-dbridge-v1.0-dSigXadesExtender-20261113.js",
  "sksk-dbridge-v1.0-dViewer-20261113.js",
];

export function hasSocpoistSignerFixtures(): boolean {
  return SCRIPTS.every((name) => fs.existsSync(path.join(FIXTURE_DIR, name)));
}

/** Result object SignerService.signXml resolves or rejects with. */
export interface SignerResult {
  status: "success" | "error" | "cancel";
  response: string;
}

export interface SignXmlData {
  namespace: string;
  uuid: string;
  formTitle: string;
  xml: string;
  formVersion: string;
  xsd: string;
  xslt: string;
  langId: string;
}

export interface SocpoistAttachment {
  id?: string;
  fileName?: string;
  mimeType: string;
  contentBase64?: string;
  xml?: string;
  description?: string;
}

export interface SocpoistPage {
  /** The page's global `ditec` after all scripts ran. */
  ditec: unknown;
  /** Uncaught errors per script, as the browser would report them. */
  scriptErrors: Record<string, unknown>;
  signXml(
    data: SignXmlData,
    attachments?: SocpoistAttachment[]
  ): Promise<SignerResult>;
}

/**
 * Runs the portal's scripts verbatim as classic scripts of one page whose
 * `window.ditec` is the given object, as the extension installs it before
 * the portal loads them. Each script runs separately, like a `<script>`
 * element: an uncaught error ends only that script and is recorded, the
 * portal's loader still moves on to the next one (`onload` fires).
 */
export function loadSocpoistSigner(ditec: unknown): SocpoistPage {
  const quiet = () => undefined;
  const page: Record<string, unknown> = {
    console: {
      log: quiet,
      info: quiet,
      warn: quiet,
      error: quiet,
      debug: quiet,
    },
    document: window.document,
    navigator: window.navigator,
    location: window.location,
    setTimeout,
    clearTimeout,
    ditec,
  };
  page.window = page;
  page.self = page;
  const context = vm.createContext(page);

  const scriptErrors: Record<string, unknown> = {};
  for (const name of SCRIPTS) {
    const code = fs.readFileSync(path.join(FIXTURE_DIR, name), "utf-8");
    try {
      vm.runInContext(code, context, { filename: name });
    } catch (error) {
      scriptErrors[name] = error;
    }
  }

  const signerService = page.SignerService as {
    signXml(
      data: SignXmlData,
      attachments?: SocpoistAttachment[]
    ): Promise<SignerResult>;
  };

  return {
    ditec: page.ditec,
    scriptErrors,
    signXml: (data, attachments = []) =>
      signerService.signXml(data, attachments).then(
        (result) => result,
        (result: SignerResult) => result
      ),
  };
}
