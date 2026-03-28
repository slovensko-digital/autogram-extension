import { toSVG as bwipToSvg } from "@bwip-js/generic";

/**
 * Super small framework for inserting data into the DOM.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function $(selector: string): { el: HTMLElement; w: any; j: any } {
  const el = document.querySelector(`[\\$="${selector}"]`);
  const obj = { el };
  if (!el) {
    throw new Error(`Element with selector ${selector} not found`);
  }
  Object.defineProperty(obj, "w", {
    get: () => el,
    set: (value) => {
      el.innerHTML = value;
    },
  });

  Object.defineProperty(obj, "j", {
    set: (value) => {
      el.innerHTML = JSON.stringify(value, null, 2);
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return obj as any;
}

export function setText(selector: string, value: string) {
  $(selector).el.textContent = value;
}

export function appendLog(selector: string, value: string) {
  const el = $(selector).el;
  const current = el.textContent || "";
  el.textContent = current ? `${current}\n${value}` : value;
}

export function clearElement(selector: string) {
  $(selector).el.replaceChildren();
}

export function renderQrCode(selector: string, value: string) {
  const el = $(selector).el;
  el.innerHTML = bwipToSvg({
    bcid: "qrcode",
    text: value,
    scale: 6,
    width: 100,
    height: 100,
  });
}

export function showSignedPreview(viz: { mimeType: string; content: string }) {
  const container = document.createElement("div");
  if (viz.mimeType.match(/image\/.*/)) {
    const img = document.createElement("img");
    img.src = `data:${viz.mimeType};base64,${viz.content}`;
    container.appendChild(img);
    return container;
  }

  if (viz.mimeType === "application/pdf;base64") {
    const iframe = document.createElement("iframe");
    iframe.src = `data:application/pdf;base64,${viz.content}`;
    iframe.style.width = "100%";
    iframe.style.minHeight = "480px";
    container.appendChild(iframe);
    return container;
  }

  if (viz.mimeType.match(/^text\//) || viz.mimeType.endsWith("+xml;base64")) {
    const pre = document.createElement("pre");
    pre.textContent = atob(viz.content);
    container.appendChild(pre);
    return container;
  }

  const a = document.createElement("a");
  a.href = `data:${viz.mimeType};base64,${viz.content}`;
  a.download = guessDownloadName(viz.mimeType);
  a.textContent = `Download ${a.download}`;
  container.appendChild(a);
  return container;
}

export function downloadSignedDocument(
  payload: { mimeType: string; content: string; filename: string },
  fallbackExtension = "bin"
) {
  const a = document.createElement("a");
  a.href = `data:${payload.mimeType};base64,${payload.content}`;
  a.download = payload.filename || `signed-document.${fallbackExtension}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function guessDownloadName(mimeType: string) {
  if (mimeType === "application/vnd.etsi.asic-e+zip;base64") {
    return "signed-document.asice";
  }
  if (mimeType === "application/vnd.etsi.asic-s+zip;base64") {
    return "signed-document.asics";
  }
  return "signed-document.bin";
}