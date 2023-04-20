import {
  ObjectStrategy,
  PayloadMimeTypeStr,
} from "./base-strategy";
import { Document } from "../../../client";
import { ObjectXadesBp2Xml, ObjectXadesBpXml } from "../types";
import { Base64 } from "js-base64";

export class XadesBpXmlStrategy implements ObjectStrategy {
  obj: ObjectXadesBpXml;
  constructor(object: ObjectXadesBpXml) {
    this.obj = object;
  }

  get document(): Document {
    return {
      content: this.obj.xdcXMLData,
      id: this.obj.objectId,
      filename: this.obj.objectId,
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

  get objTransformationOutputMimeType(): string {
    return this.objTransformation.search(/xsl:output method="text"/) != -1
      ? "text/plain"
      : "text/html";
  }
}

export class XadesBp2XmlStrategy implements ObjectStrategy {
  obj: ObjectXadesBp2Xml;
  constructor(object: ObjectXadesBp2Xml) {
    this.obj = object;
  }

  isXmlDataContainer() {
    return true;
    // try {
    //   const decoded = Base64.decode(this.obj.sourceXml);
    //   if (decoded.indexOf("<XMLDataContainer") !== -1 || decoded.match(/<[a-zA-Z0-9\-]*:XMLDataContainer)) {
    //     return true;
    //   }
    // } catch (error) {
    //   console.error(error);
    //   return false;
    // }
  }

  get document(): Document {
    return {
      content: this.obj.sourceXml,
      id: this.obj.objectId,
      title: this.obj.objectDescription,
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
    return this.obj.objectId;
  }
  get payloadMimeType(): PayloadMimeTypeStr {
    if (this.isXmlDataContainer()) {
      return "application/vnd.gov.sk.xmldatacontainer+xml;base64";
    }
    return "application/xml;base64";
  }

  get objTransformationOutputMimeType(): string {
    return this.objTransformation.search(/xsl:output method="text"/) != -1
      ? "text/plain"
      : "text/html";
  }
}
