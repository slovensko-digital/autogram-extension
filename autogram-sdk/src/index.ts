/**
 * @module autogram-index
 */

/* Autogram Desktop */
export {
  AutogramDesktopIntegrationInterface,
  apiClient as desktopApiClient,
  SignatureParameters as DesktopSignatureParameters,
  AutogramDocument as DesktopAutogramDocument,
  SignResponseBody as DesktopSignResponseBody, // TODO we could unify SignResponseBody from desktop and SignedDocument from avm
  ServerInfo as DesktopServerInfo,
} from "./autogram-api/index";

/* Autogram V Mobile */
export {
  AutogramVMobileIntegration,
  AutogramVMobileIntegrationInterfaceStateful,
  randomUUID,
  SignedDocument as AVMSignedDocument,
  GetDocumentsResponse as AVMGetDocumentsResponse,
  DocumentToSign as AVMDocumentToSign,
  AvmIntegrationDocument as AVMIntegrationDocument,
} from "./avm-api/index";
export { AutogramVMobileSimulation } from "./avm-api/index";

export { UserCancelledSigningException, AutogramSdkException } from "./errors";
