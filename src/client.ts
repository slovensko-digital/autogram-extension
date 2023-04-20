import { ApiDocument as BaseDocument } from "./autogram-api";

export { apiClient } from "./autogram-api";

export type Document = BaseDocument & { filename: string };
export { BaseDocument };
