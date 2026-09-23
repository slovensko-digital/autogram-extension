/*
 * Conversion between the legacy `POST /sign` request shape and the `POST /api/v1/sign`
 * request shape (Autogram >= 2.8.0), plus the version helpers used to pick the endpoint.
 *
 * Pure module: no DOM, no fetch, so it can be unit tested under Node.
 */
import type {
  AutogramDocument,
  SignatureParameters,
  SignV1Document,
  SignV1PresentationParameters,
  SignV1SignatureParameters,
  SignV1XDCParameters,
} from "./autogram-api/index";
// type-only, erased at compile time – no runtime import cycle with desktop-client
import type { DesktopSignOptions } from "./desktop-client";
import { AutogramSdkException } from "./errors";
import { createLogger } from "./log";

const log = createLogger("sign-request");

/** First Autogram version that serves `POST /api/v1/sign`. */
export const SIGN_V1_MIN_APP_VERSION = "2.8.0";

// Defaults of the legacy apiClient.sign() – applied here so both routes behave the same.
export const DEFAULT_PAYLOAD_MIME_TYPE = "application/xml";
export const LEGACY_DEFAULT_PARAMETERS: SignatureParameters = {
  level: "XAdES_BASELINE_B",
  checkPDFACompliance: true,
};

/** Normalized (v1-shaped) sign request used internally by DesktopClient / CombinedClient. */
export type SignRequest = {
  documents: SignV1Document[];
  parameters?: SignV1SignatureParameters;
  presentation?: SignV1PresentationParameters;
};

export type LegacySignRequest = {
  document: AutogramDocument;
  parameters: SignatureParameters;
  payloadMimeType: string;
};

type SignatureForm = NonNullable<SignV1SignatureParameters["form"]>;
type SignatureProfile = NonNullable<SignV1SignatureParameters["profile"]>;
type LegacyLevel = NonNullable<SignatureParameters["level"]>;

const LEGACY_LEVEL_PATTERN = /^(?:(XAdES|PAdES|CAdES)_)?(BASELINE_[BT])$/;

/** Splits a legacy `level` ("XAdES_BASELINE_B", bare "BASELINE_T", ...) into v1 `form` + `profile`. */
export function parseLegacyLevel(level: LegacyLevel | undefined): {
  form?: SignatureForm;
  profile?: SignatureProfile;
} {
  if (level === undefined) return {};
  const match = LEGACY_LEVEL_PATTERN.exec(level);
  if (!match) throw new AutogramSdkException(`Unsupported signature level: ${level}`);
  const [, form, profile] = match;
  return omitUndefined({
    form: form as SignatureForm | undefined,
    profile: profile as SignatureProfile,
  });
}

/** Joins v1 `form` + `profile` back into a legacy `level`. */
export function formatLegacyLevel(
  form?: SignatureForm | null,
  profile?: SignatureProfile | null
): LegacyLevel | undefined {
  if (form && profile) return `${form}_${profile}`;
  if (form) return `${form}_BASELINE_B`; // v1: profile null means BASELINE_B
  if (profile) return profile;
  return undefined;
}

// Parameters shared 1:1 between legacy SignatureParameters and v1 SignatureParameters.
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

// XDC / eForm parameters that moved from legacy SignatureParameters to v1 Document.xdcParameters under the same name.
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

/** Converts a legacy `/sign` call into the v1 request shape. */
export function legacyToSignRequest(
  document: AutogramDocument,
  parameters: SignatureParameters = LEGACY_DEFAULT_PARAMETERS,
  payloadMimeType: string = DEFAULT_PAYLOAD_MIME_TYPE
): SignRequest {
  const { form, profile } = parseLegacyLevel(parameters.level);

  const xdcParameters: SignV1XDCParameters = omitUndefined({
    ...pick(parameters, SHARED_XDC_KEYS),
    fsFormIdentifier: parameters.fsFormId,
    // schemaMimeType is intentionally not set: when absent, Autogram derives the schema/transformation
    // encoding from document.mimeType, which is exactly what the legacy endpoint does with payloadMimeType.
  });

  const signV1Parameters: SignV1SignatureParameters = omitUndefined({
    form,
    profile,
    ...pick(parameters, SHARED_PARAMETER_KEYS),
  });

  return omitUndefined({
    documents: [
      omitUndefined({
        filename: document.filename,
        content: document.content,
        mimeType: payloadMimeType,
        xdcParameters: isEmpty(xdcParameters) ? undefined : xdcParameters,
      }),
    ],
    parameters: signV1Parameters,
    presentation:
      parameters.visualizationWidth === undefined
        ? undefined
        : { visualizationWidth: parameters.visualizationWidth },
  });
}

