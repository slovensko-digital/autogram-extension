import { createLogger } from "../log";

const log = createLogger("ag-ext.immutable-ditec");

/**
 * Read-only facade over our `window.ditec` replacement, for portals that
 * load their own D.Bridge scripts after we have installed ours (lazily
 * loading SPAs like esluzby.socpoist.sk, or a race on obcan.justice.sk).
 *
 * Every write through the facade — assignment, `Object.defineProperty`,
 * `delete`, prototype change — is rejected, on `ditec` itself and on the
 * objects directly under it (`ditec.utils`, `ditec.config`, the
 * `dSigXades*Js` adapters, …). The trap returns `false`, so:
 *
 * - non-strict page code (e.g. `ditec.config.downloadPage = {…}` in the
 *   justice.sk driver) carries on and the write is silently dropped;
 * - the D.Bridge library scripts, which are all `'use strict'`, throw a
 *   TypeError at their first write (`ditec.versions = ditec.versions || {}`)
 *   and stop before installing anything.
 *
 * Rejecting *additions* matters as much as rejecting overwrites: if
 * `dSigXadesExtender.min.js` could add `ditec.dSigXadesExtenderJs`,
 * portals that probe for optional components (SP's ASiC attachment join)
 * would pick up the original D.Launcher component and fail with DB206.
 *
 * Reads are not intercepted beyond wrapping the direct child objects, which
 * are cached so identity is stable (`ditec.utils === ditec.utils`). Values
 * deeper down are returned as-is. Note that adapter methods called through
 * the facade run with `this` bound to the facade, so adapters must not
 * assign to their own properties after construction (they keep mutable
 * state in their implementation object, which is not guarded).
 */
export function immutableDitec<T extends object>(ditec: T): T {
  const children = new WeakMap<object, object>();

  const childHandler: ProxyHandler<object> = {
    set: (_target, prop) => rejected("set", prop),
    defineProperty: (_target, prop) => rejected("defineProperty", prop),
    deleteProperty: (_target, prop) => rejected("deleteProperty", prop),
    setPrototypeOf: () => rejected("setPrototypeOf"),
  };

  const rootHandler: ProxyHandler<object> = {
    ...childHandler,
    get(target, prop) {
      const value = Reflect.get(target, prop, target);
      if (value === null || typeof value !== "object") {
        return value;
      }
      const cached = children.get(value);
      if (cached) {
        return cached;
      }
      const child = new Proxy(value, childHandler);
      children.set(value, child);
      return child;
    },
  };

  return new Proxy(ditec, rootHandler) as T;
}

function rejected(operation: string, prop?: PropertyKey): false {
  log.debug(
    `rejected ${operation} on ditec`,
    prop === undefined ? "" : String(prop)
  );
  return false;
}
