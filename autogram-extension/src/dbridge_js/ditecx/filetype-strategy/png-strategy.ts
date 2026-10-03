import { ObjectStrategy, PayloadMimeTypeStr } from "./base-strategy";

import { ObjectXadesBpPng } from "../types";
import {
  DesktopLegacyAutogramDocument,
  DesktopLegacySignatureParameters,
} from "autogram-sdk";

export class XadesBpPngStrategy implements ObjectStrategy {
  obj: ObjectXadesBpPng;
  constructor(object: ObjectXadesBpPng) {
    this.obj = object;
  }
  schemaIdentifier: string;
  transformationIdentifier: string;
  transformationMediaDestinationTypeDescription: DesktopLegacySignatureParameters["transformationMediaDestinationTypeDescription"];
  transformationLanguage: string;
  transformationTargetEnvironment: string;
  includeRefs: boolean;

  get document(): DesktopLegacyAutogramDocument {
    return {
      content: this.obj.sourcePngBase64,
      filename: this.obj.objectId,
    };
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
    return "image/png;base64";
  }
}
