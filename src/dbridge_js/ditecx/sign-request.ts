import { SignatureParameters } from "../../autogram-api";
import {
  ObjectStrategy,
  XadesBpPngStrategy,
  XadesBpTxtStrategy,
  XadesBpXmlStrategy,
  XadesPdfStrategy,
  XadesXmlStrategy,
  XadesBp2XmlStrategy,
} from "./filetype-strategy";
import { InputObject, PartialSignerParameters } from "./types";
export { InputObject, PartialSignerParameters } from "./types";
export class SignRequest {
  object: InputObject;
  private objectInfo: ObjectStrategy;

  public signatureId: string;
  public digestAlgUri: string;
  public signaturePolicyIdentifier: string;
  public signStarted = false;

  // objects = [];
  // get object(): InputObject {
  //   return this.objects[0];
  // }

  public addObject(obj: InputObject): void {
    if (this.object && !this.signStarted) {
      console.error("ERROR: overwriting unsigned object");
    }
    this.object = obj;
    this.objectInfo = this.getObjectInfo();
  }

  public signatureParameters(
    params: PartialSignerParameters
  ): SignatureParameters {
    return {
      identifier: this.objectInfo.identifier,
      form: getProperty(params, "form", "XAdES_BASELINE_B"),
      container: getProperty(params, "container", "ASICE"),
      containerXmlns: getProperty(
        params,
        "containerXmlns",
        "http://data.gov.sk/def/container/xmldatacontainer+xml/1.1"
      ),
      packaging: getProperty(params, "packaging", "ENVELOPING"),
      digestAlgorithm: getProperty(params, "digestAlgorithm", "SHA256"),
      en319132: getProperty(params, "en319132", false),
      infoCanonicalization: getProperty(
        params,
        "infoCanonicalization",
        "INCLUSIVE"
      ),
      propertiesCanonicalization: getProperty(
        params,
        "propertiesCanonicalization",
        "INCLUSIVE"
      ),
      keyInfoCanonicalization: getProperty(
        params,
        "keyInfoCanonicalization",
        "INCLUSIVE"
      ),
      transformation: this.objectInfo.objTransformation,
      schema: this.objectInfo.objSchema,
    };
  }

  private getObjectInfo() {
    const obj = this.object;
    switch (obj.type) {
      case "XadesBpXml":
        return new XadesBpXmlStrategy(obj);

      case "XadesXml":
      case "Xades2Xml":
        return new XadesXmlStrategy(obj);

      case "XadesBp2Xml":
        return new XadesBp2XmlStrategy(obj);

      case "XadesPdf":
      case "XadesBpPdf":
        return new XadesPdfStrategy(obj);

      case "XadesBpPng":
      case "XadesPng":
        return new XadesBpPngStrategy(obj);

      case "XadesBpTxt":
        return new XadesBpTxtStrategy(obj);

      default:
        throw new Error("failed");
    }
  }

  get document() {
    return this.objectInfo.document;
  }

  get payloadMimeType() {
    return this.objectInfo.payloadMimeType;
  }
}

/**
 * Gets property from object or returns defaultValue
 * @param obj
 * @propertyName propertyName
 * @param defaultValue
 * @returns
 */
function getProperty<T>(obj: object, propertyName: string, defaultValue: T) {
  return Object.prototype.hasOwnProperty.call(obj, propertyName)
    ? obj[propertyName]
    : defaultValue;
}

// function assertUnreachable(x: never): never {
//   throw new Error("Didn't expect to get here");
// }
