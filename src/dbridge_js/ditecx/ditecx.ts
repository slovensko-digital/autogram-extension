/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { DSigXadesBpAdapter } from "./dsig-xades-bp-adapter";
import { DSigXadesAdapter } from "./dsig-xades-adapter";
import { DBridgeAutogramImpl } from "../autogram/autogram-implementation";

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
  };
  dSigXadesJs: DSigXadesAdapter;
  dSigXadesBpJs: DSigXadesBpAdapter;
};

export async function constructDitecX() {
  const implementation = await DBridgeAutogramImpl.init();

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
  console.log("ditecX", ditecX);
  return ditecX;
}
