#!/usr/bin/env node
// Fetches the inline D.Bridge signing driver of
// https://obcan.justice.sk/podpisovanie-dokumentov for the portal contract
// tests (src/dbridge_js/ditecx/portal-justice.test.ts).
//
// Unlike the other checksums.txt entries the driver has no static URL: the
// portal renders it inline into the response of the document-upload POST,
// with fresh object/signature/dataEnvelope UUIDs on every upload. This
// script replays the upload with a canned `sample.pdf`, extracts the single
// inline <script> that drives `window.ditec`, and pins the per-session
// UUIDs to fixed values so the fixture is byte-stable across fetches.
//
// Usage: node scripts/fetch-justice-driver.mjs <target-file>
// Invoked by fetch-portal-fixtures.sh / check-portal-drift.sh for manifest
// entries with the `justice-upload:` pseudo-scheme.

import fs from "node:fs";

const PAGE = "https://obcan.justice.sk/podpisovanie-dokumentov";
const PORTLET =
  "p_p_id=eZalobySignForm_WAR_ressezaloby&p_p_lifecycle=1&p_p_state=normal" +
  "&p_p_mode=view&p_p_col_id=column-2&p_p_col_count=1" +
  "&_eZalobySignForm_WAR_ressezaloby_action=sign";

// Minimal valid single-page PDF; the driver script itself never embeds the
// document (the page delivers it via the #sourcePdf input), the upload just
// has to pass the portal's file-type detection.
const SAMPLE_PDF = [
  "%PDF-1.4",
  "1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj",
  "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj",
  "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj",
  "xref",
  "0 4",
  "0000000000 65535 f ",
  "0000000009 00000 n ",
  "0000000052 00000 n ",
  "0000000101 00000 n ",
  "trailer<</Size 4/Root 1 0 R>>",
  "startxref",
  "164",
  "%%EOF",
  "",
].join("\n");

// Values the portal generates per upload session, pinned so the fixture
// checksum is stable. Tests may rely on these exact values.
const PINNED_SESSION_VARS = {
  objectId: "11111111-1111-1111-1111-111111111111",
  signatureId: "22222222-2222-2222-2222-222222222222",
  dataEnvelopeId: "33333333-3333-3333-3333-333333333333",
};

function fail(message) {
  console.error(`fetch-justice-driver: ${message}`);
  process.exit(2);
}

const target = process.argv[2];
if (!target) fail("usage: fetch-justice-driver.mjs <target-file>");

// 1. GET the landing page for a session cookie and its p_auth CSRF token.
const landing = await fetch(PAGE);
if (!landing.ok) fail(`GET ${PAGE} failed: ${landing.status}`);
const cookie = landing.headers
  .getSetCookie()
  .map((c) => c.split(";")[0])
  .join("; ");
const landingHtml = await landing.text();
const pAuth = /p_auth=([A-Za-z0-9]+)/.exec(landingHtml)?.[1];
if (!pAuth) fail("could not find p_auth token on the landing page");

// 2. Upload sample.pdf; the response embeds the signing driver inline.
const form = new FormData();
form.append(
  "file",
  new Blob([SAMPLE_PDF], { type: "application/pdf" }),
  "sample.pdf"
);
const signResponse = await fetch(`${PAGE}?p_auth=${pAuth}&${PORTLET}`, {
  method: "POST",
  headers: { cookie },
  body: form,
});
if (!signResponse.ok) fail(`upload POST failed: ${signResponse.status}`);
const signHtml = await signResponse.text();

// 3. Extract the one inline script that talks to window.ditec.
const drivers = [...signHtml.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]
  .map((m) => m[1])
  .filter((s) => s.includes("ditec."));
if (drivers.length !== 1) {
  fail(
    `expected exactly 1 inline ditec driver script, found ${drivers.length}` +
      " — the portal page layout changed (or it rejected the upload);" +
      " review the page and update this script"
  );
}

// 4. Pin the per-session UUIDs.
let replaced = 0;
const normalized = drivers[0].replace(
  /(var (objectId|signatureId|dataEnvelopeId) = ')[^']*(')/g,
  (match, head, name, tail) => {
    replaced++;
    return head + PINNED_SESSION_VARS[name] + tail;
  }
);
if (replaced !== 3) {
  fail(
    `expected to pin 3 session variables, pinned ${replaced}` +
      " — the driver's variable declarations changed; update this script"
  );
}

fs.writeFileSync(target, normalized);
