import { SignatureParameters } from "../../../autogram-api";
import { AutogramDocument } from "../../../client";

export interface ObjectStrategy {
  document: AutogramDocument;
  objSchema: string;
  objTransformation: string;
  identifier: SignatureParameters["identifier"];
  formVersion: string;
  schemaIdentifier: string;
  transformationIdentifier: string;
  transformationMediaDestinationTypeDescription: SignatureParameters["transformationMediaDestinationTypeDescription"];
  transformationLanguage: string;
  transformationTargetEnvironment: string;
  /**
   * Type of payload for Autogram (Autogram input)
   */
  payloadMimeType:  `${string}/${string}${";base64" | ""}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class EmptyStrategy implements ObjectStrategy {
  get document(): AutogramDocument {
    return { content: "", filename: "" };
  }
  get objSchema(): string {
    return null;
  }
  get objTransformation(): string {
    return null;
  }
  get formVersion() {
    return null;
  }
  get objectId() {
    return null;
  }
  get identifier() {
    return null;
  }
  get schemaIdentifier() {
    return null;
  }
  get transformationIdentifier() {
    return null;
  }
  get transformationMediaDestinationTypeDescription() {
    return null;
  }
  get transformationLanguage() {
    return null;
  }
  get transformationTargetEnvironment() {
    return null;
  }
  get payloadMimeType(): PayloadMimeTypeStr {
    return "*/*";
  }
}

export type PayloadMimeTypeStr =
  | "application/xml"
  | "application/xml;base64"
  | "application/vnd.gov.sk.xmldatacontainer+xml;base64"
  | "image/png;base64"
  | "application/pdf"
  | "application/pdf;base64"
  | "text/plain"
  | "text/plain;base64"
  | "*/*";
