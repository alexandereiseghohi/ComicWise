#!/usr/bin/env bash
# Optimized ops script for Unix-like shells (bash)
# Usage: ./scripts/ops.sh setup

set -euo pipefail

TASK=${1:-}
NAME=${2:-comicwise-backup.zip}
SOURCE=${3:-.}
TARGET=${4:-.}

log() { echo "-> $*"; }

case "$TASK" in
  setup)
    log "Installing dependencies (pnpm)..."
    pnpm install
    ;;

  cleanup)
    log "Cleaning workspace..."
    rm -rf node_modules .next dist pnpm-store || true
    log "Cleanup finished"
    ;;

  backup)
    log "Creating backup $NAME..."
    # Exclude large dirs
    tar --exclude='./node_modules' --exclude='./.git' --exclude='./.next' -czf "$NAME" "$SOURCE"
    log "Backup created: $NAME"
    ;;

  restore)
    if [ ! -f "$NAME" ]; then echo "Backup $NAME not found"; exit 1; fi
    mkdir -p "$TARGET"
    tar -xzf "$NAME" -C "$TARGET"
    ;;

  deploy)
    log "Deploying..."
    if [ -f "compose/deploy.sh" ]; then bash compose/deploy.sh; else
      if command -v docker-compose >/dev/null 2>&1; then docker-compose up -d --build; else pnpm build; fi
    fi
    ;;

  test)
    log "Running tests"
    pnpm test
    ;;

  build)
    log "Building production bundle"
    pnpm build
    ;;

  dev|run)
    log "Starting dev server"
    pnpm dev
    ;;

  lint)
    log "Running linter"
    pnpm lint
    ;;

  format)
    log "Formatting with Prettier"
    if command -v pnpm >/dev/null 2>&1; then pnpm format; else npx prettier --write .; fi
    ;;

  type-check)
    log "Running TypeScript type-check"
    pnpm type-check
    ;;

  fix-imports)
    log "Attempting to run update-imports-to-aliases script"
    if [ -f scripts/update-imports-to-aliases.ts ]; then
      if command -v pnpm >/dev/null 2>&1; then pnpm ts-node scripts/update-imports-to-aliases.ts; else echo "Install ts-node to run this script"; fi
    else
      log "No import update script; running ESLint --fix"
      pnpm lint -- --fix
    fi
    ;;

  refactor)
    log "Running automated refactor helpers: ESLint --fix + Prettier"
    pnpm lint -- --fix || true
    pnpm format || true
    log "For more advanced codemods, install jscodeshift and add transforms under scripts/codemods"
    ;;

  *)
    echo "Usage: $0 <setup|cleanup|backup|restore|deploy|test|build|dev|lint|format|type-check|fix-imports|refactor> [name]"
    exit 1
    ;;
esac
