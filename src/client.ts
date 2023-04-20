import { AutogramDocument as BaseDocument } from "./autogram-api";

export { apiClient } from "./autogram-api";

export type AutogramDocument = BaseDocument & { filename: string };
export { BaseDocument };
