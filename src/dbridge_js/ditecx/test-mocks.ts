export function autogramApiMockFactory() {
  const apiClient = jest.fn().mockReturnValue({
    info: jest.fn().mockResolvedValue({ status: "READY", version: "1.0" }),
    getLaunchURL: jest.fn().mockReturnValue("http://localhost"),
    waitForStatus: jest
      .fn()
      .mockResolvedValue({ status: "READY", version: "1.0" }),
    sign: jest
      .fn()
      .mockImplementation(
        async (
          signatureId,
          digestAlgUri,
          signaturePolicyIdentifier,
          callback
        ) => {
          return {
            content:
              "TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvQDSdd57FueSBoYW5kcyBtYWtlIGxpZ2h0IHdvsRWdaAeSBoYW5kcyBtYW==",
            signedBy:
              "SERIALNUMBER=PNOSK-1234567890, C=SK, L=Bratislava, SURNAME=Smith, GIVENNAME=John, CN=John Smith",
            issuedBy: "CN=SVK eID ACA2, O=Disig a.s., OID.",
          };
        }
      ),
  });

  return { apiClient };
}
