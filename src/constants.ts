export const extensionId = "kbiiffakfklnmcideniiecbgkoocemif";

export const enabledUrls = [
  "https://www.slovensko.sk/*",
  "https://schranka.slovensko.sk/*",
  "https://pfseform.financnasprava.sk/*",
  "https://www.financnasprava.sk/*",
  "https://cep.financnasprava.sk/*",
  "https://www.cep.financnasprava.sk/*",
  "https://eformulare.socpoist.sk/*",
  ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3000/*"] : []),
];
