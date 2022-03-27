/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { DSigXadesBpAdapter } from "./dsig-xades-bp-adapter";
import { DSigXadesAdapter } from "./dsig-xades-adapter";
import { DBridgeOctosignImpl } from "./implementation";

const implementation = new DBridgeOctosignImpl();

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
  },
  dSigXadesJs: new DSigXadesAdapter(implementation),
  dSigXadesBpJs: new DSigXadesBpAdapter(implementation),
};
