import { inject } from "../dbridge_js/inject-ditec";
import { createLogger } from "../log";
import {
  defaultOptionsStorage,
  ExtensionOptions,
  ExtensionOptionsString,
} from "../options/default";
import { captureException } from "../sentry";
import { maybeInsertUpvsJsFixes } from "../upvs-fixes";

const log = createLogger("ag-ext.ent.inject");
try {
  const windowAny = window as WindowWithDitec;

  const extensionOptionsPromise = new Promise<ExtensionOptions>((resolve) => {
    const handleEvent = (event: CustomEvent<ExtensionOptionsString>) => {
      resolve(JSON.parse(event.detail) as ExtensionOptions);
      window.removeEventListener("autogram-extension-options", handleEvent);
    };
    window.addEventListener("autogram-extension-options", handleEvent);
  });

  Promise.race([
    extensionOptionsPromise,
    new Promise<ExtensionOptions>((res) =>
      setTimeout(() => res(defaultOptionsStorage.options), 200)
    ),
  ]).then((extensionOptions) => {
    maybeInsertUpvsJsFixes(windowAny);
    inject(windowAny, extensionOptions);
  });
} catch (e) {
  captureException(e);
}

type WindowWithDitec = Window & { ditec?: object };
