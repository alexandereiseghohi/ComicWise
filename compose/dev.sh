#!/usr/bin/env bash
set -euo pipefail

# Compose helper: start development environment
echo "Starting development environment (Docker + dev server)..."

# Start DB/Redis for local dev
docker compose -f docker-compose.dev.yml up -d postgres redis

echo "Installing dependencies and starting pnpm dev inside container (bind-mounted)."
echo "If you prefer running locally, run: pnpm install && pnpm dev"

# Open a shell in the app container for interactive development (optional)
echo "Containers started. Use: docker compose -f docker-compose.dev.yml ps"
