#!/usr/bin/env bash
set -euo pipefail

# Production server runner for ComicWise
# Usage: ./run.sh [--preview] [--port PORT]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$(dirname "$SCRIPT_DIR")"

PREVIEW=false
PORT=3000

while [[ $# -gt 0 ]]; do
    case $1 in
        --preview) PREVIEW=true; shift ;;
        --port) PORT="$2"; shift 2 ;;
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

export PORT=$PORT

if [ "$PREVIEW" = true ]; then
    echo "ℹ Starting preview server on port $PORT..."
    exec $PM preview
else
    echo "ℹ Starting production server on port $PORT..."
    exec $PM start:prod
fi
