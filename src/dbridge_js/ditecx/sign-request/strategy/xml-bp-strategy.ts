import { ObjectStrategy, PayloadMimeTypeStr } from "./base-strategy";
import { Document } from "@octosign/client";
import { ObjectXadesBp2Xml, ObjectXadesBpXml } from "../types";

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

export class XadesBp2XmlStrategy implements ObjectStrategy {
  obj: ObjectXadesBp2Xml;
  constructor(object: ObjectXadesBp2Xml) {
    this.obj = object;
  }

  get document(): Document {
    return {
      content: this.obj.sourceXml,
      id: this.obj.objectId,
      title: this.obj.objectDescription,
    };
  }
  get objSchema(): string {
    return this.obj.sourceXsd;
  }
  get objTransformation(): string {
    return this.obj.sourceXsl;
  }
  get formVersion() {
    return this.obj.namespaceUri;
  }
  get objectId() {
    return this.obj.objectId;
  }
  get identifier() {
    return this.obj.objectId;
  }
  get payloadMimeType(): PayloadMimeTypeStr {
    return "application/xml";
  }
}
