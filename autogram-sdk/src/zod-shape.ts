import type { z } from "zod";

/**
 * Compile-time drift check for a hand-written zod object shape against a
 * TypeScript type (usually one generated from OpenAPI). Use as
 * `z.object({...} satisfies ZodShapeOf<T>)`: every key of `T` must have a
 * schema, no extra keys are allowed, and each field schema's output must be
 * assignable to the field type. Field inputs are unchecked, so `.default()`
 * is fine.
 */
export type ZodShapeOf<T> = {
  [K in keyof T]-?: z.ZodType<T[K], z.ZodTypeDef, unknown>;
};

/**
 * Keys-only variant of {@link ZodShapeOf} for schemas that are deliberately
 * looser than the type: every key of `T` must have a schema and no extra
 * keys are allowed, but field types are not checked.
 */
export type ZodKeysOf<T> = {
  [K in keyof T]-?: z.ZodTypeAny;
};
