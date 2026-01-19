#!/usr/bin/env bash
set -euo pipefail

# Compose helper: run lint locally (uses pnpm)
echo "Running ESLint..."
pnpm lint "$@"

echo "Done."
