import { ditecX } from "./ditecx/ditecx";

type OriginalDitec = object;

declare global {
  const __MANIFEST_VERSION__: string;
  const __COMMIT_HASH__: string;
}

const useProxy = true;
const useProxyWithOriginal = useProxy && false;
export function inject(windowAny: { ditec?: OriginalDitec }): void {
  console.log("Start inject", { 
    manifestVersion: __MANIFEST_VERSION__,
    commitHash: __COMMIT_HASH__,
  });
  console.log(windowAny.ditec);

  if (windowAny.ditec) {
    if (useProxy) {
      import("./proxy").then(({ wrapWithProxy }) => {
        windowAny.ditec = !useProxyWithOriginal
          ? wrapWithProxy(ditecX)
          : windowAny.ditec
            ? wrapWithProxy(windowAny.ditec)
            : undefined;
      });
    } else {
      windowAny.ditec = ditecX;
    }

    // windowAny.ditec = wrapWithProxy(ditecX);
  }
}
