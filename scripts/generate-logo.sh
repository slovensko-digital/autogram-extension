#!/bin/sh

# Generate extension logos
for s in 16 32 64 128 256 512
do
  inkscape --export-background-opacity=0 --export-width=$s --export-type=png --export-filename="./src/static/logo-$s.png" ./src/img/728933_document_edit_file_page_paper_icon.svg ;
done

# Generate iOS and macOS app icons
ICON_DIR="./safari/autogram-extension/autogram-extension/Assets.xcassets/AppIcon.appiconset"
SVG_SOURCE="./src/img/728933_document_edit_file_page_paper_icon_with_bg.svg"

# iOS iPhone icons
inkscape --export-background-opacity=0 --export-width=40 --export-type=png --export-filename="$ICON_DIR/ios-icon-20@2x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=60 --export-type=png --export-filename="$ICON_DIR/ios-icon-20@3x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=58 --export-type=png --export-filename="$ICON_DIR/ios-icon-29@2x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=87 --export-type=png --export-filename="$ICON_DIR/ios-icon-29@3x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=80 --export-type=png --export-filename="$ICON_DIR/ios-icon-40@2x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=120 --export-type=png --export-filename="$ICON_DIR/ios-icon-40@3x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=120 --export-type=png --export-filename="$ICON_DIR/ios-icon-60@2x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=180 --export-type=png --export-filename="$ICON_DIR/ios-icon-60@3x.png" "$SVG_SOURCE"

# iOS iPad icons
inkscape --export-background-opacity=0 --export-width=20 --export-type=png --export-filename="$ICON_DIR/ios-icon-20@1x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=29 --export-type=png --export-filename="$ICON_DIR/ios-icon-29@1x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=40 --export-type=png --export-filename="$ICON_DIR/ios-icon-40@1x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=76 --export-type=png --export-filename="$ICON_DIR/ios-icon-76@1x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=152 --export-type=png --export-filename="$ICON_DIR/ios-icon-76@2x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=167 --export-type=png --export-filename="$ICON_DIR/ios-icon-83.5@2x.png" "$SVG_SOURCE"

# iOS Marketing icon
inkscape --export-background-opacity=0 --export-width=1024 --export-type=png --export-filename="$ICON_DIR/ios-icon-1024@1x.png" "$SVG_SOURCE"

# macOS icons
inkscape --export-background-opacity=0 --export-width=16 --export-type=png --export-filename="$ICON_DIR/mac-icon-16@1x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=32 --export-type=png --export-filename="$ICON_DIR/mac-icon-16@2x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=32 --export-type=png --export-filename="$ICON_DIR/mac-icon-32@1x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=64 --export-type=png --export-filename="$ICON_DIR/mac-icon-32@2x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=128 --export-type=png --export-filename="$ICON_DIR/mac-icon-128@1x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=256 --export-type=png --export-filename="$ICON_DIR/mac-icon-128@2x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=256 --export-type=png --export-filename="$ICON_DIR/mac-icon-256@1x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=512 --export-type=png --export-filename="$ICON_DIR/mac-icon-256@2x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=512 --export-type=png --export-filename="$ICON_DIR/mac-icon-512@1x.png" "$SVG_SOURCE"
inkscape --export-background-opacity=0 --export-width=1024 --export-type=png --export-filename="$ICON_DIR/mac-icon-512@2x.png" "$SVG_SOURCE"