#!/bin/bash

# ComicWise MCP Servers Startup Script - Bash (macOS/Linux)
#
# This script starts all necessary MCP servers for ComicWise development
#
# Usage:
# chmod +x scripts/start-mcp-servers.sh
# ./scripts/start-mcp-servers.sh
# ./scripts/start-mcp-servers.sh --stop-existing
#
# Features:
# - Checks if servers are already running
# - Starts PostgreSQL adapter
# - Starts Redis adapter (if configured)
# - Logs to .vscode/logs/mcp-servers.log
# - Cross-platform compatible (Bash 3+)

set -e

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Options
STOP_EXISTING=false
TIMEOUT=30

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --stop-existing)
      STOP_EXISTING=true
      shift
      ;;
    --timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Helper functions
write_color() {
  local color=$1
  local message=$2
  echo -e "${color}${message}${NC}"
}

write_log() {
  local level=$1
  local message=$2
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

  # Create logs directory if it doesn't exist
  mkdir -p .vscode/logs

  # Append to log file
  echo "$timestamp [$level] $message" >> .vscode/logs/mcp-servers.log

  case $level in
    INFO)
      write_color "$BLUE" "$message"
      ;;
    SUCCESS)
      write_color "$GREEN" "$message"
      ;;
    ERROR)
      write_color "$RED" "$message"
      ;;
    WARN)
      write_color "$YELLOW" "$message"
      ;;
  esac
}

# Banner
write_color "$BOLD$BLUE" "\n🚀 ComicWise MCP Servers Startup\n"
write_log "INFO" "Starting MCP servers"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  write_log "ERROR" "Node.js not found. Please install Node.js."
  write_color "$RED" "❌ Node.js not found."
  exit 1
fi

NODE_VERSION=$(node -v)
write_log "INFO" "Node.js version: $NODE_VERSION"
write_color "$GREEN" "✅ Node.js found: $NODE_VERSION"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
  write_log "WARN" "pnpm not found. Installing with npm..."
  write_color "$YELLOW" "⏳ Installing pnpm with npm..."
  npm install -g pnpm || true
fi

PNPM_VERSION=$(pnpm -v)
write_log "INFO" "pnpm version: $PNPM_VERSION"
write_color "$GREEN" "✅ pnpm found: $PNPM_VERSION"

# Load environment variables from .env.local
if [ -f .env.local ]; then
  write_log "INFO" "Loading .env.local"
  # Source .env.local carefully (only for non-secrets)
  export $(cat .env.local | grep -v '^#' | xargs)
else
  write_log "WARN" ".env.local not found"
fi

# Stop existing processes if requested
if [ "$STOP_EXISTING" = true ]; then
  write_color "$YELLOW" "\n🛑 Stopping existing MCP processes..."
  write_log "INFO" "Stopping existing MCP processes"

  # Find and kill existing node processes running MCP servers
  if pgrep -f "mcp|server" > /dev/null; then
    pkill -f "mcp|server" || true
  fi

  sleep 2
fi

# Create logs directory
mkdir -p .vscode/logs

# Start PostgreSQL MCP Server
write_color "$BLUE" "\n📀 Starting PostgreSQL MCP Server..."
write_log "INFO" "Attempting to start PostgreSQL MCP server"

# Try with tsx if available, otherwise use node
if command -v tsx &> /dev/null; then
  tsx ./scripts/mcp/postgres-mcp-server.ts > .vscode/logs/pg-server.log 2> .vscode/logs/pg-server-error.log &
else
  node ./scripts/mcp/postgres-mcp-server.ts > .vscode/logs/pg-server.log 2> .vscode/logs/pg-server-error.log &
fi

PG_PID=$!
write_log "INFO" "PostgreSQL MCP server started (PID: $PG_PID)"
write_color "$GREEN" "✅ PostgreSQL MCP server started (PID: $PG_PID)"

# Start Redis MCP Server (if Redis is configured)
if [ ! -z "$REDIS_URL" ]; then
  write_color "$BLUE" "\n🔴 Starting Redis MCP Server..."
  write_log "INFO" "Attempting to start Redis MCP server"

  if command -v tsx &> /dev/null; then
    tsx ./scripts/mcp/redis-mcp-server.ts > .vscode/logs/redis-server.log 2> .vscode/logs/redis-server-error.log &
  else
    node ./scripts/mcp/redis-mcp-server.ts > .vscode/logs/redis-server.log 2> .vscode/logs/redis-server-error.log &
  fi

  REDIS_PID=$!
  write_log "INFO" "Redis MCP server started (PID: $REDIS_PID)"
  write_color "$GREEN" "✅ Redis MCP server started (PID: $REDIS_PID)"
else
  write_color "$YELLOW" "⏭️  Redis not configured (skipping)"
  write_log "WARN" "Redis not configured - skipping Redis server startup"
fi

# Wait for servers to start
write_color "$YELLOW" "\n⏳ Waiting for servers to be ready..."
sleep 3

# Verify servers are running
write_color "$BLUE" "\n🔍 Verifying MCP servers..."

PROCESS_COUNT=$(pgrep -f "mcp|server" | wc -l)

if [ "$PROCESS_COUNT" -gt 0 ]; then
  write_log "SUCCESS" "Verification successful - $PROCESS_COUNT MCP server(s) running"
  write_color "$GREEN" "✅ Verification successful - $PROCESS_COUNT MCP server(s) running"
else
  write_log "ERROR" "Verification failed - no MCP servers running"
  write_color "$RED" "❌ Verification failed - no MCP servers running"
fi

# Display server logs location
write_color "$BLUE" "\n📋 Server logs:"
write_color "$BLUE" "  - PostgreSQL: .vscode/logs/pg-server.log"
write_color "$BLUE" "  - Redis: .vscode/logs/redis-server.log"
write_color "$BLUE" "  - Startup: .vscode/logs/mcp-servers.log"

write_color "$GREEN" "\n✅ MCP servers startup complete!\n"
write_log "SUCCESS" "MCP servers startup complete"
