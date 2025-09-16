import { constructDitecX } from "./ditecx/ditecx";
import {
  CONFLICT_RESOLUTION_IMMUTABLE_PROXY,
  CONFLICT_RESOLUTION_PROXY_ORIGINAL,
  CONFLICT_RESOLUTION_REPLACE_ORIGINAL,
  supportedSites,
} from "../supported-sites";
import { createLogger } from "../log";

const log = createLogger("ag-ext.inject-ditec");

type OriginalDitec = object;

export function inject(windowAny: {
  ditec?: OriginalDitec;
  location: Location;
}): void {
  log.debug("inject-ditec", {
    windowIsTop: window.top === window,
  });
  log.debug("Start inject", {
    manifestVersion: __MANIFEST_VERSION__,
    commitHash: __COMMIT_HASH__,
  });
  log.debug("original ditec", windowAny.ditec);

  const site = supportedSites.matchUrl(windowAny.location.href);

  let conflictResolver: ConflictResolver | null = null;
  for (const ConflictResolverClass of [
    ProxyConflictResolver,
    ReplaceOriginalConflictResolver,
    ProxyOriginalRecorderConflictResolver,
  ]) {
    if (site.conflictResolution === ConflictResolverClass.key) {
      conflictResolver = new ConflictResolverClass();
      break;
    }
  }
  if (!conflictResolver) {
    throw new Error(
      `Unsupported conflict resolution strategy ${site.conflictResolution}`
    );
  }
  conflictResolver.inject(windowAny);

  log.debug("End inject", windowAny.ditec);
}

abstract class ConflictResolver {
  public static readonly key: string;
  abstract inject(windowAny: { [key: string]: unknown }): void;
}

class ProxyConflictResolver extends ConflictResolver {
  public static readonly key = CONFLICT_RESOLUTION_IMMUTABLE_PROXY;
  inject(windowAny) {
    Promise.all([import("./proxy"), constructDitecX()]).then(
      ([{ wrapWithProxy }, ditecX]) => {
        windowAny.ditec = wrapWithProxy(ditecX);
      }
    );
  }
}

class ProxyOriginalRecorderConflictResolver extends ConflictResolver {
  public static readonly key = CONFLICT_RESOLUTION_PROXY_ORIGINAL;
  inject(windowAny) {
    import("./proxy").then(({ wrapWithProxy }) => {
      windowAny.ditec = wrapWithProxy(windowAny.ditec);
    });
  }
}

class ReplaceOriginalConflictResolver extends ConflictResolver {
  public static readonly key = CONFLICT_RESOLUTION_REPLACE_ORIGINAL;
  inject(windowAny) {
    if (windowAny.ditec) {
      constructDitecX().then((ditecX) => {
        windowAny.ditec = ditecX;
      });
    } else {
      log.info("No original ditec to replace");
    }
  }
}
