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
export { CombinedClient, createAutogramClient } from "./with-ui";
export type { AutogramClientOptions } from "./with-ui";
export { SigningMethod } from "./types";
export type { SignedObject } from "./types";
