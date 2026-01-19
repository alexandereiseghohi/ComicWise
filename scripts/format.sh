#!/usr/bin/env bash
set -euo pipefail

# Prettier code formatter script for ComicWise
# Usage: ./format.sh [--check]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$(dirname "$SCRIPT_DIR")"

CHECK=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --check) CHECK=true; shift ;;
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

echo "ℹ Running Prettier..."

if [ "$CHECK" = true ]; then
    $PM format:check
    echo "✓ Format check completed"
else
    $PM format
    echo "✓ Formatting completed successfully"
fi
