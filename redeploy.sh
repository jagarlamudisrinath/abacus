#!/bin/bash

# ALAMA Abacus - Redeploy Script for macOS/Linux
# This script pulls latest code, rebuilds Docker containers, and restarts services

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   ALAMA Abacus - Redeploy${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Pull latest code
echo -e "${YELLOW}[1/4] Pulling latest code from git...${NC}"
if git pull; then
    echo -e "${GREEN}✓ Git pull successful${NC}"
else
    echo -e "${RED}✗ Git pull failed${NC}"
    exit 1
fi
echo ""

# Step 2: Stop and remove containers
echo -e "${YELLOW}[2/4] Stopping and removing containers...${NC}"
if docker compose down; then
    echo -e "${GREEN}✓ Containers stopped${NC}"
else
    echo -e "${YELLOW}⚠ No containers were running or docker compose not available${NC}"
fi
echo ""

# Step 3: Rebuild images without cache
echo -e "${YELLOW}[3/4] Rebuilding images (no cache)...${NC}"
if docker compose build --no-cache; then
    echo -e "${GREEN}✓ Images rebuilt successfully${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
echo ""

# Step 4: Start services
echo -e "${YELLOW}[4/4] Starting services...${NC}"
if docker compose up -d; then
    echo -e "${GREEN}✓ Services started${NC}"
else
    echo -e "${RED}✗ Failed to start services${NC}"
    exit 1
fi
echo ""

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 5

# Check if services are running
if docker compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓ Services are running${NC}"
else
    echo -e "${RED}✗ Some services may have failed to start${NC}"
    echo "Run 'docker compose logs' to see details"
fi
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Redeployment complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  Frontend: ${BLUE}http://localhost:8080${NC}"
echo -e "  Backend:  ${BLUE}http://localhost:4001${NC}"
echo -e "  Database: ${BLUE}localhost:5432${NC}"
echo ""
echo "To view logs: docker compose logs -f"
echo "To stop:      docker compose down"
echo ""
