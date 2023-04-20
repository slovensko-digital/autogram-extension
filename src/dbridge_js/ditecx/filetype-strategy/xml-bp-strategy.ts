import {
  ObjectStrategy,
  PayloadMimeTypeStr,
} from "./base-strategy";
import { AutogramDocument } from "../../../client";
import { ObjectXadesBp2Xml, ObjectXadesBpXml } from "../types";
import { Base64 } from "js-base64";

export class XadesBpXmlStrategy implements ObjectStrategy {
  obj: ObjectXadesBpXml;
  constructor(object: ObjectXadesBpXml) {
    this.obj = object;
  }

  get document(): AutogramDocument {
    return {
      content: this.obj.xdcXMLData,
      filename: this.obj.objectId,
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

  isXmlDataContainer() {
    return true;
  }

  get document(): AutogramDocument {
    return {
      content: this.obj.sourceXml,
      filename: this.obj.objectId,
    };
  }
  get objSchema(): string {
    return Base64.encode(this.obj.sourceXsd);
  }
  get objTransformation(): string {
    return Base64.encode(this.obj.sourceXsl);
  }
  get formVersion() {
    return this.obj.namespaceUri;
  }
  get objectId() {
    return this.obj.objectId;
  }
  get identifier() {
    return this.obj.namespaceUri;
  }
  get payloadMimeType(): PayloadMimeTypeStr {
    if (this.isXmlDataContainer()) {
      return "application/vnd.gov.sk.xmldatacontainer+xml;base64";
    }
    return "application/xml;base64";
  }

}
