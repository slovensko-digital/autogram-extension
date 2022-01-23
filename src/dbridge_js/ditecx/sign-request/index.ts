import { Document } from "@octosign/client";
import { TODO } from "../../../util";

export class SignRequest {
  // objects = [];
  object: InputObject;

  signatureId: string;
  digestAlgUri: string;
  signaturePolicyIdentifier: string;
  signStarted = false;

  // get object(): InputObject {
  //   return this.objects[0];
  // }

  addObject(obj: InputObject): void {
    if (this.object && !this.signStarted) {
      console.log("ERROR: overwriting unsigned object");
    }
    this.object = obj;
  }

  signatureParameters(params: PartialSignerParameters): FullSignerParameters {
    return {
      identifier: this.identifier,
      version: this.formVersion,
      format: params.format || "XADES",
      level: params.level || "XADES_BASELINE_B",
      fileMimeType:
        params.fileMimeType ||
        "application/vnd.gov.sk.xmldatacontainer+xml; charset=UTF-8",
      container: params.container || "ASICE",
      containerFilename: params.containerFilename || this.object.objectId,
      containerXmlns:
        params.containerXmlns ||
        "http://data.gov.sk/def/container/xmldatacontainer+xml/1.1",
      packaging: params.packaging || "ENVELOPING",
      digestAlgorithm: params.digestAlgorithm || "SHA256",
      en319132: params.en319132 || false,
      infoCanonicalization: params.infoCanonicalization || "INCLUSIVE",
      propertiesCanonicalization:
        params.propertiesCanonicalization || "INCLUSIVE",
      keyInfoCanonicalization: params.keyInfoCanonicalization || "INCLUSIVE",
      signaturePolicyId:
        params.signaturePolicyId || "http://www.example.com/policy.txt",
      signaturePolicyContent: params.signaturePolicyContent || "Don't be evil.",
      transformation: this.objTransformation,
      transformationOutputMimeType:
        params.transformationOutputMimeType || "text/plain",
      schema: this.objSchema,
    };
  }

  get document(): Document {
    const obj = this.object;

    switch (obj.type) {
      case "XadesBpXml":
        return {
          content: obj.xdcXMLData,
          id: obj.objectId,
          title: obj.objectDescription,
        };

      case "XadesXml":
      case "Xades2Xml":
        return { content: obj.sourceXml, id: obj.objectId };

      case "XadesBpPng":
      case "XadesPng":
        return { content: obj.sourcePngBase64 };

      case "XadesBpTxt":
        return { content: obj.sourceTxt };

      case "XadesPdf":
      case "XadesBpPdf":
        return { content: obj.sourcePdfBase64 };

      default:
        throw new Error("failed");
    }
  }

  private get objSchema() {
    const obj = this.object;
    switch (obj.type) {
      case "XadesBpXml":
        return obj.xdcUsedXSD;
      case "XadesXml":
      case "Xades2Xml":
        return obj.sourceXsd;

      case "XadesBpPng":
      case "XadesPng":
        return null;

      case "XadesPdf":
      case "XadesBpPdf":
        return null; // no idea what this should be

      case "XadesBpTxt":
      default:
        throw new Error("failed");
    }
  }

  private get objTransformation() {
    const obj = this.object;
    switch (obj.type) {
      case "XadesBpXml":
        return obj.xdcUsedXSLT;
      case "XadesXml":
      case "Xades2Xml":
        return obj.sourceXsl;

      case "XadesBpPng":
      case "XadesPng":
        return null;

      case "XadesPdf":
      case "XadesBpPdf":
        return null;

      case "XadesBpTxt":
      default:
        throw new Error("failed");
    }
  }

  private get formVersion() {
    const obj = this.object;
    switch (obj.type) {
      case "XadesBpXml":
        return obj.xdcVersion;
      case "XadesXml":
      case "Xades2Xml":
        return obj.namespaceUri;

      case "XadesBpPng":
      case "XadesPng":
        return null;

      case "XadesPdf":
      case "XadesBpPdf":
        return null;

      case "XadesBpTxt":
      default:
        throw new Error("failed");
    }
  }

