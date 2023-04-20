import {
  ObjectStrategy,
  PayloadMimeTypeStr,
} from "./base-strategy";
import { Document } from "../../../client";
import { ObjectXadesBpPng } from "../types";

export class XadesBpPngStrategy implements ObjectStrategy {
  obj: ObjectXadesBpPng;
  constructor(object: ObjectXadesBpPng) {
    this.obj = object;
  }

  get document(): Document {
    return {
      content: this.obj.sourcePngBase64,
      title: this.obj.objectDescription,
      id: this.obj.objectId,
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

  get objTransformationOutputMimeType(): string {
    return null;
  }
}
