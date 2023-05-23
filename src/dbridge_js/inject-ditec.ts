import { ditecX } from "./ditecx/ditecx";

type OriginalDitec = object;

const useProxy = true;
const useProxyWithOriginal = useProxy && false;
export function inject(windowAny: { ditec?: OriginalDitec }): void {
  console.log("Start inject. Original ditec:", windowAny.ditec);

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
  } else {
    // TODO: maybe add whitelist
    console.warn("Creating ditec object");
    windowAny.ditec = ditecX;
  }
}
