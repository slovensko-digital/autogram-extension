
# How is D.Signer used in the wild

How is it loaded
- load dsigner in header
    - [UPVS](https://schranka.slovensko.sk/)
- load dsigner dynamically (for example single-page applicaitons)
    - [Bratislava.sk](https://konto.bratislava.sk/mestske-sluzby/priznanie-k-dani-z-nehnutelnosti/)
- load dsigner in iframe
    - financna sprava

Differences in use
- forms in financna sprava call `getSignerIdentification` before calling `getSignedXmlWithEnvelopeBase64` which means we don't have signed data (and signer identification)
- forms in UPVS call `getSignedXmlWithEnvelopeBase64` directly

Because we don't have separate `sign` and `getSignedData`, and `sign` 


