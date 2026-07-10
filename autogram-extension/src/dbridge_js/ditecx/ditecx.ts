/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { DSigXadesBpAdapter } from "./dsig-xades-bp-adapter";
import { DSigXadesAdapter } from "./dsig-xades-adapter";
import { DBridgeAutogramImpl } from "../autogram/autogram-implementation";
import { createLogger } from "../../log";
import {
  defaultOptionsStorage,
  ExtensionOptions,
} from "../../options/default";
import { DitecErrorCodes, isDitecError } from "./types";

const log = createLogger("ag-ext.ditecx");

class DummyClass {}

/**
 * Inert stand-in for Ditec internals (`AbstractJsCore`, `DginaJava`, …)
 * that original component scripts touch when they evaluate after our
 * replacement (`ditec.AbstractJsCore.call(this, …)`,
 * `spiMap[ditec.AbstractJsCore.PLATFORM_JAVA] = …`). The target is a
 * function and apply/construct are trapped so those calls are absorbed
 * instead of throwing. Coercion and promise-protocol keys return
 * primitives/undefined so dummies never break string conversion or get
 * treated as thenables.
 */
const handler: ProxyHandler<object> = {
  set: function (target, prop, value) {
    log.debug("dummy set", prop, value);
    return true;
  },

  get: function (target, prop, receiver) {
    log.debug("dummy get", prop);
    if (prop === Symbol.toPrimitive || prop === "then" || prop === "toJSON") {
      return undefined;
    }
    if (prop === "toString" || prop === "valueOf") {
      return () => "[AutogramDitecDummy]";
    }
    return makeDummy();
  },

  apply: function (target, thisArg, argumentList) {
    log.debug("dummy apply", argumentList);
    return makeDummy();
  },

  construct: function (target, argumentList) {
    log.debug("dummy construct", argumentList);
    return makeDummy();
  },
};

function makeDummy(): DummyClass {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  return new Proxy(function () {}, handler);
}

export type DitecX = {
  isAutogram: boolean;
  config: {
    downloadPage: {
      url: string;
      title: string;
    };
  };
  utils: {
    ERROR_CANCELLED: number;
    ERROR_GENERAL: number;
    ERROR_NOT_INSTALLED: number;
    ERROR_LAUNCH_FAILED: number;
    ERROR_LAUNCH_FORBIDDEN: number;
    isDitecError: (error: unknown) => boolean;
    extendClass: (...args: unknown[]) => void;
  };
  versions: object;
  dSigXadesJs: DSigXadesAdapter;
  dSigXadesBpJs: DSigXadesBpAdapter;
  DViewerDotNet: DummyClass;
  DginaJava: DummyClass;
  AbstractJsCore: DummyClass;
};

export async function constructDitecX(
  autogramOptions: ExtensionOptions = defaultOptionsStorage.options
) {
  const implementation = await DBridgeAutogramImpl.init(autogramOptions);

  /**
   * Object with same interface as `window.ditec` object used by dSigner
   */
  const ditecX: DitecX = {
    isAutogram: true,
    config: {
      downloadPage: {
        url: "",
        title: "",
      },
    },
    utils: {
      ...DitecErrorCodes,
      // Same check as the real ditec.utils.isDitecError; our adapter edge
      // guarantees every error it emits carries name === "DitecError".
      isDitecError: function (error) {
        log.debug("isDitecError", error);
        return isDitecError(error);
      },
      extendClass: function (...args) {
        log.debug("extendClass", args);
      },
    },
    versions: {},
    dSigXadesJs: new DSigXadesAdapter(implementation),
    dSigXadesBpJs: new DSigXadesBpAdapter(implementation),
    // TODO: remove this and fix the errors from ditec using better proxy and by blocking the script (look into PR #70)
    DViewerDotNet: makeDummy(),
    DginaJava: makeDummy(),
    AbstractJsCore: makeDummy(),
  };
  log.debug("ditecX", ditecX);
  return ditecX;
}
