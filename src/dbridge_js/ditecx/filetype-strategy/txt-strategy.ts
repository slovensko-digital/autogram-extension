import {
  FileMimeTypeStr,
  ObjectStrategy,
  PayloadMimeTypeStr,
} from "./base-strategy";

import { ObjectXadesBpTxt } from "../types";
import { Base64 } from "js-base64";
import { Document } from "../../../client";

export class XadesBpTxtStrategy implements ObjectStrategy {
  obj: ObjectXadesBpTxt;
  constructor(object: ObjectXadesBpTxt) {
    this.obj = object;
  }

  get document(): Document {
    return {
      content: Base64.encode(this.obj.sourceTxt),
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
    return "text/plain;base64";
  }

  get objTransformationOutputMimeType(): string {
    return null;
  }

  get fileMimeType(): FileMimeTypeStr {
    return "text/plain";
  }
}
