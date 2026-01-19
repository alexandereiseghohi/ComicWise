#!/usr/bin/env bash
set -euo pipefail

# ESLint linter script for ComicWise
# Usage: ./lint.sh [--fix] [--strict] [--fix-type]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$(dirname "$SCRIPT_DIR")"

FIX=false
STRICT=false
FIX_TYPE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --fix) FIX=true; shift ;;
        --strict) STRICT=true; shift ;;
        --fix-type) FIX_TYPE=true; shift ;;
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

echo "ℹ Running ESLint..."

if [ "$STRICT" = true ]; then
    $PM lint:strict
elif [ "$FIX_TYPE" = true ]; then
    $PM lint:fixtype
elif [ "$FIX" = true ]; then
    $PM lint:fix
else
    $PM lint
fi

echo "✓ Linting completed successfully"
