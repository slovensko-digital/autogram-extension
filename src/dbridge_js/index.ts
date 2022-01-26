import { logMessage } from "../audit/inject";
import { ditecX } from "./ditecx";

export function inject(windowAny: any): void {
  console.log("Start inject");
  console.log(windowAny.ditec);
  if (!windowAny.ditec) {
    logMessage({ type: "error", msg: "ditec missing" });
  }

  // setInterval(() => {
  //   logMessage("ping");
  // }, 1000);

  windowAny.ditec = ditecX;
}

declare let ditec: any;
