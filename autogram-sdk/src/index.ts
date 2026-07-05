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
  BatchStartResponseBody as DesktopBatchStartResponseBody,
  BatchEndResponseBody as DesktopBatchEndResponseBody,
  ServerInfo as DesktopServerInfo,
  DesktopSigningState,
  DesktopSigningStateConsumer,
} from "./autogram-api/index";

/* Autogram V Mobile */
export {
  AutogramVMobileIntegration,
  AutogramVMobileClientApiClient,
  randomUUID,
  GetDocumentsResponse as AVMGetDocumentsResponse,
  createDeviceJwt,
} from "./avm-api/index";

export type {
  AutogramVMobileIntegrationInterfaceStateful,
  SignedDocument as AVMSignedDocument,
  DocumentToSign as AVMDocumentToSign,
  AvmIntegrationDocument as AVMIntegrationDocument,
  DeviceRegistrationResponse as AVMDeviceRegistrationResponse,
  DeviceIntegrationsResponse as AVMDeviceIntegrationsResponse,
  DocumentVisualizationResponse as AVMDocumentVisualizationResponse,
  DocumentDataToSignResponse as AVMDocumentDataToSignResponse,
  DocumentSignResponse as AVMDocumentSignResponse,
} from "./avm-api/index";
export { AutogramVMobileSimulation } from "./avm-api/index";

export {
  AutogramError,
  UserCancelledSigningException,
  AutogramSdkException,
  AutogramAppNotInstalledException,
} from "./errors";
export type { AutogramErrorCode, SerializedAutogramError } from "./errors";

export type { SignedObject } from "./types";
export { SigningMethod } from "./types";

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

export {
  defineRpcService,
  createRpcClient,
  createRpcHandler,
  serializeRpcError,
  ZRpcRequestFrame,
  ZRpcAbortFrame,
  ZRpcCallerFrame,
  ZRpcResponseFrame,
} from "./rpc";
export type {
  RpcMethodDef,
  RpcMethods,
  RpcServiceDef,
  RpcClient,
  RpcClientTransport,
  RpcContext,
  RpcImpl,
  RpcHandler,
  RpcRequestFrame,
  RpcAbortFrame,
  RpcCallerFrame,
  RpcResponseFrame,
} from "./rpc";
