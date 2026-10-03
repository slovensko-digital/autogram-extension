/**
 * @module demo
 * Self-running demo entry: renders a file input and signs the chosen file
 * with `createAutogramClient` (XAdES in an ASiC-E container), then offers
 * the result for download. Choosing several files signs them together into
 * one ASiC-E container (Autogram desktop app >= 2.8.0). Loaded by the pages in `demos/` — not part of
 * the public API.
 */
import { Base64 } from "js-base64";
import { createAutogramClient } from "./with-ui";

async function main() {
  const client = await createAutogramClient();
  const filePicker = document.createElement("input");
  filePicker.type = "file";
  filePicker.multiple = true;
  filePicker.addEventListener("change", async () => {
    const files = Array.from(filePicker.files ?? []);
    if (files.length === 0) return;
    const [file] = files;

    const signed = await client.sign(
      await Promise.all(
        files.map(async (f) => ({
          // read as bytes: File.text() would corrupt binary files (PDF, …)
          content: Base64.fromUint8Array(new Uint8Array(await f.arrayBuffer())),
          mimeType: f.type || "application/octet-stream",
          encoding: "base64" as const,
          filename: f.name,
        }))
      ),
      {
        form: "XAdES",
        container: "ASiC_E",
      }
    );

    console.log(signed);

    const a = document.createElement("a");
    const blob = new Blob(
      [
        signed.encoding === "base64"
          ? Base64.toUint8Array(signed.content)
          : signed.content,
      ],
      {
        type: signed.mimeType,
      }
    );
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
