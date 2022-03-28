import { Document } from "@octosign/client";

export interface ObjectStrategy {
  document: Document;
  /**
   * Type of returned file from Autogram (Autogram output)
   */
  fileMimeType: FileMimeTypeStr;
  objectId: string;
  objSchema: string;
  objTransformation: string;
  /**
   * Visualization payload type
   */
  objTransformationOutputMimeType: string | "text/html" | "text/plain";
  identifier: string;
  formVersion: string;
  /**
   * Type of payload for Autogram (Autogram input)
   */
  payloadMimeType: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class EmptyStrategy implements ObjectStrategy {
  get document(): Document {
    return { content: "" };
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
  get payloadMimeType(): PayloadMimeTypeStr {
    return "*/*";
  }
  get fileMimeType() {
    return null;
  }
  get objTransformationOutputMimeType() {
    return null;
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
  | "*/*";

export type FileMimeTypeStr =
  | "application/xml"
  | "application/vnd.gov.sk.xmldatacontainer+xml"
  | "application/lor.ip.xmldatacontainer+xml"
  | "image/png"
  | "image/png"
  | "application/pdf"
  | "text/plain";
