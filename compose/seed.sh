#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# Docker Database Seeding Script
# Runs database seeding inside the container
# ═══════════════════════════════════════════════════════════════════════════

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
SERVICE_NAME="${SERVICE_NAME:-app}"
COMMAND="${*:-db:seed}"

# Functions
log() { echo -e "${BLUE}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

# Header
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Database Seeding${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if service is running
log "Checking if $SERVICE_NAME service is running..."
if ! docker compose -f "$COMPOSE_FILE" ps "$SERVICE_NAME" | grep -q "Up"; then
  error "$SERVICE_NAME service is not running"
  log "Start services with: docker compose up -d"
  exit 1
fi
success "$SERVICE_NAME is running"

# Check database connectivity
log "Checking database connectivity..."
if ! docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U postgres &> /dev/null; then
  error "PostgreSQL is not ready"
  exit 1
fi
success "Database is ready"

echo ""
log "Running seed command: pnpm $COMMAND"
echo ""

# Run seed command
if docker compose -f "$COMPOSE_FILE" exec "$SERVICE_NAME" pnpm "$COMMAND"; then
  success "Seeding completed successfully"
  echo ""
  echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║              Seeding Complete!${NC}"
  echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
  exit 0
else
  error "Seeding failed"
  exit 1
fi
