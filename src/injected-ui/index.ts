import "./main"; // Use lit html components
import { AutogramRoot } from "./main";

export function createUI(): AutogramRoot {
  const root = document.createElement("autogram-root");
  document.body.appendChild(root);

  return root as AutogramRoot;
}

export { AutogramRoot };
export { SigningMethod } from "./main";