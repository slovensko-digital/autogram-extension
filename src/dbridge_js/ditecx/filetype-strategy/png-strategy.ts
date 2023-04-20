import {
  ObjectStrategy,
  PayloadMimeTypeStr,
} from "./base-strategy";
import { AutogramDocument } from "../../../client";
import { ObjectXadesBpPng } from "../types";

export class XadesBpPngStrategy implements ObjectStrategy {
  obj: ObjectXadesBpPng;
  constructor(object: ObjectXadesBpPng) {
    this.obj = object;
  }

  get document(): AutogramDocument {
    return {
      content: this.obj.sourcePngBase64,
      filename: this.obj.objectId,
    };
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
    return this.obj.objectId;
  }
  get identifier() {
    return this.obj.objectFormatIdentifier;
  }
  get payloadMimeType(): PayloadMimeTypeStr {
    return "image/png;base64";
  }
}
