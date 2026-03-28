import { ObjectStrategy, PayloadMimeTypeStr } from "./base-strategy";
import { ObjectXadesPdf } from "../types";
import { DesktopAutogramDocument, DesktopSignatureParameters } from "autogram-sdk";

export class XadesPdfStrategy implements ObjectStrategy {
  obj: ObjectXadesPdf;
  constructor(object: ObjectXadesPdf) {
    this.obj = object;
  }
  schemaIdentifier: string;
  transformationIdentifier: string;
  transformationMediaDestinationTypeDescription: DesktopSignatureParameters["transformationMediaDestinationTypeDescription"];
  transformationLanguage: string;
  transformationTargetEnvironment: string;
  includeRefs: boolean;

  get document(): DesktopAutogramDocument {
    return { content: this.obj.sourcePdfBase64, filename: this.obj.objectId };
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
    return this.obj.objectId;
  }
  get identifier() {
    return this.obj.objectFormatIdentifier;
  }
  get payloadMimeType(): PayloadMimeTypeStr {
    return "application/pdf;base64";
  }
}
