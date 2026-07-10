#!/usr/bin/env bash
# Detects when government portals change the signer scripts our D.Bridge
# shim (and the contract tests in src/dbridge_js/ditecx/) were written
# against. Compares live downloads against tests/fixtures/portals/checksums.txt.
#
# Exit codes: 0 = no drift, 1 = drift detected, 2 = download failure.
set -u

cd "$(dirname "$0")/.."
MANIFEST="tests/fixtures/portals/checksums.txt"
STATUS=0

while read -r expected url fixture; do
  case "$expected" in ""|\#*) continue ;; esac

  actual=$(curl --fail --silent --show-error --location "$url" | shasum -a 256 | cut -d' ' -f1)
  if [ -z "$actual" ]; then
    echo "ERROR: failed to download $url" >&2
    STATUS=2
    continue
  fi

  if [ "$actual" != "$expected" ]; then
    echo "DRIFT: $url"
    echo "  expected $expected"
    echo "  actual   $actual"
    if [ "$fixture" != "-" ]; then
      echo "  → re-review the diff against tests/fixtures/portals/$fixture," \
        "update the fixture + checksums, re-run the contract tests"
    else
      echo "  → re-review the script (see scratchpad workflow in" \
        "tests/fixtures/portals/README.md), update checksums"
    fi
    [ "$STATUS" -eq 0 ] && STATUS=1
  else
    echo "ok: $url"
  fi
done < "$MANIFEST"

exit "$STATUS"
