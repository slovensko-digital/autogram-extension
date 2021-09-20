import { apiClient } from "@octosign/client";

function old() {
  const client = apiClient();
  console.log(client.getLaunchURL());

  client.waitForStatus("READY").then(async () => {
    const content =
      '<?xml version="1.0"?><Document><Title>Lorem Ipsum</Title></Document>';
    console.log(await client.sign({ content }));
    // => { content: '<?xml version="1.0"?><Document><Title>Lorem Ipsum</Title>...</Document>' }
  });
}

export interface SignerRequest {
  document: {
    id: string;
    title: string;
    content: string;
    legalEffect?: string;
  };
  parameters: {
    identifier: null | string;
    version: null | string;
    format: "PADES" | "XADES";
    level: "PADES_BASELINE_B" | "XADES_BASELINE_B";
    fileMimeType: null | string;
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
  };
  payloadMimeType: "application/pdf;base64" | "application/xml" | string;
  hmac: "string";
}

export interface SignerResponse {
  id: string;
  title: string;
  content: string;
  legalEffect?: string;
}

const pades: SignerRequest = {
  document: {
    id: "456",
    title: "PDF random file",
    content: "asdfsadf",
    legalEffect: "By signing this pdf document...",
  },
  parameters: {
    identifier: null,
    version: null,
    format: "PADES",
    level: "PADES_BASELINE_B",
    fileMimeType: null,
    container: null,
    packaging: "ENVELOPED",
    digestAlgorithm: "SHA256",
    en319132: false,
    infoCanonicalization: null,
    propertiesCanonicalization: null,
    keyInfoCanonicalization: null,
    signaturePolicyId: null,
    signaturePolicyContent: null,
    transformation: null,
    schema: null,
  },
  payloadMimeType: "application/pdf;base64",
  hmac: "string",
};

const xades: SignerRequest = {
  document: {
    id: "123",
    title: "Yur arbitrary title",
    content:
      '<?xml version="1.0"?><Document><Title>Lorem Ipsum</Title></Document>',
    legalEffect: "By signing this document...",
  },
  parameters: {
    identifier: "https://data.gov.sk/id/egov/eform/36126624.Rozhodnutie.sk",
    version: "1.11",
    format: "XADES",
    level: "XADES_BASELINE_B",
    fileMimeType: "application/lor.ip.xmldatacontainer+xml",
    container: "ASICE",
    packaging: "ENVELOPING",
    digestAlgorithm: "SHA256",
    en319132: false,
    infoCanonicalization: "INCLUSIVE",
    propertiesCanonicalization: "INCLUSIVE",
    keyInfoCanonicalization: "INCLUSIVE",
    signaturePolicyId: "http://www.example.com/policy.txt",
    signaturePolicyContent: "Don't be evil.",
    transformation:
      '<?xml version="1.0"?><xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"><xsl:template match = "/"><h1><xsl:value-of select="/Document/Title"/></h1></xsl:template></xsl:stylesheet>',
    schema:
      '<?xml version="1.0"?><xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema"><xs:element name="Document"><xs:complexType><xs:sequence><xs:element name="Title" type="xs:string" /></xs:sequence></xs:complexType></xs:element></xs:schema>',
  },
  payloadMimeType: "application/xml",
  hmac: "string",
};

export class SignerClient {
  // constructor() {}

  signRequest(requestBody: SignerRequest): Promise<SignerResponse> {
    const url = "http://127.0.0.1:37200/sign";

    const init: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
        Accept: "application/json",
        Origin: window.origin,
      },
      cache: "no-store",
      body: JSON.stringify(requestBody),
    };
    return fetch(url, init).then((response) => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    });
  }

  exec(requestBody: SignerRequest): Promise<SignerResponse> {
    // old();
    return this.signRequest(requestBody);
  }
}
