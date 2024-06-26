#!/bin/bash

set -ex

reflex -g src/editor.js -- sh -c \
    'npx rollup src/editor.js -f iife -o dist/cm6.bundle.js -p @rollup/plugin-node-resolve --output.name cm6 && \
     cd dist && \
     # npx minify cm6.bundle.js > cm6.bundle.min.js && \
     echo copy cm6
     cp cm6.bundle.js /Volumes/exs/git/personal/datahub/app/resources/static/js && \
     echo ...done'
