import { ObjectStrategy, PayloadMimeTypeStr } from "./base-strategy";
import { Document } from "@octosign/client";
import { ObjectXadesPdf } from "../types";

export class XadesPdfStrategy implements ObjectStrategy {
  obj: ObjectXadesPdf;
  constructor(object: ObjectXadesPdf) {
    this.obj = object;
  }

  get document(): Document {
    return { content: this.obj.sourcePdfBase64 };
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
    return "application/pdf;base64";
  }
}
