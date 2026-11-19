#!/usr/bin/env bash
# Builds the Safari (mv2) extension, archives the macOS and iOS apps and uploads
# them to App Store Connect. Does the same thing as Xcode's Product > Archive and
# Organizer > Distribute App.
#
# Usage: scripts/release-safari.sh <build-number> [--no-upload] [--only macos|ios]
#
#   <build-number>  CURRENT_PROJECT_VERSION; must be higher than the last build
#                   uploaded to App Store Connect (each app counts separately).
#   --no-upload     only archive (the archives show up in Xcode Organizer).
#   --only          archive/upload just one of the two apps.
#
# The marketing version is taken from package.json. Signing uses the Apple ID
# signed in to Xcode (Settings > Accounts) with automatic signing.
set -euo pipefail

usage() { sed -n '6,11p' "$0" | sed 's/^# \{0,1\}//'; exit 1; }

BUILD_NUMBER="${1:-}"
[[ "$BUILD_NUMBER" =~ ^[0-9]+$ ]] || usage
shift

UPLOAD=1
ONLY=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-upload) UPLOAD=0 ;;
    --only) ONLY="${2:-}"; shift ;;
    *) usage ;;
  esac
  shift
done

cd "$(dirname "$0")/.."

VERSION=$(node -p "require('./package.json').version")
PROJECT="safari/autogram-extension/autogram-extension.xcodeproj"
TEAM_ID="44U4JSRX4Z"
ARCHIVE_DIR="$HOME/Library/Developer/Xcode/Archives/$(date +%Y-%m-%d)"
WORK_DIR="build/safari/$VERSION-$BUILD_NUMBER"

echo "==> Safari release $VERSION ($BUILD_NUMBER)"

# 1. Version and build number for all four targets (app + extension, macOS + iOS)
sed -i '' -E \
  -e "s/MARKETING_VERSION = [^;]+;/MARKETING_VERSION = $VERSION;/" \
  -e "s/CURRENT_PROJECT_VERSION = [^;]+;/CURRENT_PROJECT_VERSION = $BUILD_NUMBER;/" \
  "$PROJECT/project.pbxproj"

# 2. mv2 build into dist/. Xcode bundles dist/ as it is, and Safari doesn't
#    support the mv3 background service worker.
(cd .. && npm run build:sdk)
npm run build:prod:safari
MANIFEST_VERSION=$(node -p "require('./dist/manifest.json').manifest_version")
[[ "$MANIFEST_VERSION" == "2" ]] || { echo "dist/ is not an mv2 build" >&2; exit 1; }

# 3. Archive, then export with destination=upload (= Distribute App > App Store Connect)
mkdir -p "$ARCHIVE_DIR" "$WORK_DIR"
cat > "$WORK_DIR/ExportOptions.plist" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>method</key><string>app-store-connect</string>
  <key>destination</key><string>upload</string>
  <key>teamID</key><string>$TEAM_ID</string>
  <key>signingStyle</key><string>automatic</string>
  <key>manageAppVersionAndBuildNumber</key><false/>
  <key>uploadSymbols</key><true/>
</dict>
</plist>
EOF

release() {
  local scheme="$1" platform="$2"
  local archive="$ARCHIVE_DIR/$scheme $VERSION ($BUILD_NUMBER).xcarchive"

  echo "==> Archiving $scheme ($platform)"
  xcodebuild archive \
    -project "$PROJECT" \
    -scheme "$scheme" \
    -configuration Release \
    -destination "generic/platform=$platform" \
    -archivePath "$archive" \
    -allowProvisioningUpdates

  if [[ "$UPLOAD" == "1" ]]; then
    echo "==> Uploading $scheme to App Store Connect"
    xcodebuild -exportArchive \
      -archivePath "$archive" \
      -exportOptionsPlist "$WORK_DIR/ExportOptions.plist" \
      -exportPath "$WORK_DIR/$platform" \
      -allowProvisioningUpdates
  fi
}

if [[ -z "$ONLY" || "$ONLY" == "macos" ]]; then release "autogram-extension" "macOS"; fi
if [[ -z "$ONLY" || "$ONLY" == "ios" ]]; then release "autogram-extension iOS" "iOS"; fi

echo "==> Done: $VERSION ($BUILD_NUMBER). Commit $PROJECT/project.pbxproj."
