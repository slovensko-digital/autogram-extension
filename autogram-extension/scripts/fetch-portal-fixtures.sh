#!/usr/bin/env bash
# Downloads the portal signer scripts used by the portal contract tests
# (src/dbridge_js/ditecx/portal-*.test.ts). They are NOT vendored in the
# repo — they belong to the portal operators — so fetch them on demand.
#
# Downloads every manifest entry with a local fixture name and verifies it
# against the recorded checksum. A mismatch means the portal changed its
# signer code since the tests were written: the file is kept (so tests run
# against the live version) but the drift is reported and the exit code is 1.
set -u

cd "$(dirname "$0")/.."
FIXTURE_DIR="tests/fixtures/portals"
MANIFEST="$FIXTURE_DIR/checksums.txt"
STATUS=0

while read -r expected url fixture; do
  case "$expected" in ""|\#*) continue ;; esac
  [ "$fixture" = "-" ] && continue

  target="$FIXTURE_DIR/$fixture"
  case "$url" in
    justice-upload:*)
      # No static URL: the driver is extracted from an upload POST response
      # and normalized to a stable checksum by the node script.
      if ! node scripts/fetch-justice-driver.mjs "$target"; then
        echo "ERROR: failed to fetch $url" >&2
        STATUS=2
        continue
      fi
      ;;
    *)
      if ! curl --fail --silent --show-error --location -o "$target" "$url"; then
        echo "ERROR: failed to download $url" >&2
        STATUS=2
        continue
      fi
      ;;
  esac

  actual=$(shasum -a 256 "$target" | cut -d' ' -f1)
  if [ "$actual" != "$expected" ]; then
    echo "DRIFT: $fixture no longer matches the version the tests were written against"
    echo "  url      $url"
    echo "  expected $expected"
    echo "  actual   $actual"
    echo "  → the file was kept; review the portal's changes, update the"
    echo "    contract tests if needed, then update $MANIFEST"
    [ "$STATUS" -eq 0 ] && STATUS=1
  else
    echo "ok: $fixture"
  fi
done < "$MANIFEST"

exit "$STATUS"
