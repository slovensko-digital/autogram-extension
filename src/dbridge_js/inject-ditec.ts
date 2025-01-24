import { constructDitecX } from "./ditecx/ditecx";
import {
  CONFLICT_RESOLUTION_IMMUTABLE_PROXY,
  CONFLICT_RESOLUTION_PROXY_ORIGINAL,
  CONFLICT_RESOLUTION_REPLACE_ORIGINAL,
  supportedSites,
} from "../supported-sites";

type OriginalDitec = object;

declare global {
  const __MANIFEST_VERSION__: string;
  const __COMMIT_HASH__: string;
}

const useProxy = false;
const useProxyWithOriginal = useProxy && false;
export function inject(windowAny: {
  ditec?: OriginalDitec;
  location: Location;
}): void {
  console.log("Start inject", {
    manifestVersion: __MANIFEST_VERSION__,
    commitHash: __COMMIT_HASH__,
  });
  console.log("original ditec", windowAny.ditec);

  const site = supportedSites.matchUrl(windowAny.location.href);

  let injector: ConflictResolver | null = null;
  for (const InjectorClass of [
    ProxyConflictResolver,
    ReplaceOriginalConflictResolver,
    ProxyOriginalRecorderConflictResolver,
  ]) {
    if (site.conflictResolution === InjectorClass.prototype.key) {
      injector = new InjectorClass();
      break;
    }
  }
  if (!injector) {
    throw new Error(
      `Unsupported conflict resolution strategy ${site.conflictResolution}`
    );
  }
  injector.inject(windowAny);

  console.log("End inject", windowAny.ditec);
}

abstract class ConflictResolver {
  public abstract key: string;
  abstract inject(windowAny: { [key: string]: unknown }): void;
}

class ProxyConflictResolver extends ConflictResolver {
  public key = CONFLICT_RESOLUTION_IMMUTABLE_PROXY;
  inject(windowAny) {
    Promise.all([import("./proxy"), constructDitecX()]).then(
      ([{ wrapWithProxy }, ditecX]) => {
        windowAny.ditec = wrapWithProxy(ditecX);
      }
    );
  }
}

class ProxyOriginalRecorderConflictResolver extends ConflictResolver {
  public key = CONFLICT_RESOLUTION_PROXY_ORIGINAL;
  inject(windowAny) {
    Promise.all([import("./proxy"), constructDitecX()]).then(
      ([{ wrapWithProxy }, ditecX]) => {
        windowAny.ditec = wrapWithProxy(windowAny.ditec);
      }
    );
  }
}

class ReplaceOriginalConflictResolver extends ConflictResolver {
  public key = CONFLICT_RESOLUTION_REPLACE_ORIGINAL;
  inject(windowAny) {
    if (windowAny.ditec) {
      constructDitecX().then((ditecX) => {
        windowAny.ditec = ditecX;
      });
    }
  }
}
