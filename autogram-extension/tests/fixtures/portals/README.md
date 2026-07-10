# Portal fixtures

The contract tests in `src/dbridge_js/ditecx/portal-*.test.ts` replay the
signing driver scripts that production government portals run against
`window.ditec`, so the tests exercise the exact call choreography (argument
order, callback conventions, error branching) the live portals use — without
logging in anywhere.

The scripts themselves are **not vendored** in this repository: they are the
property of their respective portal operators (NASES / slovensko.sk) and we
do not redistribute them. Download them on demand:

```sh
npm run fetch:portal-fixtures
```

This fetches every entry of `checksums.txt` that has a local fixture name
into this directory (gitignored) and verifies it against the recorded
checksum. Without the download, the tests that need a fixture **skip** with
a pointer to this file.

| Fixture | Source | Written against |
| --- | --- | --- |
| `DSignerMulti-20250601.js` | <https://schranka.slovensko.sk/Content/jscript/DSignerMulti.js?v=20250601> | fetched 2026-07-10 |

The manifest also tracks the D.Bridge library scripts (not downloaded as
fixtures) purely for drift detection.

## Drift check

`npm run test:portal-drift` (`scripts/check-portal-drift.sh`) re-downloads
all manifest entries and fails when any hash changed. Run it periodically
(or in a scheduled CI job); when it fails, the portal changed its signer
code — review the diff, update the contract tests if the choreography
changed, then update `checksums.txt`.

When bumping a fixture, keep the date suffix in the filename in sync with
the `?v=` query parameter (or fetch date) so it is obvious which portal
version the tests were written against.
