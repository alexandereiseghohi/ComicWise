#!/bin/bash
# ═══════════════════════════════════════════════════
# ComicWise - Docker Deployment Script
# ═══════════════════════════════════════════════════

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║    ComicWise - Docker Deployment                 ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"

# Parse environment
ENV="${1:-production}"

# Check .env file
if [ ! -f ".env.local" ] && [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}Warning: No .env file found. Using defaults.${NC}"
fi

echo -e "${YELLOW}Deploying ${ENV} environment...${NC}"

if [ "$ENV" = "development" ]; then
    docker-compose -f docker-compose.dev.yml up -d
elif [ "$ENV" = "production" ]; then
    docker-compose -f docker-compose.yml up -d
else
    echo "Error: Invalid environment. Use 'development' or 'production'"
    exit 1
fi

echo -e "${GREEN}✓ Deployment complete!${NC}"
echo ""
echo "Services:"
echo "  - App: http://localhost:3000"
echo "  - Database: localhost:5432"
echo "  - Redis: localhost:6379"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop services: docker-compose down"
