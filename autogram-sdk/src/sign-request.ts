/**
 * @module sign-request
 * Conversion between the `POST /api/v1/sign` request shape (Autogram >=
 * 2.8.0), which the SDK uses everywhere, and the legacy `POST /sign` shape,
 * which is still needed internally for older Autogram versions and for
 * Autogram v mobile. Also exports migration helpers for callers that still
 * hold legacy-shaped input, plus the version helpers used to pick the
 * endpoint.
 *
 * Pure module: no DOM, no fetch, so it can be unit tested under Node.
 */
import type {
  AutogramDocument,
  LegacyAutogramDocument,
  LegacySignatureParameters,
  PresentationParameters,
  SignatureParameters,
  XDCParameters,
} from "./autogram-api/index";
import { AutogramError } from "./errors";
import { createLogger } from "./log";
import type { DocumentToSign } from "./types";
import { toPayloadMimeType } from "./types";

const log = createLogger("ag-sdk:sign-request");

/** First Autogram version that serves `POST /api/v1/sign`. */
export const SIGN_V1_MIN_APP_VERSION = "2.8.0";

// Defaults of the legacy apiClient.signLegacy() – applied by the migration helpers
// so migrated calls behave exactly like the legacy ones.
const LEGACY_DEFAULT_PAYLOAD_MIME_TYPE = "application/xml";
const LEGACY_DEFAULT_PARAMETERS: LegacySignatureParameters = {
  level: "XAdES_BASELINE_B",
  checkPDFACompliance: true,
};

/**
 * Normalized (wire-shaped) sign request used internally by `DesktopClient`
 * and the signing flow.
 *
 * @internal
 */
export type SignRequest = {
  documents: AutogramDocument[];
  parameters?: SignatureParameters;
  presentation?: PresentationParameters;
};

/** @internal */
export type LegacySignRequest = {
  document: LegacyAutogramDocument;
  parameters: LegacySignatureParameters;
  payloadMimeType: string;
};

type SignatureForm = NonNullable<SignatureParameters["form"]>;
type SignatureProfile = NonNullable<SignatureParameters["profile"]>;
type LegacyLevel = NonNullable<LegacySignatureParameters["level"]>;

const LEGACY_LEVEL_PATTERN = /^(?:(XAdES|PAdES|CAdES)_)?(BASELINE_[BT])$/;

/** Splits a legacy `level` ("XAdES_BASELINE_B", bare "BASELINE_T", ...) into `form` + `profile`. */
export function parseLegacyLevel(level: LegacyLevel | undefined): {
  form?: SignatureForm;
  profile?: SignatureProfile;
} {
  if (level === undefined) return {};
  const match = LEGACY_LEVEL_PATTERN.exec(level);
  if (!match) {
    throw new AutogramError("unknown", `Unsupported signature level: ${level}`);
  }
  const [, form, profile] = match;
  return omitUndefined({
    form: form as SignatureForm | undefined,
    profile: profile as SignatureProfile,
  });
}

/** Joins `form` + `profile` back into a legacy `level`. */
export function formatLegacyLevel(
  form?: SignatureForm | null,
  profile?: SignatureProfile | null
): LegacyLevel | undefined {
  if (form && profile) return `${form}_${profile}`;
  if (form) return `${form}_BASELINE_B`; // v1: profile null means BASELINE_B
  if (profile) return profile;
  return undefined;
}

// Parameters shared 1:1 between legacy and v1 signature parameters.
const SHARED_PARAMETER_KEYS = [
  "container",
  "packaging",
  "digestAlgorithm",
  "en319132",
  "infoCanonicalization",
  "propertiesCanonicalization",
  "keyInfoCanonicalization",
  "checkPDFACompliance",
] as const;

// XDC / eForm parameters that moved from the legacy signature parameters to Document.xdcParameters under the same name.
const SHARED_XDC_KEYS = [
  "autoLoadEform",
  "identifier",
  "containerXmlns",
  "embedUsedSchemas",
  "schema",
  "schemaIdentifier",
  "transformation",
  "transformationIdentifier",
  "transformationLanguage",
  "transformationMediaDestinationTypeDescription",
  "transformationTargetEnvironment",
] as const;

/**
 * Migration helper: splits legacy (`POST /sign`-shaped) signature
 * parameters into their signature, per-document XDC and presentation
 * parts. `null` values are dropped (they mean "default" in both shapes).
 *
 * ```ts
 * const { parameters, xdcParameters, presentation } = fromLegacySignatureParameters(legacy);
 * await client.sign({ ...document, xdcParameters }, parameters, { presentation });
 * ```
 */
