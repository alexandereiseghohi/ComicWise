#!/usr/bin/env bash
set -euo pipefail

# Complete project setup script for ComicWise
# Usage: ./setup.sh [--clean] [--skip-validation] [--docker-db] [--dev]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$(dirname "$SCRIPT_DIR")"

CLEAN=false
SKIP_VALIDATION=false
DOCKER_DB=false
DEV=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --clean) CLEAN=true; shift ;;
        --skip-validation) SKIP_VALIDATION=true; shift ;;
        --docker-db) DOCKER_DB=true; shift ;;
        --dev) DEV=true; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

# Helper functions
print_header() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║ ComicWise Project Setup"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
}

print_info() { echo "ℹ $1"; }
print_success() { echo "✓ $1"; }
print_error() { echo "✗ $1"; }
print_warning() { echo "⚠ $1"; }

print_header

# Detect package manager
if command -v pnpm >/dev/null 2>&1; then
    PM="pnpm"
else
    PM="npm"
fi
print_success "Using package manager: $PM"

# Clean build artifacts
if [ "$CLEAN" = true ]; then
    print_info "Cleaning build artifacts..."
    $PM clean
fi

# Install dependencies
print_info "Installing dependencies..."
if [ "$PM" = "pnpm" ]; then
    pnpm install
else
    npm ci
fi
print_success "Dependencies installed"

# Setup environment
print_info "Setting up environment..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp ".env.example" ".env"
        print_warning ".env created from .env.example - please configure it"
    fi
fi
print_success "Environment configured"

# Database setup
print_info "Setting up database..."
if [ "$DOCKER_DB" = true ]; then
    print_info "Starting Docker containers..."
    docker compose -f docker-compose.dev.yml up -d
fi
$PM db:push
$PM db:seed
print_success "Database setup complete"

# Validation
if [ "$SKIP_VALIDATION" = false ]; then
    print_info "Running validation checks..."
    
    if $PM type-check 2>/dev/null; then
        print_success "Type checking passed"
    else
        print_warning "Type checking failed - continuing anyway"
    fi
    
    if $PM lint:strict 2>/dev/null; then
        print_success "Linting passed"
    else
        print_warning "Linting issues found - you can fix with '$PM lint:fix'"
    fi
fi

# Start dev server or print next steps
if [ "$DEV" = true ]; then
    print_success "Setup complete - Starting development server..."
    exec $PM dev
else
    print_success ""
    print_success "Setup complete!"
    print_info "Next steps:"
    print_info "  1. Review and configure .env file"
    print_info "  2. Run '$PM dev' to start the development server"
    print_info "  3. Visit http://localhost:3000"
fi