/**
 * Converts a v1 request into the legacy `/sign` call shape. Only single-document requests
 * can be expressed in the legacy shape.
 */
export function signRequestToLegacy(request: SignRequest): LegacySignRequest {
  if (request.documents.length !== 1) {
    throw new AutogramSdkException(
      `Legacy /sign endpoint supports exactly one document, got ${request.documents.length}`
    );
  }
  const [document] = request.documents;
  const params = request.parameters ?? {};
  const xdc = document.xdcParameters ?? {};

  const unsupported = unsupportedLegacyParameters(request.parameters);
  if (unsupported.length > 0) {
    // These are opt-in safety checks – silently signing without them would be worse than failing.
    throw new AutogramSdkException(
      `Signature parameters ${unsupported.join(", ")} require Autogram ${SIGN_V1_MIN_APP_VERSION} or newer and are not supported by Autogram v mobile`
    );
  }
  if (
    xdc.schemaMimeType !== undefined &&
    isBase64MimeType(xdc.schemaMimeType) !== isBase64MimeType(document.mimeType)
  )
    log.warn(
      "schemaMimeType encoding differs from document mimeType; Autogram < 2.8.0 always uses the document encoding for schema and transformation"
    );

  const parameters: SignatureParameters = omitUndefined({
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
 * Signature parameters that only `/api/v1/sign` (Autogram >= 2.8.0) can fulfil. Only enabled
 * checks are reported – passing them as `false` matches the legacy behaviour anyway.
 */
export function unsupportedLegacyParameters(
  parameters: SignV1SignatureParameters | undefined
): string[] {
  const unsupported: string[] = [];
  if (parameters?.requireQualifiedCertificate) unsupported.push("requireQualifiedCertificate");
  if (parameters?.checkPDFEmbeddedAttachments) unsupported.push("checkPDFEmbeddedAttachments");
  return unsupported;
}

/** Legacy documents have no `mimeType`; v1 documents require it. */
export function isLegacyDocument(x: unknown): x is AutogramDocument {
  return typeof x === "object" && x !== null && !Array.isArray(x) && !("mimeType" in x);
}

/**
 * Resolves the overloaded `sign()` arguments of DesktopClient into a normalized request.
 * Legacy shape: (document, parameters?, payloadMimeType?, options?); v1 shape: (documents, parameters?, options?).
 */
export function normalizeSignArgs<Options extends DesktopSignOptions>(
  first: SignV1Document | SignV1Document[] | AutogramDocument,
  second?: SignV1SignatureParameters | SignatureParameters,
  third?: string | Options,
  fourth?: Options
): { request: SignRequest; options?: Options; legacy: boolean } {
  if (isLegacyDocument(first)) {
    const payloadMimeType = typeof third === "string" ? third : undefined;
    const options = typeof third === "object" ? third : fourth;
    return {
      request: legacyToSignRequest(first, second as SignatureParameters | undefined, payloadMimeType),
      options,
      legacy: true,
    };
  }

  const documents = Array.isArray(first) ? first : [first];
  if (documents.length === 0) throw new AutogramSdkException("No documents to sign");
  const options = third as Options | undefined;
  return {
    request: omitUndefined({
      documents,
      parameters: second as SignV1SignatureParameters | undefined,
      presentation: options?.presentation,
    }),
    options,
    legacy: false,
  };
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
