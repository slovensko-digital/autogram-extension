import { ObjectStrategy, PayloadMimeTypeStr } from "./base-strategy";

import { ObjectXadesBp2Xml, ObjectXadesBpXml } from "../types";
import { Base64 } from "js-base64";
import {
  DesktopAutogramDocument,
  DesktopSignatureParameters,
} from "autogram-sdk";

export class XadesBpXmlStrategy implements ObjectStrategy {
  obj: ObjectXadesBpXml;
  constructor(object: ObjectXadesBpXml) {
    this.obj = object;
  }

  get document(): DesktopAutogramDocument {
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
    // Canonical form identifier includes the version as the last path
    // segment. Mirrors the PFS bundle's own derivation (Podanie
    // initializedCallback): append xdcVersion unless the identifier
    // already ends with it. A bare `includes("/")` check is wrong here —
    // it matches every URI, so a versionless URI would stay versionless.
    const identifier = this.obj.xdcIdentifier;
    if (identifier.split("/").pop() === this.obj.xdcVersion) {
      return identifier;
    }
    return identifier + "/" + this.obj.xdcVersion;
  }
  get schemaIdentifier() {
    return this.obj.xsdReferenceURI;
  }
  get transformationIdentifier() {
    return this.obj.xslReferenceURI;
  }
  get transformationMediaDestinationTypeDescription() {
    return this.obj.xslMediaDestinationTypeDescription;
  }
  get transformationLanguage() {
    return this.obj.xslXSLTLanguage;
  }
  get transformationTargetEnvironment() {
    return this.obj.xslTargetEnvironment;
  }
  get includeRefs() {
    return this.obj.xdcIncludeRefs;
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
  schemaIdentifier: string;
  transformationIdentifier: string;
  transformationMediaDestinationTypeDescription: DesktopSignatureParameters["transformationMediaDestinationTypeDescription"];
  transformationLanguage: string;
  transformationTargetEnvironment: string;
  includeRefs: boolean;

  isXmlDataContainer() {
    return true;
  }

  get document(): DesktopAutogramDocument {
    return {
      content: this.obj.xdcXDCB64,
      filename: this.obj.objectId,
    };
  }
  get objSchema(): string {
    return Base64.encode(this.obj.xdcUsedXSD);
  }
  get objTransformation(): string {
    return Base64.encode(this.obj.xdcUsedXSLT);
  }
  get formVersion() {
    return this.obj.objectFormatIdentifier;
  }
  get objectId() {
    return this.obj.objectId;
  }
  get identifier() {
    return this.obj.objectFormatIdentifier;
  }
  get payloadMimeType(): PayloadMimeTypeStr {
    if (this.isXmlDataContainer()) {
      return "application/vnd.gov.sk.xmldatacontainer+xml;base64";
    }
    return "application/xml;base64";
  }
}
