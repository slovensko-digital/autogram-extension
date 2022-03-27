import { ditecX } from "./ditecx";
import { wrapWithProxy } from "./proxy";

type OriginalDitec = unknown;

export function inject(windowAny: { ditec?: OriginalDitec }): void {
  console.log("Start inject");
  console.log(windowAny.ditec);

  if (windowAny.ditec) {
    windowAny.ditec = ditecX;
    // windowAny.ditec = wrapWithProxy(ditecX);
  }
}
