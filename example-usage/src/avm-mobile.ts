import { AutogramVMobileSimulation } from "../../src/avm-api/lib/apiClient-mobile";

const avmClient = new AutogramVMobileSimulation();

async function openQRCodeUrl() {
  const urlString = ($("qrCodeUrl").el as HTMLInputElement).value;
  avmClient.parseUrl(urlString);
  const viz = await avmClient.visualizeDocument();
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
    a.download = "download";
    a.style.maxHeight = "400px";
    vizEl.appendChild(a);
  }
  $("qrCodeUrlResult").el.appendChild(vizEl);
}

async function signWithQRCode() {
  await avmClient.signDocument();
}

// https://autogram.slovensko.digital/api/v1/qr-code?guid=4f4075b7-1095-46c3-9553-5db8407aca13&key=TI72nLRygaTfBh8npSNREL6P2rQqQIJrpfpaAHWSBrw%3D&pushkey=zJ1s%2Bk0B8Ge7UZT%2FN%2BfM39liJ4FIBh%2BjMmmM3Gi9m7Y%3D&integration=eyJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJkZXZpY2UiLCJzdWIiOiIxOGQ5NDY5Zi0yMGM5LTRkMDYtOGZiNi03NDU0ZGE5MDk2NzciLCJleHAiOjE3MTUwMzUxNDEsImp0aSI6IjRlZTc3MzlhLWZhNjQtNDlhNi04MTk1LWQzYTA4Mzc3MzMxMyJ9.a_qNYWgrx_cEuLDLWBl-KbT_Awbm8xMVE-QjKB0vvYquO9ac6AHFssfupV8CT2Vx4FR8yFIdL2oQ_txzOu5kPw

globalThis["openQRCodeUrl"] = openQRCodeUrl;
globalThis["signWithQRCode"] = signWithQRCode;
