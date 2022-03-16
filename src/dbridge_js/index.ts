import { ditecX } from "./ditecx";
import { wrapWithProxy } from "./proxy";

export function inject(windowAny: {ditec?: any}): void {
  console.log("Start inject");
  console.log(windowAny.ditec);

  // windowAny.ditec = wrapWithProxy(ditecX);
  windowAny.ditec = ditecX;
}
