#!/bin/bash
# ═══════════════════════════════════════════════════
# ComicWise - Health Check Script
# ═══════════════════════════════════════════════════

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_URL="${1:-http://localhost:3000}"
MAX_RETRIES=30
RETRY_INTERVAL=2

echo -e "${YELLOW}Waiting for application to be ready...${NC}"

for i in $(seq 1 $MAX_RETRIES); do
    if curl -f -s "${APP_URL}/api/health" > /dev/null; then
        echo -e "${GREEN}✓ Application is ready!${NC}"
        exit 0
    fi
    
    echo "Attempt $i/$MAX_RETRIES - waiting..."
    sleep $RETRY_INTERVAL
done

echo -e "${RED}✗ Application failed to start${NC}"
exit 1
