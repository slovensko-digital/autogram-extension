import { FileMimeTypeStr, ObjectStrategy, PayloadMimeTypeStr } from "./base-strategy";
import { Document } from "@octosign/client";
import { ObjectXadesBpTxt } from "../types";

export class XadesBpTxtStrategy implements ObjectStrategy {
  obj: ObjectXadesBpTxt;
  constructor(object: ObjectXadesBpTxt) {
    this.obj = object;
  }

  get document(): Document {
    return {
      content: this.obj.sourceTxt,
      title: this.obj.objectDescription,
      id: this.obj.objectId,
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
    return "text/plain";
  }

  get objTransformationOutputMimeType(): string {
    return null;
  }

  get fileMimeType(): FileMimeTypeStr {
    return "text/plain";
  }
}
