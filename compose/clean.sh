#!/usr/bin/env bash
set -euo pipefail

# Compose helper: clean docker resources for project
echo "Stopping and removing compose resources (volumes included)..."
docker compose -f docker-compose.yml down -v --remove-orphans || true
docker compose -f docker-compose.dev.yml down -v --remove-orphans || true

echo "Pruning unused Docker resources (images, build cache)..."
docker builder prune -af || true
docker image prune -af || true

echo "Done."
