import { ObjectStrategy, PayloadMimeTypeStr } from "./base-strategy";
import { Document } from "@octosign/client";
import { ObjectXadesBpXml } from "../types";

export class XadesBpXmlStrategy implements ObjectStrategy {
  obj: ObjectXadesBpXml;
  constructor(object: ObjectXadesBpXml) {
    this.obj = object;
  }

  get document(): Document {
    return {
      content: this.obj.xdcXMLData,
      id: this.obj.objectId,
      title: this.obj.objectDescription,
    };
  }
  get objSchema(): string {
    return this.obj.xdcUsedXSD;
  }
  get objTransformation(): string {
    return this.obj.xdcUsedXSLT;
  }
  get formVersion() {
    return this.obj.xdcVersion;
  }
  get objectId() {
    return this.obj.objectId;
  }
  get identifier() {
    return this.obj.xdcIdentifier;
  }
  get payloadMimeType(): PayloadMimeTypeStr {
    return "application/xml";
  }
}
