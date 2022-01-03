import { ditecX } from "./ditecx";

export function inject(windowAny: any): void {
  console.log("Start inject");
  console.log(ditec);
  console.log((window as any).ditec);
  console.log(windowAny.ditec);
  windowAny.ditec = ditecX;
}

declare let ditec: any;
