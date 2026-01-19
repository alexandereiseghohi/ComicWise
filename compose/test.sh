#!/usr/bin/env bash
set -euo pipefail

# Compose helper: run project test suite
echo "Running test suite..."
pnpm test "$@"

echo "Done."
