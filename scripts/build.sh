#!/usr/bin/env bash
set -euo pipefail

# Build script for ComicWise
# Usage: ./build.sh [--debug] [--analyze]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$(dirname "$SCRIPT_DIR")"

DEBUG=false
ANALYZE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --debug) DEBUG=true; shift ;;
        --analyze) ANALYZE=true; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# Detect package manager
if command -v pnpm >/dev/null 2>&1; then
    PM="pnpm"
elif command -v npm >/dev/null 2>&1; then
    PM="npm run"
else
    echo "✗ pnpm or npm not found"
    exit 1
fi

echo "ℹ Building project..."

if [ "$DEBUG" = true ]; then
    $PM build:debug
elif [ "$ANALYZE" = true ]; then
    $PM build:analyze
else
    $PM build
fi

echo "✓ Build completed successfully"
