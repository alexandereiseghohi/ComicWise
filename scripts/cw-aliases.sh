#!/bin/bash
# ═══════════════════════════════════════════════════
# COMICWISE PROJECT ALIASES - Bash
# ═══════════════════════════════════════════════════
# Lightning-fast commands for ComicWise development
#
# Usage: source ./scripts/cw-aliases.sh
# ═══════════════════════════════════════════════════

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         ComicWise Project Aliases - Loading...              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ═══════════════════════════════════════════════════
# DEVELOPMENT COMMANDS
# ═══════════════════════════════════════════════════

alias cw-dev='pnpm dev'
alias cw-build='pnpm build'
alias cw-start='pnpm start'
alias cw-clean='pnpm clean'

# ═══════════════════════════════════════════════════
# DATABASE COMMANDS
# ═══════════════════════════════════════════════════

alias cw-db-push='pnpm db:push'
alias cw-db-seed='pnpm db:seed'
alias cw-db-studio='pnpm db:studio'
alias cw-db-reset='pnpm db:reset'
alias cw-db-generate='pnpm db:generate'
alias cw-db-migrate='pnpm db:migrate'

# ═══════════════════════════════════════════════════
# TESTING COMMANDS
# ═══════════════════════════════════════════════════

alias cw-test='pnpm test'
alias cw-test-unit='pnpm test:unit'
alias cw-test-ui='pnpm test:ui'
alias cw-test-headed='pnpm test:headed'

# ═══════════════════════════════════════════════════
# CODE QUALITY COMMANDS
# ═══════════════════════════════════════════════════

alias cw-lint='pnpm lint'
alias cw-lint-fix='pnpm lint:fix'
alias cw-format='pnpm format'
alias cw-type-check='pnpm type-check'
alias cw-validate='pnpm validate'

# ═══════════════════════════════════════════════════
# DOCKER COMMANDS
# ═══════════════════════════════════════════════════

alias cw-docker-up='docker-compose up -d'
alias cw-docker-down='docker-compose down'
alias cw-docker-build='docker-compose build'
alias cw-docker-logs='docker-compose logs -f'

# ═══════════════════════════════════════════════════
# UTILITY COMMANDS
# ═══════════════════════════════════════════════════

alias cw-scaffold='pnpm scaffold'
alias cw-optimize='pnpm tsx scripts/MasterOptimization.ts'
alias cw-cleanup='pnpm tsx scripts/cleanup-comprehensive.ts'
alias cw-imports='pnpm tsx scripts/replace-imports.ts'
alias cw-cache-clear='pnpm cache:clear'
alias cw-cache-stats='pnpm cache:stats'

# ═══════════════════════════════════════════════════
# HEALTH CHECK COMMANDS
# ═══════════════════════════════════════════════════

alias cw-health='pnpm health:check'
alias cw-health-db='pnpm health:db'
alias cw-health-redis='pnpm health:redis'
alias cw-health-all='pnpm health:all'

# ═══════════════════════════════════════════════════
# QUEUE COMMANDS
# ═══════════════════════════════════════════════════

alias cw-queue-worker='pnpm queue:worker'
alias cw-queue-stats='pnpm queue:stats'
alias cw-queue-clean='pnpm queue:clean'

# ═══════════════════════════════════════════════════
# HELP COMMAND
# ═══════════════════════════════════════════════════

cw-help() {
    echo ""
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║              ComicWise Available Commands                    ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "DEVELOPMENT:"
    echo "  cw-dev             Start development server"
    echo "  cw-build           Build for production"
    echo "  cw-start           Start production server"
    echo "  cw-clean           Clean build artifacts"
    echo ""
    echo "DATABASE:"
    echo "  cw-db-push         Push schema to database"
    echo "  cw-db-seed         Seed database with data"
    echo "  cw-db-studio       Open Drizzle Studio"
    echo "  cw-db-reset        Reset database"
    echo ""
    echo "TESTING:"
    echo "  cw-test            Run all tests"
    echo "  cw-test-unit       Run unit tests"
    echo "  cw-test-ui         Run tests with UI"
    echo ""
    echo "CODE QUALITY:"
    echo "  cw-lint            Run ESLint"
    echo "  cw-lint-fix        Fix ESLint errors"
    echo "  cw-format          Format code with Prettier"
    echo "  cw-type-check      Check TypeScript types"
    echo "  cw-validate        Run all validation checks"
    echo ""
    echo "DOCKER:"
    echo "  cw-docker-up       Start Docker containers"
    echo "  cw-docker-down     Stop Docker containers"
    echo "  cw-docker-build    Build Docker images"
    echo "  cw-docker-logs     View Docker logs"
    echo ""
    echo "UTILITIES:"
    echo "  cw-scaffold        Create new components/pages"
    echo "  cw-optimize        Run project optimization"
    echo "  cw-cleanup         Clean unused files"
    echo "  cw-imports         Optimize import paths"
    echo ""
    echo "HEALTH:"
    echo "  cw-health          Check overall health"
    echo "  cw-health-db       Check database"
    echo "  cw-health-redis    Check Redis"
    echo ""
}

# ═══════════════════════════════════════════════════
# COMPLETION MESSAGE
# ═══════════════════════════════════════════════════

echo "✅ ComicWise aliases loaded successfully!"
echo "   Type 'cw-help' to see all available commands"
echo ""
