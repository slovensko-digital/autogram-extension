export const manifestVersion: 2 | 3 =
  process.env.AE_MANIFEST_VERSION === "3" ? 3 : 2;
