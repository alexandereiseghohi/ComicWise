#!/usr/bin/env bash
set -euo pipefail

# Deploy the exported 'out' folder to GitHub Pages (requires static export configuration)
if [[ ! -d out ]]; then
  echo "No 'out' folder found. Building and exporting site..."
  if command -v pnpm >/dev/null 2>&1; then
    pnpm build && pnpm run export || true
  else
    npm run build && npm run export || true
  fi
fi

if command -v pnpm >/dev/null 2>&1; then
  if pnpm dlx -y gh-pages --version >/dev/null 2>&1 2>/dev/null; then
    pnpm dlx gh-pages -d out -b gh-pages
  else
    pnpm dlx gh-pages -d out -b gh-pages
  fi
else
  npx gh-pages -d out -b gh-pages
fi

echo "GitHub Pages deployment finished."
