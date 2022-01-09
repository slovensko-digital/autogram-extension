#!/bin/sh

for s in 16 32 64 128 256 512
do
  inkscape --export-background-opacity=0 --export-width=$s --export-type=png --export-filename="./src/static/logo-$s.png" ./src/img/728933_document_edit_file_page_paper_icon.svg ;
done