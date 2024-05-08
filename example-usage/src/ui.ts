/**
 * Super small framework for inserting data into the DOM
 * @param {*} selector
 * @returns
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
      el.innerHTML = JSON.stringify(value);
    },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return obj as any;
}

export function visualizeDocument(viz: { mimeType: string; content: string }) {
  const vizEl = document.createElement("div");
  if (viz.mimeType.match(/image\/.*/)) {
    const img = document.createElement("img");
    img.src = `data:${viz.mimeType};base64,${viz.content}`;
    img.style.maxHeight = "400px";
    vizEl.appendChild(img);
  } else if (viz.mimeType.match(/text\/.*/)) {
    const pre = document.createElement("pre");
    pre.innerText = atob(viz.content);
    pre.style.maxHeight = "400px";
    vizEl.appendChild(pre);
  } else {
    // download button
    const a = document.createElement("a");
    a.href = `data:${viz.mimeType};base64,${viz.content}`;
    a.download =
      viz.mimeType === "application/vnd.etsi.asic-e+zip"
        ? "download.asice"
        : "download";
    a.style.maxHeight = "400px";
    a.innerHTML = "Download";
    vizEl.appendChild(a);
  }
  return vizEl;
}
