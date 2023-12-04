/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { DSigXadesBpAdapter } from "./dsig-xades-bp-adapter";
import { DSigXadesAdapter } from "./dsig-xades-adapter";
import { DBridgeAutogramImpl } from "./autogram-implementation";

const implementation = new DBridgeAutogramImpl();

export const ditecX = {
  isAutogram: true,
  config: {
    downloadPage: {
      url: "",
      title: "",
    },
  },
  versions: {},
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
    extendClass: /* TODO */ function (child, parent) {
      console.log("extendClass", child, parent);
      const F = function () {};
      F.prototype = parent.prototype;
      child.prototype = new F();
      child._superClass = parent.prototype;
      child.prototype.constructor = child;
      for (const member in child) {
        child.prototype[member] = child[member];
      }
      for (const member in parent) {
        child[member] = parent[member];
        child.prototype[member] = parent[member];
      }
    },
    ChainedCallback: /* TODO */ function (callback) {},
  },
  dSigXadesJs: new DSigXadesAdapter(implementation),
  dSigXadesBpJs: new DSigXadesBpAdapter(implementation),

  /* TODO */
  dSigXadesExtenderJs: new DSigXadesAdapter(implementation),

  dCommon: {
    /* TODO */
  },
  detectSupportedPlatforms: function () {
    /* TODO */
  },
  AbstractLauncherWrapper: function () {
    /* TODO */
  },
  DSigXadesDLauncherJava: function () {
    /* TODO */
  },
  DSigXadesExtenderDLauncherJava: function () {
    /* TODO */
  },
  AbstractJsCore: function () {
    /* TODO */
  },
  AbstractDotNetWrapper: function () {
    /* TODO */
  },
  dLauncher: {},
};
