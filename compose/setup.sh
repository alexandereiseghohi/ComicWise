#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# Docker Compose Setup Script
# Initializes containers, databases, and seeds
# ═══════════════════════════════════════════════════════════════════════════

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Environment
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
ENV_FILE="${ENV_FILE:-.env.local}"

# Functions
log() { echo -e "${BLUE}ℹ${NC} $1"; }
success() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; }

# Header
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          Docker Compose Environment Setup${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check prerequisites
log "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
  error "Docker is not installed"
  exit 1
fi
success "Docker installed"

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
  error "Docker Compose is not installed"
  exit 1
fi
success "Docker Compose available"

# Check environment file
if [ ! -f "$ENV_FILE" ]; then
  warn "Environment file not found: $ENV_FILE"
  log "Creating from .env.example..."
  if [ -f ".env.example" ]; then
    cp .env.example "$ENV_FILE"
    success "Created $ENV_FILE"
  else
    error ".env.example not found"
    exit 1
  fi
fi
success "Environment file ready"

echo ""
log "Starting services..."

# Start services
if docker compose -f "$COMPOSE_FILE" up -d 2>/dev/null; then
  success "Services started"
else
  error "Failed to start services"
  exit 1
fi

# Wait for database
log "Waiting for PostgreSQL to be healthy..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if docker compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U postgres &> /dev/null; then
    success "PostgreSQL is ready"
    break
  fi
  ATTEMPT=$((ATTEMPT + 1))
  echo -n "."
  sleep 1
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  error "PostgreSQL failed to start"
  exit 1
fi

echo ""

# Wait for Redis
log "Waiting for Redis to be healthy..."
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  if docker compose -f "$COMPOSE_FILE" exec -T redis redis-cli ping &> /dev/null; then
    success "Redis is ready"
    break
  fi
  ATTEMPT=$((ATTEMPT + 1))
  echo -n "."
  sleep 1
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  warn "Redis failed to start (optional)"
fi

echo ""

# Display service status
log "Service Status:"
docker compose -f "$COMPOSE_FILE" ps

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              Setup Complete! Services Running${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
log "Next steps:"
echo "  • Run database migrations: pnpm db:push"
echo "  • Seed database: pnpm db:seed"
echo "  • View logs: docker compose logs -f"
echo "  • Stop services: docker compose down"
echo ""
