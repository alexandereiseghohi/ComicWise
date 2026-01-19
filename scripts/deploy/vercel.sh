#!/usr/bin/env bash
set -euo pipefail

# Deploy to Vercel using the Vercel CLI (vercel or npx vercel)

if command -v vercel >/dev/null 2>&1; then
  vercel --prod "$@"
elif command -v pnpm >/dev/null 2>&1; then
  pnpm dlx vercel --prod "$@"
else
  npx vercel --prod "$@"
fi

echo "Vercel deployment triggered."
