export const extensionId = "kbiiffakfklnmcideniiecbgkoocemif";

export const enabledUrls = [
  "https://www.slovensko.sk/*",
  "https://schranka.slovensko.sk/*",
  "https://pfseform.financnasprava.sk/*",
  "https://www.financnasprava.sk/*",
  "https://cep.financnasprava.sk/*",
  "https://www.cep.financnasprava.sk/*",
  "https://eformulare.socpoist.sk/*",
  "https://sluzby.orsr.sk/*",
  ...(process.env.NODE_ENV !== "production"
    ? [
        "http://localhost:3000/*",
        "http://localhost:49675/*",
        "http://localhost/*",
        "http://127.0.0.1/*",
        "http://127.0.0.1:49675/*",
      ]
    : []),
];
