import { SignerRequest } from "./signer-client";

export interface DsignerRequest {
  SignatureId: string;
  Documents: {
    ObjectId: string;
    Data: string;
    Description: string;
    Uri: string;
    IsXml: boolean;
    XmlFormId: string;
    XmlFormVersion: string;
    Xsd: string;
    XsdUri: string;
    Xslt: string;
    XsltUri: string;
    XsltIsHtml: boolean;
    Language: "sk";
    TargetEnvironment: "";
    IsContainerContent: boolean;
    PdfReqLevel: number;
    XadesZepXMLVerificationDataVersion: null;
  }[];
  SignatureType: "ASiC";
  SignatureTypeValue: number;
  SignatureMetadata: {
    AddTimestampAndMerge: boolean;
    DisplayName: string;
    MimeType: string;
    Description: string;
  };
  InternalDocumentIds: number[];
  InternalDocumentSignatureContainerIds: number[];
  XadesZepSignatureVersion: null;
}

export class DsignerMediator {
  static toSigner(originalRequest: DsignerRequest): SignerRequest {
    return {
      document: {
        id: originalRequest.Documents[0].ObjectId,
        title: originalRequest.Documents[0].Description,
        content: originalRequest.Documents[0].Data,
      },
      parameters: {
        identifier: originalRequest.Documents[0].XmlFormId,
        version: originalRequest.Documents[0].XmlFormVersion,
        format: "XADES",
        level: "XADES_BASELINE_B",
        fileMimeType:  originalRequest.SignatureMetadata.MimeType,
        container: "ASICE",
        packaging: "ENVELOPING",
        digestAlgorithm: "SHA256",
        en319132: false,
        infoCanonicalization: "INCLUSIVE",
        propertiesCanonicalization: "INCLUSIVE",
        keyInfoCanonicalization: "INCLUSIVE",
        signaturePolicyId: "http://www.example.com/policy.txt",
        signaturePolicyContent: "Don't be evil.",
        transformation: originalRequest.Documents[0].Xslt,
        schema: originalRequest.Documents[0].Xsd,
      },
      payloadMimeType: "application/xml",
      hmac: "string",
    };
  }
}