export function fromLegacySignatureParameters(
  legacy: LegacySignatureParameters
): {
  parameters: SignatureParameters;
  xdcParameters?: XDCParameters;
  presentation?: PresentationParameters;
} {
  const { form, profile } = parseLegacyLevel(legacy.level ?? undefined);

  const xdcParameters: XDCParameters = omitUndefined({
    ...nullToUndefined(pick(legacy, SHARED_XDC_KEYS)),
    fsFormIdentifier: legacy.fsFormId ?? undefined,
    // schemaMimeType is intentionally not set: when absent, Autogram derives the schema/transformation
    // encoding from document.mimeType, which is exactly what the legacy endpoint does with payloadMimeType.
  });

  return omitUndefined({
    parameters: omitUndefined({
      form,
      profile,
      ...nullToUndefined(pick(legacy, SHARED_PARAMETER_KEYS)),
    }),
    xdcParameters: isEmpty(xdcParameters) ? undefined : xdcParameters,
    presentation:
      legacy.visualizationWidth == null
        ? undefined
        : { visualizationWidth: legacy.visualizationWidth },
  });
}

/**
 * Migration helper: converts the arguments of the removed legacy
 * `sign(document, parameters, payloadMimeType)` call into the arguments of
 * `sign(documents, parameters, { presentation })`. Applies the legacy
 * defaults (`XAdES_BASELINE_B` with PDF/A check, `application/xml`).
 *
 * ```ts
 * const { documents, parameters, presentation } =
 *   fromLegacySignArgs(document, legacyParameters, "application/pdf;base64");
 * const result = await client.sign(documents, parameters, { presentation });
 * ```
 */
export function fromLegacySignArgs(
  document: LegacyAutogramDocument,
  parameters: LegacySignatureParameters = LEGACY_DEFAULT_PARAMETERS,
  payloadMimeType: string = LEGACY_DEFAULT_PAYLOAD_MIME_TYPE
): {
  documents: DocumentToSign[];
  parameters: SignatureParameters;
  presentation?: PresentationParameters;
} {
  const split = fromLegacySignatureParameters(parameters);
  return omitUndefined({
    documents: [
      omitUndefined({
        content: document.content,
        filename: document.filename,
        ...fromPayloadMimeType(payloadMimeType),
        xdcParameters: split.xdcParameters,
      }),
    ],
    parameters: split.parameters,
    presentation: split.presentation,
  });
}

/**
 * Splits a wire `payloadMimeType` (`"application/pdf;base64"`) into
 * {@link DocumentToSign} `mimeType` + `encoding`. Inverse of
 * {@link toPayloadMimeType}.
 */
export function fromPayloadMimeType(payloadMimeType: string): {
  mimeType: string;
  encoding?: "base64";
} {
  const match = /^(.*?)\s*;\s*base64\s*$/i.exec(payloadMimeType);
  return match
    ? { mimeType: match[1], encoding: "base64" }
    : { mimeType: payloadMimeType };
}

// Keys that only exist in the legacy signature parameters. All v1 parameters
// are optional, so TypeScript accepts a legacy-shaped *variable* where v1
// parameters are expected – catch that at runtime instead of silently
// signing without `level`/XDC parameters.
const LEGACY_ONLY_KEYS = ["level", "fsFormId", "visualizationWidth", ...SHARED_XDC_KEYS];

function assertNotLegacyParameters(parameters: object | undefined): void {
  if (!parameters) return;
  const legacyKeys = LEGACY_ONLY_KEYS.filter(
    (key) => (parameters as Record<string, unknown>)[key] !== undefined
  );
  if (legacyKeys.length > 0) {
    throw new AutogramError(
      "unknown",
      `Legacy signature parameters (${legacyKeys.join(", ")}) are not accepted since autogram-sdk 0.7.0; convert them with fromLegacySignatureParameters()`
    );
  }
}

/**
 * Builds the wire request from {@link DocumentToSign}s.
 *
 * @internal
 */
