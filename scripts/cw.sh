#!/bin/bash
#═══════════════════════════════════════════════════════════════════════════
# COMICWISE CLI - Bash wrapper for all project commands
#═══════════════════════════════════════════════════════════════════════════
# Provides easy access to 100+ organized scripts with tab completion
#═══════════════════════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    printf "${CYAN}║ %-60s ║${NC}\n" "$1"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

run_command() {
    print_info "Running: $1"
    eval "$1"
}

# Command dispatcher
case "$1" in
    # Database Commands
    db:push) run_command "pnpm db:push" ;;
    db:pull) run_command "pnpm db:pull" ;;
    db:migrate) run_command "pnpm db:migrate" ;;
    db:generate) run_command "pnpm db:generate" ;;
    db:seed) run_command "pnpm db:seed" ;;
    db:reset) run_command "pnpm db:reset" ;;
    db:studio) run_command "pnpm db:studio" ;;
    db:backup) run_command "pnpm db:backup" ;;
    
    # Cache Commands
    cache:clear) run_command "pnpm cache:clear" ;;
    cache:stats) run_command "pnpm cache:stats" ;;
    redis:cli) run_command "pnpm redis:cli" ;;
    redis:flush) run_command "pnpm redis:flush" ;;
    
    # Queue Commands
    queue:worker) run_command "pnpm queue:worker" ;;
    queue:stats) run_command "pnpm queue:stats" ;;
    queue:clean) run_command "pnpm queue:clean" ;;
    queue:dashboard) run_command "pnpm queue:dashboard" ;;
    
    # Upload Commands
    upload:bulk) run_command "pnpm upload:bulk ${@:2}" ;;
    upload:test) run_command "pnpm upload:test" ;;
    
    # Health Commands
    health:all) run_command "pnpm health:all" ;;
    health:db) run_command "pnpm health:db" ;;
    health:redis) run_command "pnpm health:redis" ;;
    
    # Development Commands
    dev) run_command "pnpm dev" ;;
    build) run_command "pnpm build" ;;
    start) run_command "pnpm start" ;;
    lint) run_command "pnpm lint" ;;
    lint:fix) run_command "pnpm lint:fix" ;;
    format) run_command "pnpm format" ;;
    type-check) run_command "pnpm type-check" ;;
    
    # Testing Commands
    test) run_command "pnpm test" ;;
    test:unit) run_command "pnpm test:unit:run" ;;
    test:e2e) run_command "pnpm test" ;;
    test:ui) run_command "pnpm test:ui" ;;
    
    # Docker Commands
    docker:up) run_command "pnpm docker:up" ;;
    docker:down) run_command "pnpm docker:down" ;;
    docker:build) run_command "pnpm docker:build" ;;
    docker:logs) run_command "pnpm docker:logs" ;;
    
    # Utility Commands
    clean) run_command "pnpm clean" ;;
    clean:all) run_command "pnpm clean:all" ;;
    imports:optimize) run_command "pnpm imports:optimize" ;;
    validate) run_command "pnpm validate" ;;
    fix) run_command "pnpm lint:fix && pnpm format" ;;
    
    # Priority System
    priority:list) run_command "pnpm priority:list" ;;
    priority:status) run_command "pnpm priority:status" ;;
    priority:run:p0) run_command "pnpm priority:run:p0" ;;
    priority:run:p1) run_command "pnpm priority:run:p1" ;;
    
    # Setup Commands
    setup) run_command "pnpm setup" ;;
    setup:clean) run_command "pnpm setup:clean" ;;
    setup:docker) run_command "pnpm setup:docker" ;;
    
    # Help or no command
    help|"")
        print_header "ComicWise CLI - Available Commands"
        
        echo -e "\n${YELLOW}Database Commands:${NC}"
        echo "  db:push              - Push database schema"
        echo "  db:pull              - Pull database schema"
        echo "  db:migrate           - Run migrations"
        echo "  db:seed              - Seed database"
        echo "  db:reset             - Reset database"
        echo "  db:studio            - Open Drizzle Studio"
        
        echo -e "\n${YELLOW}Cache & Redis Commands:${NC}"
        echo "  cache:clear          - Clear all caches"
        echo "  cache:stats          - Show cache stats"
        echo "  redis:cli            - Open Redis CLI"
        echo "  redis:flush          - Flush Redis"
        
        echo -e "\n${YELLOW}Queue Commands:${NC}"
        echo "  queue:worker         - Start queue worker"
        echo "  queue:stats          - Show queue stats"
        echo "  queue:clean          - Clean queue"
        
        echo -e "\n${YELLOW}Upload Commands:${NC}"
        echo "  upload:bulk          - Bulk upload images"
        echo "  upload:test          - Test upload"
        
        echo -e "\n${YELLOW}Health Commands:${NC}"
        echo "  health:all           - Run all health checks"
        echo "  health:db            - Check database"
        echo "  health:redis         - Check Redis"
        
        echo -e "\n${YELLOW}Development Commands:${NC}"
        echo "  dev                  - Start dev server"
        echo "  build                - Build for production"
        echo "  lint                 - Lint code"
        echo "  format               - Format code"
        echo "  type-check           - Type check"
        
        echo -e "\n${YELLOW}Utility Commands:${NC}"
        echo "  clean                - Clean build artifacts"
        echo "  imports:optimize     - Optimize imports"
        echo "  validate             - Run all validations"
        echo "  fix                  - Fix all issues"
        
        echo -e "\n${CYAN}Usage: ./cw.sh <command> [arguments]${NC}"
        echo -e "${CYAN}Example: ./cw.sh db:push${NC}"
        ;;
    
    *)
        print_error "Unknown command: $1"
        print_info "Run './cw.sh' to see available commands"
        exit 1
        ;;
esac

print_success "Command completed successfully"
