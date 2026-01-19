#!/usr/bin/env bash
set -euo pipefail

# Compose helper: format code with Prettier
echo "Formatting repository..."
pnpm format "$@"

echo "Done."
