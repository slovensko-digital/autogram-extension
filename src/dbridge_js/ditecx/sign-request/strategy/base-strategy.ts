import { Document } from "@octosign/client";

export interface ObjectStrategy {
  document: Document;
  objectId: string;
  objSchema: string;
  objTransformation: string;
  identifier: string;
  formVersion: string;
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
