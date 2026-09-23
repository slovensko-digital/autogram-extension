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
  SignV1Document as DesktopSignV1Document,
  SignV1XDCParameters as DesktopSignV1XDCParameters,
  SignV1SignatureParameters as DesktopSignV1SignatureParameters,
  SignV1PresentationParameters as DesktopSignV1PresentationParameters,
  SignV1RequestBody as DesktopSignV1RequestBody,
  SignResponseBody as DesktopSignResponseBody, // TODO we could unify SignResponseBody from desktop and SignedDocument from avm
  BatchStartResponseBody as DesktopBatchStartResponseBody,
  BatchEndResponseBody as DesktopBatchEndResponseBody,
  ServerInfo as DesktopServerInfo,
  DesktopSigningState,
  DesktopSigningStateConsumer,
} from "./autogram-api/index";

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

export {
  UserCancelledSigningException,
  AutogramSdkException,
  AutogramAppNotInstalledException,
  AutogramAppVersionTooLowException,
  MultiDocumentSigningOnMobileException,
} from "./errors";
export {
  legacyToSignRequest,
  signRequestToLegacy,
  type SignRequest,
} from "./sign-request";

export { DesktopClient } from "./desktop-client";
export type { DesktopSignOptions } from "./desktop-client";
