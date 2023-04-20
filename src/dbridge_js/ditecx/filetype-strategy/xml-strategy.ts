import {
  ObjectStrategy,
  PayloadMimeTypeStr,
} from "./base-strategy";
import { Document } from "../../../client";
import { ObjectXades2Xml, ObjectXadesXml } from "../types";

export class XadesXmlStrategy implements ObjectStrategy {
  obj: ObjectXadesXml | ObjectXades2Xml;
  constructor(object: ObjectXadesXml | ObjectXades2Xml) {
    this.obj = object;
  }

  get document(): Document {
    return {
      content: this.obj.sourceXml,
      id: this.obj.objectId,
      filename: this.obj.objectId,
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
    console.warn("Not sure if this is identifier", this.obj.namespaceUri);
    return this.obj.namespaceUri;
  }
  get payloadMimeType(): PayloadMimeTypeStr {
    return "application/xml";
  }

  get objTransformationOutputMimeType(): string {
    return this.objTransformation.search(/xsl:output method="text"/) != -1
      ? "text/plain"
      : "text/html";
  }
}
