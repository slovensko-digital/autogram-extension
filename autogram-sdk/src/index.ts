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
  SignResponseBody as DesktopSignResponseBody, // TODO we could unify SignResponseBody from desktop and SignedDocument from avm
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
} from "./errors";

export { DesktopClient } from "./desktop-client";
export type { DesktopSignOptions } from "./desktop-client";
