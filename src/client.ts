import { Document as BaseDocument } from "@octosign/client";

export { apiClient } from "@octosign/client";

export type Document = BaseDocument & { filename: string };
export { BaseDocument };
