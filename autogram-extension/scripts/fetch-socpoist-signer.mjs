#!/usr/bin/env node
// Fetches SignerService.js of the new Sociálna poisťovňa portal
// (https://esluzby.socpoist.sk/moj-portal/) for the portal contract tests
// (src/dbridge_js/ditecx/portal-socpoist.test.ts).
//
// The script has no static URL: the Nuxt app embeds it as a base64
// `data:text/javascript` URL in one of its content-hashed `_nuxt/*.js`
// chunks (the "Podpisovac" component, which loads it together with the
// slovensko.sk D.Bridge v1.0 scripts when a signature is requested). The
// chunk name changes with every portal deploy, so this script walks the
// chunks referenced from the portal page, finds the one embedding
// SignerService and decodes it. The decoded script itself is byte-stable
// until SP changes its signing code.
//
// Usage: node scripts/fetch-socpoist-signer.mjs <target-file>
// Invoked by fetch-portal-fixtures.sh / check-portal-drift.sh for manifest
// entries with the `socpoist-signer:` pseudo-scheme.

import { Buffer } from "node:buffer";
import fs from "node:fs";
import process from "node:process";

const ORIGIN = "https://esluzby.socpoist.sk";
const PAGE = `${ORIGIN}/moj-portal/`;
const DATA_URL = /data:text\/javascript;base64,([A-Za-z0-9+/=]+)/g;

function fail(message) {
  console.error(`fetch-socpoist-signer: ${message}`);
  process.exit(2);
}

async function text(url) {
  const response = await fetch(url);
  if (!response.ok) fail(`${url} → HTTP ${response.status}`);
  return response.text();
}

const target = process.argv[2];
if (!target) fail("usage: fetch-socpoist-signer.mjs <target-file>");

const page = await text(PAGE);
const chunks = [
  ...new Set(page.match(/\/moj-portal\/_nuxt\/[A-Za-z0-9_-]+\.js/g) ?? []),
];
if (chunks.length === 0) fail(`no _nuxt chunks referenced from ${PAGE}`);

for (const chunk of chunks) {
  const source = await text(ORIGIN + chunk);
  if (!source.includes("data:text/javascript;base64,")) continue;
  for (const [, base64] of source.matchAll(DATA_URL)) {
    const script = Buffer.from(base64, "base64").toString("utf-8");
    if (script.includes("var SignerService = {")) {
      fs.writeFileSync(target, script);
      process.exit(0);
    }
  }
}
fail(`SignerService not found in ${chunks.length} chunks of ${PAGE}`);
