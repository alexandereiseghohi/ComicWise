#!/usr/bin/env bash
set -euo pipefail

# Cleanup script for ComicWise
# Usage: ./cleanup.sh [--full]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$(dirname "$SCRIPT_DIR")"

FULL=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --full) FULL=true; shift ;;
        --node-modules) FULL=true; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

echo "ℹ Removing build artifacts..."

BUILD_PATHS=(.next dist out .parcel-cache .turbo build coverage .react-email)
for path in "${BUILD_PATHS[@]}"; do
    if [ -d "$path" ]; then
        rm -rf "$path"
        echo "  ✓ Removed: $path"
    fi
done

if [ "$FULL" = true ]; then
    echo "⚠ Removing node_modules and lock files..."
    
    if [ -d "node_modules" ]; then
        rm -rf "node_modules"
        echo "  ✓ Removed: node_modules"
    fi
    
    LOCK_FILES=(pnpm-lock.yaml package-lock.json yarn.lock)
    for lockfile in "${LOCK_FILES[@]}"; do
        if [ -f "$lockfile" ]; then
            rm -f "$lockfile"
            echo "  ✓ Removed: $lockfile"
        fi
    done
fi

echo "✓ Cleanup complete"
