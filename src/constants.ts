export const extensionId = "kbiiffakfklnmcideniiecbgkoocemif";

export const enabledUrls = [
  "https://www.slovensko.sk/*",
  "https://schranka.slovensko.sk/*",
  "https://pfseform.financnasprava.sk/*",
  "https://www.financnasprava.sk/*",
  "https://eformulare.socpoist.sk/*",
  "https://city-account-next.dev.bratislava.sk/*",
  "https://city-account-next.staging.bratislava.sk/*",
  "https://konto.bratislava.sk/*",
  ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3000/*"] : []),
];
