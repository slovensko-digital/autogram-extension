/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { DSigXadesBpAdapter } from "./dsig-xades-bp-adapter";
import { DSigXadesAdapter } from "./dsig-xades-adapter";
import { DBridgeAutogramImpl } from "../autogram/autogram-implementation";

const implementation = new DBridgeAutogramImpl();

class DummyClass {}

const handler: ProxyHandler<object> = {
  set: function (target, prop, value) {
    console.log("dummy set", prop, value);
    return true;
  },

  get: function (target, prop, receiver) {
    console.log("dummy get", prop);
    return new Proxy(new DummyClass(), handler);
  },
};

/**
 * Object with same interface as `window.ditec` object used by dSigner
 */
export const ditecX = {
  isAutogram: true,
  config: {
    downloadPage: {
      url: "",
      title: "",
    },
  },
  utils: {
    ERROR_CANCELLED: 1,
    ERROR_GENERAL: -200,
    ERROR_NOT_INSTALLED: -201,
    ERROR_LAUNCH_FAILED: -202,
    ERROR_LAUNCH_FORBIDDEN: -203,
    isDitecError: function (error) {
      console.log("isDitecError", error);
      return true;
    },
    extendClass: function (...args) {
      console.log("extendClass", args);
    },
  },
  versions: {},
  dSigXadesJs: new DSigXadesAdapter(implementation),
  dSigXadesBpJs: new DSigXadesBpAdapter(implementation),
  // TODO: remove this and fix the errors from ditec using better proxy and by blocking the script (look into PR #70)
  DViewerDotNet: new Proxy(new DummyClass(), handler),
  DginaJava: new Proxy(new DummyClass(), handler),
  AbstractJsCore: new Proxy(new DummyClass(), handler),
};
