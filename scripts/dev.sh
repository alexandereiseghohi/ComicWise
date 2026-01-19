#!/usr/bin/env bash
set -euo pipefail

# Development server script for ComicWise
# Usage: ./dev.sh [--debug] [--https] [--port PORT]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$(dirname "$SCRIPT_DIR")"

DEBUG=false
HTTPS=false
PORT=3000

while [[ $# -gt 0 ]]; do
    case $1 in
        --debug) DEBUG=true; shift ;;
        --https) HTTPS=true; shift ;;
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

echo "ℹ Starting development server on port $PORT..."

if [ "$DEBUG" = true ]; then
    export NODE_OPTIONS="--inspect"
    echo "ℹ Debugging enabled - connect debugger to localhost:9229"
fi

if [ "$HTTPS" = true ]; then
    exec $PM dev:https
else
    exec $PM dev
fi
