/**
 * @module demo
 * Self-running demo entry: renders a file input and signs the chosen file
 * with `createAutogramClient` (XAdES in an ASiC-E container), then offers
 * the result for download. Loaded by the pages in `demos/` — not part of
 * the public API.
 */
import { createAutogramClient } from "./with-ui";

async function main() {
  const client = await createAutogramClient();
  const filePicker = document.createElement("input");
  filePicker.type = "file";
  filePicker.addEventListener("change", async (e) => {
    const file = filePicker.files?.[0];
    if (!file) return;

    const signed = await client.sign(
      {
        content: await file.text(),
        mimeType: file.type,
        filename: file.name,
      },
      {
        level: "XAdES_BASELINE_B",
        container: "ASiC_E",
      }
    );

    console.log(signed);

    const a = document.createElement("a");
    const blob = new Blob([signed.content], {
      type: signed.mimeType,
    });
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `${file.name}.asice`;
    a.text = `Download ${a.download}`;
    document.body.appendChild(a);
  });

  document.body.appendChild(filePicker);
}

main().then(
  () => console.log("done"),
  (err) => console.error(err)
);