export function toSignRequest(
  documents: DocumentToSign | DocumentToSign[],
  parameters?: SignatureParameters,
  presentation?: PresentationParameters
): SignRequest {
  const list = Array.isArray(documents) ? documents : [documents];
  if (list.length === 0) {
    throw new AutogramError("unknown", "No documents to sign");
  }
  assertNotLegacyParameters(parameters);
  return omitUndefined({
    documents: list.map((document) =>
      omitUndefined({
        filename: document.filename,
        content: document.content,
        mimeType: toPayloadMimeType(document),
        xdcParameters: document.xdcParameters,
      })
    ),
    parameters,
    presentation,
  });
}

/**
 * Converts a request into the legacy `/sign` call shape. Only
 * single-document requests without v1-only safety checks can be expressed
 * in the legacy shape; anything else throws a `not-supported` error.
 *
 * @internal
 */
export function signRequestToLegacy(request: SignRequest): LegacySignRequest {
  if (request.documents.length !== 1) {
    throw new AutogramError(
      request.documents.length === 0 ? "unknown" : "not-supported",
      `Legacy /sign endpoint supports exactly one document, got ${request.documents.length}`
    );
  }
  const [document] = request.documents;
  const params = request.parameters ?? {};
  const xdc = document.xdcParameters ?? {};

  const unsupported = unsupportedLegacyParameters(request.parameters);
  if (unsupported.length > 0) {
    // These are opt-in safety checks – silently signing without them would be worse than failing.
    throw new AutogramError(
      "not-supported",
      `Signature parameters ${unsupported.join(", ")} require Autogram ${SIGN_V1_MIN_APP_VERSION} or newer and are not supported by Autogram v mobile`
    );
  }
  if (
    xdc.schemaMimeType !== undefined &&
    isBase64MimeType(xdc.schemaMimeType) !== isBase64MimeType(document.mimeType)
  ) {
    log.warn(
      "schemaMimeType encoding differs from document mimeType; Autogram < 2.8.0 always uses the document encoding for schema and transformation"
    );
  }

  const parameters: LegacySignatureParameters = omitUndefined({
    level: formatLegacyLevel(params.form, params.profile),
    ...nullToUndefined(pick(params, SHARED_PARAMETER_KEYS)),
    ...nullToUndefined(pick(xdc, SHARED_XDC_KEYS)),
    fsFormId: xdc.fsFormIdentifier ?? undefined,
    visualizationWidth: request.presentation?.visualizationWidth ?? undefined,
  });

  return {
    document: omitUndefined({ filename: document.filename, content: document.content }),
    parameters,
    payloadMimeType: document.mimeType,
  };
}

/**
 * Signature parameters that only `/api/v1/sign` (Autogram >= 2.8.0) can
 * fulfil. Only enabled checks are reported – passing them as `false`
 * matches the legacy behaviour anyway.
 *
 * @internal
 */
export function unsupportedLegacyParameters(
  parameters: SignatureParameters | undefined
): string[] {
  const unsupported: string[] = [];
  if (parameters?.requireQualifiedCertificate) unsupported.push("requireQualifiedCertificate");
  if (parameters?.checkPDFEmbeddedAttachments) unsupported.push("checkPDFEmbeddedAttachments");
  return unsupported;
}

/** Compares dotted numeric versions; missing or non-numeric segments (e.g. "0-beta") count as their numeric prefix or 0. */
export function versionSatisfies(version: string, requiredVersion: string): boolean {
  const toSegments = (v: string) => v.split(".").map((part) => parseInt(part, 10) || 0);
  const actual = toSegments(version);
  const required = toSegments(requiredVersion);
  for (let i = 0; i < Math.max(actual.length, required.length); i++) {
    const a = actual[i] ?? 0;
    const r = required[i] ?? 0;
    if (a !== r) return a > r;
  }
  return true;
}

/** Whether the running Autogram serves `/api/v1/sign`. Dev builds are assumed to be current. */
export function supportsSignV1(version: string | undefined): boolean {
  if (version === undefined) return false;
  if (version === "dev") return true;
  return versionSatisfies(version, SIGN_V1_MIN_APP_VERSION);
}

function isBase64MimeType(mimeType: string): boolean {
  return mimeType.toLowerCase().includes("base64");
}

function pick<T extends object, K extends keyof T>(obj: T, keys: readonly K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const key of keys) if (key in obj) out[key] = obj[key];
  return out;
}

function omitUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as T;
}

function nullToUndefined<T extends object>(obj: T): { [K in keyof T]: Exclude<T[K], null> } {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, value === null ? undefined : value])
  ) as { [K in keyof T]: Exclude<T[K], null> };
}

function isEmpty(obj: object): boolean {
  return Object.keys(obj).length === 0;
}
