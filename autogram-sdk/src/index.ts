/**
 * @module autogram-index
 */

/* Autogram Desktop */
export {
  apiClient as desktopApiClient,
  ZServerInfo as ZDesktopServerInfo,
  ZSignedObject,
  ZSignResponseBody as ZDesktopSignResponseBody,
  ZLegacyAutogramDocument as ZDesktopLegacyAutogramDocument,
  ZLegacySignatureParameters as ZDesktopLegacySignatureParameters,
  ZSignRequestBody as ZDesktopSignRequestBody,
  ZBatchStartResponseBody as ZDesktopBatchStartResponseBody,
  ZBatchEndResponseBody as ZDesktopBatchEndResponseBody,
} from "./autogram-api/index";

export type {
  AutogramDesktopIntegrationInterface,
  SignatureParameters as DesktopSignatureParameters,
  AutogramDocument as DesktopAutogramDocument,
  XDCParameters as DesktopXDCParameters,
  PresentationParameters as DesktopPresentationParameters,
  SignRequestBody as DesktopSignRequestBody,
  LegacySignatureParameters as DesktopLegacySignatureParameters,
  LegacyAutogramDocument as DesktopLegacyAutogramDocument,
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
  ZDocumentToSign as ZAVMDocumentToSign,
  GetIntegrationDevicesResponseBody as ZAVMPairedDevices,
  createDeviceJwt,
} from "./avm-api/index";

export type {
  AutogramVMobileIntegrationInterfaceStateful,
  SignedDocument as AVMSignedDocument,
  DocumentToSign as AVMDocumentToSign,
  AvmIntegrationDocument as AVMIntegrationDocument,
  DBInterface as AVMStorage,
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
  AutogramAppVersionTooLowException,
  MultiDocumentSigningOnMobileException,
} from "./errors";
export type { AutogramErrorCode, SerializedAutogramError } from "./errors";

export type {
  SignedObject,
  DocumentToSign,
  SignedDocumentResult,
  SignatureInfo,
} from "./types";
export {
  SigningMethod,
  toPayloadMimeType,
  fromDesktopResponse,
  fromAvmSignedDocument,
  toLegacySignedObject,
} from "./types";

export {
  SIGN_V1_MIN_APP_VERSION,
  fromLegacySignArgs,
  fromLegacySignatureParameters,
  fromPayloadMimeType,
} from "./sign-request";

export { DesktopClient } from "./desktop-client";
export type { DesktopSignOptions } from "./desktop-client";

export { AvmSimpleChannel } from "./channel-avm";
export type { AvmSimpleChannelOptions } from "./channel-avm";

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
