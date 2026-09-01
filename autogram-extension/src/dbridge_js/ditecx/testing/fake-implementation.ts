import {
  DesktopSignatureParameters,
  DocumentToSign,
} from "autogram-sdk";
import { Base64 } from "js-base64";
import { ImplementationInterface } from "../implementation";
import { SignRequest, SigningStatus } from "../sign-request";
import { InputObject } from "../types";
import { DSIGNER_VERSION_JSON } from "../dsigner-version";

/**
 * Test double for the signer backend that mirrors `DBridgeAutogramImpl`
 * but stops at the SDK-client boundary: it drives the real
 * {@link SignRequest} (object bookkeeping, file-type strategies, signature
 * parameter derivation) and returns canned signature content instead of
 * talking to Autogram/AVM.
 *
 * Used by the portal contract tests to replay real portal driver scripts
 * against the full adapter + sign-request stack.
 */
export class FakeImplementation implements ImplementationInterface {
  /** Base64 content returned from a successful getSignature. */
  public signatureContent = Base64.encode("<fake-signed-container/>");
  /** When set, the next getSignature call rejects with this error. */
  public nextSignError: unknown = null;
  public signerIdentification = "CN=Testovací Používateľ, C=SK";

  /** Derived DesktopSignatureParameters of the last getSignature call. */
  public lastParameters: DesktopSignatureParameters | null = null;
  /** Unified document passed to signing on the last getSignature call. */
  public lastDocument: DocumentToSign | null = null;
  public languages: string[] = [];

  private signRequest = new SignRequest();

  async launch(): Promise<void> {}

  setLanguage(language: string): void {
    this.languages.push(language);
  }

  async sign(
    signatureId: string,
    digestAlgUri: string,
    signaturePolicyIdentifier: string
  ): Promise<void> {
    this.signRequest.signatureId = signatureId;
    this.signRequest.digestAlgUri = digestAlgUri;
    this.signRequest.signaturePolicyIdentifier = signaturePolicyIdentifier;
    this.signRequest.signingStatus = SigningStatus.started;
  }

  addObject(obj: InputObject): void {
    if (this.signRequest.signingStatus == SigningStatus.signed) {
      this.signRequest = new SignRequest();
    }
    this.signRequest.addObject(obj);
  }

  async getSignature(
    parameters: Partial<DesktopSignatureParameters>,
    decodeBase64 = false
  ): Promise<string> {
    if (this.nextSignError) {
      const error = this.nextSignError;
      this.nextSignError = null;
      throw error;
    }
    this.lastParameters = this.signRequest.signatureParameters(parameters);
    this.lastDocument = this.signRequest.documentToSign;
    this.signRequest.signingStatus = SigningStatus.signed;
    return decodeBase64
      ? Base64.decode(this.signatureContent)
      : this.signatureContent;
  }

  getSignerIdentification(): string {
    return this.signerIdentification;
  }

  getOriginalObject(): InputObject {
    return this.signRequest.object;
  }

  getVersion(): string {
    return DSIGNER_VERSION_JSON;
  }
}
