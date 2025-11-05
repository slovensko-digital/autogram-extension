import {
  DesktopAutogramDocument,
  DesktopSignatureParameters,
} from "autogram-sdk";

export interface ObjectStrategy {
  document: DesktopAutogramDocument;
  objSchema: string | undefined;
  objTransformation: string | undefined;
  identifier: DesktopSignatureParameters["identifier"];
  formVersion: string;
  schemaIdentifier: string;
  transformationIdentifier: string;
  transformationMediaDestinationTypeDescription: DesktopSignatureParameters["transformationMediaDestinationTypeDescription"];
  transformationLanguage: string;
  transformationTargetEnvironment: string;
  /**
   * If references to XSD and XSLT should be used instead of embedding inside XDC
   */
  includeRefs: boolean;
  /**
   * Type of payload for Autogram (Autogram input)
   */
  payloadMimeType: `${string}/${string}${";base64" | ""}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class EmptyStrategy implements ObjectStrategy {
  get document(): DesktopAutogramDocument {
    return { content: "", filename: "" };
  }
  get objSchema(): string | undefined {
    return undefined;
  }
  get objTransformation(): string | undefined {
    return undefined;
  }
  get formVersion() {
    return "";
  }
  get objectId() {
    return "";
  }
  get identifier() {
    return "";
  }
  get schemaIdentifier() {
    return "";
  }
  get transformationIdentifier() {
    return "";
  }
  get transformationMediaDestinationTypeDescription() {
    return undefined;
  }
  get transformationLanguage() {
    return "";
  }
  get transformationTargetEnvironment() {
    return "";
  }
  get includeRefs() {
    return true;
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
