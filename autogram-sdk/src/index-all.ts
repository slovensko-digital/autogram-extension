/**
 * @module autogram-index-all
 * Everything from the headless entry point ({@link module:autogram-index})
 * plus the dialog UI (`CombinedClient` / `createAutogramClient`).
 *
 * This is the entry point used for the script-tag IIFE build
 * (`dist/index-all.iife.js`, global `AutogramSDK`). Importing it has the
 * custom-element side effects of `with-ui`, so it must run in a browser
 * page context.
 *
 * It re-exports `./index` wholesale so the two entry points can never
 * drift apart — only genuinely UI-specific symbols are added here.
 */

export * from "./index";

export { CombinedClient, createAutogramClient } from "./with-ui";
export type { AutogramClientOptions, ClientSignOptions } from "./with-ui";
