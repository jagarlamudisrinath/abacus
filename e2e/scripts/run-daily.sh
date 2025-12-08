#!/bin/bash
set -e

# ============================================
# Alama Abacus Daily Data Generation Script
# ============================================
#
# This script runs the data seeder to generate
# practice session data for configured test users.
#
# Usage:
#   ./run-daily.sh
#   ./run-daily.sh --sessions 5 --accuracy 80
#
# To set up as cron job:
#   crontab -e
#   0 9 * * * /path/to/alama_abacus/e2e/scripts/run-daily.sh >> /path/to/logs/daily.log 2>&1
#

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
E2E_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$E2E_DIR")"
LOG_DIR="$E2E_DIR/logs"
LOG_FILE="$LOG_DIR/data-gen-$(date +%Y%m%d-%H%M%S).log"

# Create log directory
mkdir -p "$LOG_DIR"

# Redirect output to log file
exec > >(tee -a "$LOG_FILE") 2>&1

echo "========================================"
echo "Alama Abacus Daily Data Generation"
echo "Started: $(date)"
echo "========================================"
echo ""

# Navigate to E2E directory
cd "$E2E_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
  echo ""
fi

# Function to check if a service is running
check_service() {
  local url=$1
  local name=$2
  local max_attempts=3
  local attempt=1

  while [ $attempt -le $max_attempts ]; do
    if curl -s --head --connect-timeout 5 "$url" > /dev/null 2>&1; then
      echo "OK: $name is running at $url"
      return 0
    fi
    echo "Attempt $attempt/$max_attempts: Waiting for $name..."
    sleep 2
    attempt=$((attempt + 1))
  done

  echo "WARNING: $name may not be running at $url"
  return 1
}

# Optional: Check if services are running (uncomment if needed)
# echo "Checking services..."
# check_service "http://localhost:3001/api/test/practice-sheets" "Backend API"
# check_service "http://localhost:3000" "Frontend"
# echo ""

# Parse command line arguments
SESSIONS=""
ACCURACY=""
USERS=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --sessions)
      SESSIONS="--sessions $2"
      shift 2
      ;;
    --accuracy)
      ACCURACY="--accuracy $2"
      shift 2
      ;;
    --users)
      USERS="--users $2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# Run data seeder
echo "Running data seeder..."
echo ""

npx ts-node data-seeder/seeder.ts $SESSIONS $ACCURACY $USERS

EXIT_CODE=$?

echo ""
echo "========================================"
echo "Completed: $(date)"
echo "Exit code: $EXIT_CODE"
echo "========================================"

# Cleanup old logs (keep last 30 days)
find "$LOG_DIR" -name "data-gen-*.log" -mtime +30 -delete 2>/dev/null || true

exit $EXIT_CODE
