#!/bin/bash
# ═══════════════════════════════════════════════════
# ComicWise - Docker Build Script
# ═══════════════════════════════════════════════════

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║    ComicWise - Docker Build Script               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Parse arguments
BUILD_TYPE="${1:-production}"
CACHE_FLAG="${2:---no-cache}"

echo -e "${YELLOW}Building Docker image...${NC}"
echo -e "Build type: ${BUILD_TYPE}"
echo -e "Cache: ${CACHE_FLAG}"

if [ "$BUILD_TYPE" = "development" ]; then
    docker-compose -f docker-compose.dev.yml build $CACHE_FLAG
    echo -e "${GREEN}✓ Development image built successfully${NC}"
elif [ "$BUILD_TYPE" = "production" ]; then
    docker-compose -f docker-compose.yml build $CACHE_FLAG
    echo -e "${GREEN}✓ Production image built successfully${NC}"
else
    echo -e "${RED}Error: Invalid build type. Use 'development' or 'production'${NC}"
    exit 1
fi

echo -e "${GREEN}Build complete!${NC}"
