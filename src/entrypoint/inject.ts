import { createUI } from "../content-ui";
import { inject } from "../dbridge_js/inject-ditec";

type WindowWithDitec = Window & { ditec?: object };

const windowAny = window as WindowWithDitec;

inject(windowAny);

console.log("inject");

createUI();


// eslint-disable-next-line no-debugger
// debugger;
