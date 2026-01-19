#!/usr/bin/env bash
set -euo pipefail

# Test suite script for ComicWise
# Usage: ./test.sh [--unit] [--e2e] [--watch] [--ui] [--coverage]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$(dirname "$SCRIPT_DIR")"

UNIT=false
E2E=false
WATCH=false
UI=false
COVERAGE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --unit) UNIT=true; shift ;;
        --e2e) E2E=true; shift ;;
        --watch) WATCH=true; shift ;;
        --ui) UI=true; shift ;;
        --coverage) COVERAGE=true; shift ;;
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

echo "ℹ Running tests..."

if [ "$E2E" = true ]; then
    $PM test
elif [ "$UNIT" = true ]; then
    if [ "$UI" = true ]; then
        $PM test:unit:ui
    elif [ "$COVERAGE" = true ]; then
        $PM test:unit:coverage
    elif [ "$WATCH" = true ]; then
        $PM test:unit:watch
    else
        $PM test:unit:run
    fi
else
    # Default to unit tests
    if [ "$UI" = true ]; then
        $PM test:unit:ui
    elif [ "$COVERAGE" = true ]; then
        $PM test:unit:coverage
    elif [ "$WATCH" = true ]; then
        $PM test:unit:watch
    else
        $PM test:unit:run
    fi
fi

echo "✓ Tests completed"
