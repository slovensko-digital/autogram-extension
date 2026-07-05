/**
 * @module autogram-index
 */

/* Autogram Desktop */
export {
  apiClient as desktopApiClient,
} from "./autogram-api/index";

export type {
  AutogramDesktopIntegrationInterface,
  SignatureParameters as DesktopSignatureParameters,
  AutogramDocument as DesktopAutogramDocument,
  SignResponseBody as DesktopSignResponseBody,
  BatchStartResponseBody as DesktopBatchStartResponseBody,
  BatchEndResponseBody as DesktopBatchEndResponseBody,
  ServerInfo as DesktopServerInfo,
  DesktopSigningState,
  DesktopSigningStateConsumer,
} from "./autogram-api/index";

export {
  AutogramError,
  UserCancelledSigningException,
  AutogramSdkException,
  AutogramAppNotInstalledException,
} from "./errors";
export type { AutogramErrorCode, SerializedAutogramError } from "./errors";

export { DesktopClient } from "./desktop-client";
export type { DesktopSignOptions } from "./desktop-client";

export {
  MobileClient,
  SignatureRequest,
  RestorePointStore,
  toSignedObject,
} from "./mobile";
export type {
  RequestToken,
  PairedDevice,
  SignatureRequestStatus,
  RestorePointResult,
  MobileIntegrationBackend,
} from "./mobile";

/* Autogram V Mobile */
export {
  AutogramVMobileIntegration,
  randomUUID,
  GetDocumentsResponse as AVMGetDocumentsResponse,
} from "./avm-api/index";

export type {
  AutogramVMobileIntegrationInterfaceStateful,
  SignedDocument as AVMSignedDocument,
  DocumentToSign as AVMDocumentToSign,
  AvmIntegrationDocument as AVMIntegrationDocument,
} from "./avm-api/index";
export { AutogramVMobileSimulation } from "./avm-api/index";
export { CombinedClient } from "./with-ui";
export type { SignedObject } from "./types";
