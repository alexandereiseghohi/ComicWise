#!/usr/bin/env bash
set -euo pipefail

# TypeScript type checking script for ComicWise
# Usage: ./type-check.sh [--watch]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$(dirname "$SCRIPT_DIR")"

WATCH=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --watch) WATCH=true; shift ;;
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

echo "ℹ Running TypeScript type checks..."

if [ "$WATCH" = true ]; then
    $PM type-check:watch
else
    $PM type-check
    echo "✓ Type checking completed successfully"
fi
