#!/bin/bash

# Alama Abacus - Start All Services Script
# This script starts the database, backend, and frontend in the correct order

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Load environment variables from .env file if it exists
if [ -f "$SCRIPT_DIR/.env" ]; then
    echo -e "${YELLOW}Loading environment from .env file...${NC}"
    set -a  # automatically export all variables
    source "$SCRIPT_DIR/.env"
    set +a
fi

# Port configuration (can be overridden)
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
BACKEND_PORT="${BACKEND_PORT:-3001}"
FRONTEND_PORT="${FRONTEND_PORT:-3000}"

# Default environment variables (can be overridden)
export DATABASE_URL="${DATABASE_URL:-postgresql://alama:alama123@localhost:${POSTGRES_PORT}/alama_abacus}"
export JWT_SECRET="${JWT_SECRET:-your-jwt-secret-change-in-production}"
export SUPERUSER_EMAIL="${SUPERUSER_EMAIL:-}"
export SUPERUSER_PASSWORD="${SUPERUSER_PASSWORD:-}"
export SUPERUSER_NAME="${SUPERUSER_NAME:-Super Admin}"
export PORT="${BACKEND_PORT}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Alama Abacus - Starting All Services  ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i ":$1" >/dev/null 2>&1
}

# Function to kill processes using a specific port
kill_port() {
    local port=$1
    if port_in_use "$port"; then
        echo -e "${YELLOW}Killing existing process on port $port...${NC}"
        lsof -ti ":$port" | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Function to wait for PostgreSQL to be ready
wait_for_postgres() {
    echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if docker compose exec -T postgres pg_isready -U alama -d alama_abacus >/dev/null 2>&1; then
            echo -e "${GREEN}PostgreSQL is ready!${NC}"
            return 0
        fi
        echo "  Attempt $attempt/$max_attempts - waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo -e "${RED}PostgreSQL failed to start within the timeout period${NC}"
    return 1
}

# Step 1: Start PostgreSQL container
echo -e "${YELLOW}Step 1: Starting PostgreSQL database...${NC}"
cd "$SCRIPT_DIR"

if ! command_exists docker; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Start only the postgres service with custom port mapping
# Override the default port (5432) with POSTGRES_PORT
POSTGRES_HOST_PORT="${POSTGRES_PORT}" docker compose up postgres -d

# Wait for PostgreSQL to be healthy
wait_for_postgres

echo ""

# Step 2: Start Backend
echo -e "${YELLOW}Step 2: Starting Backend server on port ${BACKEND_PORT}...${NC}"
cd "$BACKEND_DIR"

# Kill any existing process on the backend port
kill_port "$BACKEND_PORT"

PORT="$BACKEND_PORT" SUPERUSER_EMAIL="$SUPERUSER_EMAIL" SUPERUSER_PASSWORD="$SUPERUSER_PASSWORD" SUPERUSER_NAME="$SUPERUSER_NAME" npm run dev &
BACKEND_PID=$!
echo -e "${GREEN}Backend started (PID: $BACKEND_PID)${NC}"

# Wait a bit for backend to initialize
echo "  Waiting for backend to initialize..."
sleep 5

echo ""

# Step 3: Start Frontend
echo -e "${YELLOW}Step 3: Starting Frontend server on port ${FRONTEND_PORT}...${NC}"
cd "$FRONTEND_DIR"

# Kill any existing process on the frontend port
kill_port "$FRONTEND_PORT"

# Set REACT_APP_API_URL to point to the backend (bypasses hardcoded proxy)
PORT="$FRONTEND_PORT" REACT_APP_API_URL="http://localhost:${BACKEND_PORT}/api" npm start &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  All services started successfully!    ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  Database:  ${GREEN}PostgreSQL on port ${POSTGRES_PORT}${NC}"
echo -e "  Backend:   ${GREEN}http://localhost:${BACKEND_PORT}${NC}"
echo -e "  Frontend:  ${GREEN}http://localhost:${FRONTEND_PORT}${NC}"
echo ""
echo -e "${YELLOW}Customizable ports via environment variables:${NC}"
echo -e "  POSTGRES_PORT (default: 5432)"
echo -e "  BACKEND_PORT  (default: 3001)"
echo -e "  FRONTEND_PORT (default: 3000)"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Keep script running and wait for interrupt
wait
