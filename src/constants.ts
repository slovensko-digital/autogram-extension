export const extensionId = "kbiiffakfklnmcideniiecbgkoocemif";

export const enabledUrls = [
  "https://www.slovensko.sk/*",
  "https://schranka.slovensko.sk/*",
  "https://pfseform.financnasprava.sk/*",
  ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3000/*"] : []),
];
