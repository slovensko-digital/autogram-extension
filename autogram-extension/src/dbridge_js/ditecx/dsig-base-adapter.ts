/* eslint-disable prefer-rest-params */
/* eslint-disable @typescript-eslint/no-empty-function */

import { DesktopSignatureParameters } from "autogram-sdk";
import { createLogger } from "../../log";
import { DitecCallback, ImplementationInterface } from "./implementation";
import {
  createDitecError,
  DitecErrorCodes,
  InputObject,
  toDitecError,
} from "./types";

const log = createLogger("ag-ext.dsig-base-adapter");

/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Base Class that has same interface as DSig* objects used by dSigner
 * (eg. dSigXadesAdapter, dSigXadesBpAdapter)
 *
 * internally uses __implementation to call methods on the actual
 * implementation. This class is also the single edge where the
 * promise-based {@link ImplementationInterface} is adapted back to the
 * Ditec `{onSuccess, onError}` convention (see {@link resolve}).
 */
export class DSigAdapter {
  /**
   * Load-bearing for financnasprava.sk: their `Podanie.Sign` checks
   * `ditec.dSig*Js._ready` and skips `detectSupportedPlatforms()` +
   * `deploy()` entirely when truthy. Do not remove.
   */
  _ready = true;

  // Constants
  SHA1 = "http://www.w3.org/2000/09/xmldsig#sha1";
  SHA256 = "http://www.w3.org/2001/04/xmlenc#sha256";
  SHA384 = "http://www.w3.org/2001/04/xmldsig-more#sha384";
  SHA512 = "http://www.w3.org/2001/04/xmlenc#sha512";
  LANG_SK = "SK";
  LANG_EN = "EN";
  XML_VISUAL_TRANSFORM_TXT = "TXT";
  XML_VISUAL_TRANSFORM_HTML = "HTML";
  PDF_CONFORMANCE_LEVEL_1A = 0;
  PDF_CONFORMANCE_LEVEL_1B = 1;
  PDF_CONFORMANCE_LEVEL_NONE = 2;
  ERROR_SIGNING_CANCELLED = 1;

  protected __implementation: ImplementationInterface;

  constructor(implementation: ImplementationInterface) {
    this.__implementation = implementation;
  }

  /**
   * Runs `work` and fulfils a Ditec-style callback from its result: a
   * resolved value goes to `onSuccess`, any rejection (or synchronous
   * throw) is mapped to a Ditec error object and goes to `onError`.
   *
   * Wrapping `work` in `Promise.resolve().then(...)` means even a
   * synchronous throw inside `work` reaches `onError` instead of being
   * lost — swallowed-error bugs become hard to write.
   */
  protected resolve<T>(
    work: () => Promise<T> | T,
    callback: DitecCallback<T>
  ): void {
    Promise.resolve()
      .then(work)
      .then(
        (value) => callback.onSuccess(value),
        (error) => {
          log.error("implementation call failed", error);
          callback.onError?.(toDitecError(error));
        }
      );
  }

  /** Shimmed entry point used by the concrete `add*Object` methods. */
  protected addObject(obj: InputObject, callback: DitecCallback): void {
    this.resolve(() => this.__implementation.addObject(obj), callback);
  }

  /** Shimmed entry point used by the concrete `getSigned*` methods. */
  protected getSignature(
    parameters: Partial<DesktopSignatureParameters>,
    callback: DitecCallback<string>,
    decodeBase64 = false
  ): void {
    this.resolve(
      () => this.__implementation.getSignature(parameters, decodeBase64),
      callback
    );
  }

  initialize(callback: DitecCallback): void {
    this.log("initalize", arguments);
    this.resolve(() => this.__implementation.launch(), callback);
  }

  /**
   * Real D.Bridge inherits `deploy` from `AbstractJsCore` on every
   * component, and portals call it before anything else (e.g.
   * schranka.slovensko.sk calls it on both `dSigXadesJs` and
   * `dSigXadesBpJs`). The app launches lazily, so deployment is a no-op.
   */
  deploy(options: unknown, callback: DitecCallback): void {
    this.log("deploy", arguments);
    callback.onSuccess();
  }

  deployCancel(callback: DitecCallback): void {
    this.log("deployCancel", arguments);
    callback.onSuccess();
  }

  sign(signatureId, digestAlgUri, signaturePolicyIdentifier, callback): void {
    this.log("sign", arguments);
    this.resolve(
      () =>
        this.__implementation.sign(
          signatureId,
          digestAlgUri,
          signaturePolicyIdentifier
        ),
      callback
    );
  }

  setLanguage(language, callback) {
    this.log("setLanguage", arguments);
    this.__implementation.setLanguage(language);
    // Portals call this both with and without a callback (financnasprava.sk
    // passes none); the real API completes via onSuccess when one is given.
    callback?.onSuccess?.();
  }

  /**
   * Autogram itself restricts selection to qualified signing certificates,
   * so the portal-supplied filter is acknowledged and ignored.
   */
  setCertificateFilter(filterID, callback) {
    this.log("setCertificateFilter", arguments);
    callback?.onSuccess?.();
  }

  log(...rest: unknown[]): void {
    log.debug(this.constructor.name, ...rest);
  }

  stub(name: string, ...rest: unknown[]): void {
    this.log(name, ...rest);
    // alert(`Stubbed ${this.constructor.name} method: \n\n${name}`);
    console.warn(`Stubbed ${this.constructor.name} method: \n\n${name}`);
  }

  /**
   * Fails an unimplemented method the Ditec way. Portal code serializes
   * all calls on the callback ("no other operation until the callback
   * fires" per the integration guide), so a method that never calls back
   * hangs the portal's signing flow — erroring out is the only safe
   * behavior for functionality Autogram does not provide.
   */
  unsupported(name: string, callback: DitecCallback | undefined): void {
    this.stub(name);
    callback?.onError?.(
      createDitecError(
        DitecErrorCodes.ERROR_GENERAL,
        `Funkcia ${name} nie je podporovaná rozšírením Autogram.`
      )
    );
  }

  checkPDFACompliance(sourcePdfBase64, password, reqLevel, callback) {
    this.stub("checkPDFACompliance", arguments);
    callback.onSuccess();
    // callback.onError();
  }
  convertToPDFA(sourcePdfBase64, password, reqLevel, callback) {
    this.stub("convertToPDFA", arguments);
    callback.onSuccess();
  }
  getConvertedPDFA(callback) {
    this.stub("getConvertedPDFA", arguments);
    this.resolve(() => this.__implementation.getOriginalObject(), callback);
  }

  getVersion(callback) {
    this.log("getVersion", arguments);
    this.resolve(() => this.__implementation.getVersion(), callback);
  }

  getSignerIdentification(callback) {
    this.log("getSignerIdentification", arguments);
    this.resolve(() => this.__implementation.getSignerIdentification(), callback);
  }

  detectSupportedPlatforms(platforms, callback) {
    this.log({ platforms });

    // callback.onSuccess(["autogram"]);
    callback.onSuccess(["java"]);
  }
}
