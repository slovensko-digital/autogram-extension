import { Base64 } from "js-base64";

import { ObjectStrategy, PayloadMimeTypeStr } from "./base-strategy";

import { ObjectXadesBpTxt } from "../types";
import {
  DesktopAutogramDocument,
  DesktopSignatureParameters,
} from "autogram-sdk";

export class XadesBpTxtStrategy implements ObjectStrategy {
  obj: ObjectXadesBpTxt;
  constructor(object: ObjectXadesBpTxt) {
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
      content: Base64.encode(this.obj.sourceTxt),
      filename: this.obj.objectId,
    };
  }
  get objSchema(): string | undefined {
    return undefined;
  }
  get objTransformation(): string | undefined {
    return undefined;
  }
  get formVersion() {
    return "";
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
}
