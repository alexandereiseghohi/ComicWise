#!/usr/bin/env bash
set -euo pipefail

echo "[scripts/install-deps.sh] Detecting package manager..."
if command -v pnpm >/dev/null 2>&1; then
  PKG_MANAGER="pnpm"
  INSTALL_CMD="pnpm install"
elif command -v npm >/dev/null 2>&1; then
  PKG_MANAGER="npm"
  INSTALL_CMD="npm ci"
else
  echo "No pnpm or npm found. Please install Node.js and pnpm or npm."
  exit 1
fi

echo "Using package manager: $PKG_MANAGER"
$INSTALL_CMD

echo "Installing dev dependencies used by scripts (if missing)..."
if [ "$PKG_MANAGER" = "pnpm" ]; then
  $PKG_MANAGER add -D prettier eslint >/dev/null 2>&1 || true
else
  $PKG_MANAGER install --no-audit --no-fund --save-dev prettier eslint >/dev/null 2>&1 || true
fi

echo "Done. Run './scripts/setup.sh' or 'pwsh ./scripts/setup.ps1' next."
