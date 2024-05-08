import {
  ObjectStrategy,
  PayloadMimeTypeStr,
} from "./base-strategy";
import { AutogramDocument } from "../../../client";
import { ObjectXadesBpPng } from "../types";
import { SignatureParameters } from "../../../autogram-api";

export class XadesBpPngStrategy implements ObjectStrategy {
  obj: ObjectXadesBpPng;
  constructor(object: ObjectXadesBpPng) {
    this.obj = object;
  }
  schemaIdentifier: string;
  transformationIdentifier: string;
  transformationMediaDestinationTypeDescription: SignatureParameters["transformationMediaDestinationTypeDescription"];
  transformationLanguage: string;
  transformationTargetEnvironment: string;

  get document(): AutogramDocument {
    return {
      content: this.obj.sourcePngBase64,
      filename: this.obj.objectId,
    };
  }
  get objSchema(): string {
    return "";
  }
  get objTransformation(): string {
    return "";
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
