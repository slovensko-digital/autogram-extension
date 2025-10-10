import { createLogger } from "../log";

const log = createLogger("ag-ext.ent.redirect");

setTimeout(function () {
  window.location.assign("https://autogram.slovensko.digital/ext/is-autogram-missing");
}, 20000);

log.info("opening autogram://listen?protocol=http&host=localhost&port=37200&origin=*&language=sk")

window.location.assign(
  "autogram://listen?protocol=http&host=localhost&port=37200&origin=*&language=sk"
);
