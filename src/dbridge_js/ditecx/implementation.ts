import { apiClient, Document } from "@octosign/client";
import { TODO } from "../../util";

export class DBridgeOctosignImpl {
  private client: ReturnType<typeof apiClient>;
  private objects: InputObject[] = [];
  language = "sk";
  signedObject: Document;

  constructor() {
    this.client = apiClient({
      disableSecurity: true,
      requestsOrigin: "*",
    });
  }

  async launch(callback: OnSuccessCallback): Promise<void> {
    try {
      await this.client.waitForStatus("READY", 1);
    } catch (e) {
      console.error(e);
      const url = this.client.getLaunchURL();
      window.open(url);
      await this.client.waitForStatus("READY");
    }
    callback.onSuccess();
  }

  async sign(
    signatureId: string,
    digestAlgUri: string,
    signaturePolicyIdentifier: string,
    callback: OnSuccessCallback & OnErrorCallback
  ): Promise<void> {
    console.log(this.signatureParameters);
    this.signedObject = await this.client.sign(
      this.document,
      this.signatureParameters,
      this.payloadMimeType
    );
    callback.onSuccess();
  }

  addObject(obj: InputObject, callback: OnSuccessCallback): void {
    console.log(obj);
    this.objects.push(obj);
    callback.onSuccess();
  }

  getSignatureWithASiCEnvelopeBase64(callback: OnSuccessCallback1): void {
    callback.onSuccess(this.signedObject.content);
  }

  getSignerIdentification(callback: OnSuccessCallback1): void {
    TODO("Signer identification chyba v octosign");
    callback.onSuccess(`CN=Tester Testovic`);
  }

  private get signatureParameters(): FullSignerParameters {
    TODO(
      "Parametre by mali byt nacitavane podla getXYZ - problem kvoli rozdielom v api octosign a dsigner"
    );
    return {
      identifier: this.formId,
      version: this.formVersion,
      format: "XADES",
      level: "XADES_BASELINE_B",
      fileMimeType: "application/vnd.etsi.asic-e+zip",
      container: "ASICE",
      packaging: "ENVELOPING",
      digestAlgorithm: "SHA256",
      en319132: false,
      infoCanonicalization: "INCLUSIVE",
      propertiesCanonicalization: "INCLUSIVE",
      keyInfoCanonicalization: "INCLUSIVE",
      signaturePolicyId: "http://www.example.com/policy.txt",
      signaturePolicyContent: "Don't be evil.",
      transformation: this.objTransformation,
      transformationOutputMimeType: "text/plain",
      schema: this.objSchema,
    };
  }

  private get document(): Document {
    const obj = this.objects[0];

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
        return { content: obj.sourcePngBase64 };

      case "XadesBpTxt":
        return { content: obj.sourceTxt };

      default:
        throw new Error("failed");
    }
  }

  private get objSchema() {
    const obj = this.objects[0];
    switch (obj.type) {
      case "XadesBpXml":
        return obj.xdcUsedXSD;
      case "XadesXml":
      case "Xades2Xml":
        return obj.sourceXsd;

      case "XadesBpPng":
      case "XadesBpTxt":
      default:
        throw new Error("failed");
    }
  }

  private get objTransformation() {
    const obj = this.objects[0];
    switch (obj.type) {
      case "XadesBpXml":
        return obj.xdcUsedXSLT;
      case "XadesXml":
      case "Xades2Xml":
        return obj.sourceXsl;

      case "XadesBpPng":
      case "XadesBpTxt":
      default:
        throw new Error("failed");
    }
  }

  private get formVersion() {
    const obj = this.objects[0];
    switch (obj.type) {
      case "XadesBpXml":
        return obj.xdcVersion;
      case "XadesXml":
      case "Xades2Xml":
        return obj.namespaceUri;

      case "XadesBpPng":
      case "XadesBpTxt":
      default:
        throw new Error("failed");
    }
  }

  private get formId() {
    const obj = this.objects[0];
    switch (obj.type) {
      case "XadesBpXml":
        return obj.xdcNamespaceURI;
      case "XadesXml":
      case "Xades2Xml":
        return obj.namespaceUri;

      case "XadesBpPng":
      case "XadesBpTxt":
      default:
        throw new Error("failed");
    }
  }

  private get payloadMimeType() {
    const obj = this.objects[0];
    switch (obj.type) {
      case "XadesBpXml":
      case "XadesXml":
      case "Xades2Xml":
        return "application/xml";
      case "XadesBpPng":
        return "*/*";

      case "XadesBpTxt":
        return "text/plain";

      default:
        throw new Error("failed");
    }
  }
}

interface OnSuccessCallback {
  onSuccess: () => void;
}
interface OnSuccessCallback1 {
  onSuccess: (v) => void;
}

interface OnErrorCallback {
  onError: (e) => void;
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
  type: "XadesBpPng";
  objectId: string;
  objectDescription: string;
  sourcePngBase64: string;
  objectFormatIdentifier: string;
}

type InputObject =
  | ObjectXadesXml
  | ObjectXadesBpXml
  | ObjectXades2Xml
  | ObjectXadesBpTxt
  | ObjectXadesBpPng;

interface FullSignerParameters {
  identifier: null | string;
  version: null | string;
  format: "PADES" | "XADES";
  level: "PADES_BASELINE_B" | "XADES_BASELINE_B";
  fileMimeType: string;
  container: null | "ASICE" | "ASICS";
  packaging: "ENVELOPED" | "ENVELOPING" | "DETACHED" | "INTERNALLY_DETACHED";
  digestAlgorithm: "SHA256" | "SHA384" | "SHA512";
  en319132: false;
  infoCanonicalization: null | "INCLUSIVE" | "EXCLUSIVE";
  propertiesCanonicalization: null | "INCLUSIVE" | "EXCLUSIVE";
  keyInfoCanonicalization: null | "INCLUSIVE" | "EXCLUSIVE";
  signaturePolicyId: null | string;
  signaturePolicyContent: null | string;
  transformation: null | string;
  schema: null | string;
  transformationOutputMimeType: string;
}
