import { ObjectStrategy, PayloadMimeTypeStr } from "./base-strategy";

import { ObjectXadesBpTxt } from "../types";
import { AutogramDocument } from "../../../client";
import { SignatureParameters } from "../../../autogram-api";

export class XadesBpTxtStrategy implements ObjectStrategy {
  obj: ObjectXadesBpTxt;
  constructor(object: ObjectXadesBpTxt) {
    this.obj = object;
  }
  schemaIdentifier: string;
  transformationIdentifier: string;
  transformationMediaDestinationTypeDescription: SignatureParameters["transformationMediaDestinationTypeDescription"];
  transformationLanguage: string;
  transformationTargetEnvironment: string;

  get document(): AutogramDocument {
    return {
      content: this.obj.sourceTxt,
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
