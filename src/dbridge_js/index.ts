import { ditecX } from "./ditecx";

type OriginalDitec = object;

const useProxy = true;
const useProxyWithOriginal = useProxy && false;
export function inject(windowAny: { ditec?: OriginalDitec }): void {
  console.log("Start inject");
  console.log(windowAny.ditec);

  if (windowAny.ditec) {
    if (useProxy) {
      import("./proxy").then(({ wrapWithProxy }) => {
        windowAny.ditec = useProxyWithOriginal
          ? wrapWithProxy(windowAny.ditec)
          : wrapWithProxy(ditecX);
      });
    } else {
      windowAny.ditec = ditecX;
    }

    // windowAny.ditec = wrapWithProxy(ditecX);
  }
}
