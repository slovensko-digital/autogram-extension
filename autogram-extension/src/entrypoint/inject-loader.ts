const OPTIONS_EVENT_NAME = "autogram-extension-options";

let moduleLoaded = false;
let pendingOptionsDetail: string | undefined;

window.addEventListener(OPTIONS_EVENT_NAME, (event) => {
  if (moduleLoaded) {
    return;
  }

  const customEvent = event as CustomEvent<string>;
  pendingOptionsDetail = customEvent.detail;
});

const currentScript = document.currentScript as HTMLScriptElement | null;
const injectModuleUrl = currentScript?.getAttribute("data-autogram-inject-url");

if (!injectModuleUrl) {
  throw new Error("Missing data-autogram-inject-url on inject loader script");
}

import(injectModuleUrl)
  .then(() => {
    moduleLoaded = true;
    if (pendingOptionsDetail === undefined) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent<string>(OPTIONS_EVENT_NAME, {
        detail: pendingOptionsDetail,
      })
    );
  })
  .catch((error) => {
    console.error("Autogram inject loader failed to import module", error);
  });
