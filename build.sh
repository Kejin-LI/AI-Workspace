#!/bin/bash
set -euo pipefail

echo "[build] Preparing output/..."
rm -rf output
mkdir -p output

# --- Go backend (TCE 部署的主体，必须成功) ---
echo "[build] Building Go backend..."
( cd turing-arena-extension/turing-arena-backend-go \
  && GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o ../../output/turing-arena-backend . )

echo "[build] Adding bootstrap.sh to output/..."
cp bootstrap.sh output/
chmod +x output/bootstrap.sh output/turing-arena-backend

# --- Frontend (可选：仅当构建环境装了 npm 时才构建) ---
if command -v npm >/dev/null 2>&1; then
  echo "[build] npm found, building frontend..."
  npm ci || npm install
  npm run build
  cp -r dist/* output/
else
  echo "[build] npm not found, skip frontend build (backend-only deploy)."
fi

echo "[build] Done. Artifacts in output/"
