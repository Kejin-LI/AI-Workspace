#!/bin/bash
set -euo pipefail

echo "[build] Node version:"
node -v || true

echo "[build] Installing dependencies..."
npm ci || npm install

echo "[build] Building..."
npm run build

echo "[build] Collecting artifacts into output/..."
rm -rf output
mkdir -p output
cp -r dist/* output/

echo "[build] Done. Artifacts in output/"