  private get identifier() {
    const obj = this.object;
    switch (obj.type) {
      case "XadesBpXml":
        return obj.xdcIdentifier;
      case "XadesXml":
      case "Xades2Xml":
        TODO("Not sure if this is identifier");
        return obj.namespaceUri;

      case "XadesBpPng":
      case "XadesPng":
        return obj.objectId;

      case "XadesPdf":
      case "XadesBpPdf":
        return obj.objectId;

      case "XadesBpTxt":
      default:
        throw new Error("failed");
    }
  }

  get payloadMimeType(): PayloadMimeTypeStr {
    const obj = this.object;
    switch (obj.type) {
      case "XadesBpXml":
      case "XadesXml":
      case "Xades2Xml":
        return "application/xml";

      case "XadesBpTxt":
        return "text/plain";

      case "XadesBpPng":
      case "XadesPng":
        return "application/pdf;base64";

      case "XadesPdf":
      case "XadesBpPdf":
        return "application/pdf;base64";

      default:
        throw new Error("failed");
    }
  }
}

interface ObjectXadesXml {
  type: "XadesXml";
  objectId: string;
  objectDescription: string;
  sourceXml: string;
  sourceXsd: string;
  namespaceUri: string;
  xsdReference: string;
  sourceXsl: string;
  xslReference: string;
}

interface ObjectXadesBpXml {
  type: "XadesBpXml";
  objectId: string;
  objectDescription: string;
  objectFormatIdentifier: string;
  xdcXMLData: string;
  xdcIdentifier: string;
  xdcVersion: string;
  xdcUsedXSD: string;
  xsdReferenceURI;
  xdcUsedXSLT: string;
  xslReferenceURI: string;
  xslMediaDestinationTypeDescription;
  xslXSLTLanguage: string;
  xslTargetEnvironment: string;
  xdcIncludeRefs: boolean;
  xdcNamespaceURI: string;
}

interface ObjectXades2Xml {
  type: "Xades2Xml";
  objectId: string;
  objectDescription: string;
  sourceXml: string;
  sourceXsd: string;
  namespaceUri: string;
  xsdReference: string;
  sourceXsl: string;
  xslReference: string;
  transformType: string;
}

interface ObjectXadesBpTxt {
  type: "XadesBpTxt";
  objectId: string;
  objectDescription: string;
  sourceTxt;
  objectFormatIdentifier: string;
}

interface ObjectXadesBpPng {
  type: "XadesBpPng" | "XadesPng";
  objectId: string;
  objectDescription: string;
  sourcePngBase64: string;
  objectFormatIdentifier: string;
}

interface ObjectXadesPdf {
  type: "XadesPdf" | "XadesBpPdf";
  objectId: string;
  objectDescription: string;
  sourcePdfBase64: string;
  password: string;
  objectFormatIdentifier: string;
  reqLevel: number;
  convert: boolean;
}

export type InputObject =
  | ObjectXadesXml
  | ObjectXadesBpXml
  | ObjectXades2Xml
  | ObjectXadesBpTxt
  | ObjectXadesBpPng
  | ObjectXadesPdf;

interface FullSignerParameters {
  identifier: null | string;
  version: null | string;
  format: "PADES" | "XADES";
  level: "PADES_BASELINE_B" | "XADES_BASELINE_B" | "BASELINE_B";
  fileMimeType: string;
  container: null | "ASICE" | "ASICS";
  containerFilename: null | string;
  containerXmlns: null | string;
  packaging: "ENVELOPED" | "ENVELOPING" | "DETACHED" | "INTERNALLY_DETACHED";
  digestAlgorithm: "SHA256" | "SHA384" | "SHA512";
  en319132: false;
  infoCanonicalization: null | "INCLUSIVE" | "EXCLUSIVE";
  propertiesCanonicalization: null | "INCLUSIVE" | "EXCLUSIVE";
  keyInfoCanonicalization: null | "INCLUSIVE" | "EXCLUSIVE";
  signaturePolicyId: null | string;
  signaturePolicyContent: null | string;
  schema: null | string;
  transformation: null | string;
  transformationOutputMimeType: string;
}

export type PartialSignerParameters = Partial<FullSignerParameters>;

type PayloadMimeTypeStr =
  | "application/xml"
  | "application/xml;base64"
  | "image/png;base64"
  | "application/pdf"
  | "application/pdf;base64"
  | "text/plain"
  | "*/*";

// function assertUnreachable(x: never): never {
//   throw new Error("Didn't expect to get here");
// }
