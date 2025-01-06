import { ObjectStrategy, PayloadMimeTypeStr } from "./base-strategy";

import { ObjectXades2Xml, ObjectXadesXml } from "../types";
import {
  DesktopAutogramDocument,
  DesktopSignatureParameters,
} from "autogram-sdk";

export class XadesXmlStrategy implements ObjectStrategy {
  obj: ObjectXadesXml | ObjectXades2Xml;
  constructor(object: ObjectXadesXml | ObjectXades2Xml) {
    this.obj = object;
  }
  schemaIdentifier: string;
  transformationIdentifier: string;
  transformationMediaDestinationTypeDescription: DesktopSignatureParameters["transformationMediaDestinationTypeDescription"];
  transformationLanguage: string;
  transformationTargetEnvironment: string;
  includeRefs: boolean;

  get document(): DesktopAutogramDocument {
    return {
      content: this.obj.sourceXml,
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
}
