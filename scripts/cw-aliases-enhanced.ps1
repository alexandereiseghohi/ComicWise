# ═══════════════════════════════════════════════════════════════════════════
# COMICWISE POWERSHELL ALIASES - Lightning Fast Commands
# ═══════════════════════════════════════════════════════════════════════════
# 
# Usage: Add to your PowerShell profile:
#   . C:\path\to\comicwise\scripts\aliases-quick.ps1
#
# Or run once:
#   pwsh scripts/aliases-quick.ps1
#

# ═══════════════════════════════════════════════════════════════════════════
# CORE COMMANDS
# ═══════════════════════════════════════════════════════════════════════════

function cw-dev { pnpm dev --turbopack }
function cw-build { pnpm build }
function cw-start { pnpm start }
function cw-test { pnpm test }
function cw-lint { pnpm lint:fix }
function cw-format { pnpm format }
function cw-check { pnpm validate }

# ═══════════════════════════════════════════════════════════════════════════
# DATABASE COMMANDS
# ═══════════════════════════════════════════════════════════════════════════

function cw-db-push { pnpm db:push }
function cw-db-seed { pnpm db:seed }
function cw-db-studio { pnpm db:studio }
function cw-db-reset { pnpm db:reset }
function cw-db-migrate { pnpm db:migrate }

# ═══════════════════════════════════════════════════════════════════════════
# TYPE & VALIDATION COMMANDS
# ═══════════════════════════════════════════════════════════════════════════

function cw-types { pnpm type-check }
function cw-types-watch { pnpm type-check:watch }

# ═══════════════════════════════════════════════════════════════════════════
# SCAFFOLDING COMMANDS
# ═══════════════════════════════════════════════════════════════════════════

function cw-scaffold { pnpm scaffold }
function cw-new-component { pnpm scaffold --type=component }
function cw-new-action { pnpm scaffold --type=action }
function cw-new-hook { pnpm scaffold --type=hook }

# ═══════════════════════════════════════════════════════════════════════════
# OPTIMIZATION COMMANDS
# ═══════════════════════════════════════════════════════════════════════════

function cw-optimize { pnpm optimize:all }
function cw-imports { pnpm imports:optimize }
function cw-camelcase { pnpm optimize:camelcase }
function cw-cleanup { pnpm cleanup }
function cw-clean-dry { pnpm cleanup:dry-run }

# ═══════════════════════════════════════════════════════════════════════════
# HEALTH CHECK COMMANDS
# ═══════════════════════════════════════════════════════════════════════════

function cw-health { pnpm health:all }
function cw-health-db { pnpm health:db }
function cw-health-redis { pnpm health:redis }

# ═══════════════════════════════════════════════════════════════════════════
# DOCKER COMMANDS
# ═══════════════════════════════════════════════════════════════════════════

function cw-docker-up { pnpm docker:up }
function cw-docker-down { pnpm docker:down }
function cw-docker-build { pnpm docker:build }
function cw-docker-logs { pnpm docker:logs }
function cw-docker-clean { pnpm docker:clean }

# ═══════════════════════════════════════════════════════════════════════════
# CACHE COMMANDS
# ═══════════════════════════════════════════════════════════════════════════

function cw-cache-stats { pnpm cache:stats }
function cw-cache-clear { pnpm cache:clear }

# ═══════════════════════════════════════════════════════════════════════════
# TESTING COMMANDS
# ═══════════════════════════════════════════════════════════════════════════

function cw-test-unit { pnpm test:unit:run }
function cw-test-e2e { pnpm test }
function cw-test-ui { pnpm test:ui }
function cw-test-watch { pnpm test:unit:watch }
function cw-test-coverage { pnpm test:unit:coverage }

# ═══════════════════════════════════════════════════════════════════════════
# CI/CD COMMANDS
# ═══════════════════════════════════════════════════════════════════════════

function cw-ci { pnpm ci }
function cw-ci-full { pnpm ci:full }
function cw-deploy-preview { pnpm deploy:preview }
function cw-deploy { pnpm deploy:vercel }

# ═══════════════════════════════════════════════════════════════════════════
# SETUP & INSTALLATION
# ═══════════════════════════════════════════════════════════════════════════

function cw-setup { pnpm setup }
function cw-install { pnpm install }
function cw-update { pnpm check-updates }
function cw-clean-all { pnpm clean:all }

# ═══════════════════════════════════════════════════════════════════════════
# UTILITY FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════

function cw-help {
    Write-Host "`n═══════════════════════════════════════════════════════════════════════════"
    Write-Host "COMICWISE CLI COMMANDS - Quick Reference"
    Write-Host "═══════════════════════════════════════════════════════════════════════════`n"
    
    Write-Host "CORE:" -ForegroundColor Cyan
    Write-Host "  cw-dev          - Start development server"
    Write-Host "  cw-build        - Build for production"
    Write-Host "  cw-start        - Start production server"
    Write-Host "  cw-test         - Run tests"
    Write-Host "  cw-lint         - Lint and fix code"
    Write-Host "  cw-format       - Format code"
    Write-Host "  cw-check        - Run all validations"
    
    Write-Host "`nDATABASE:" -ForegroundColor Cyan
    Write-Host "  cw-db-push      - Push schema changes"
    Write-Host "  cw-db-seed      - Seed database"
    Write-Host "  cw-db-studio    - Open Drizzle Studio"
    Write-Host "  cw-db-reset     - Reset database"
    
    Write-Host "`nSCAFFOLDING:" -ForegroundColor Cyan
    Write-Host "  cw-scaffold          - Interactive scaffolding"
    Write-Host "  cw-new-component     - Create component"
    Write-Host "  cw-new-action        - Create server action"
    Write-Host "  cw-new-hook          - Create custom hook"
    
    Write-Host "`nOPTIMIZATION:" -ForegroundColor Cyan
    Write-Host "  cw-optimize     - Run all optimizations"
    Write-Host "  cw-imports      - Optimize imports"
    Write-Host "  cw-camelcase    - Convert to camelCase"
    Write-Host "  cw-cleanup      - Clean up project"
    
    Write-Host "`nDOCKER:" -ForegroundColor Cyan
    Write-Host "  cw-docker-up    - Start Docker containers"
    Write-Host "  cw-docker-down  - Stop Docker containers"
    Write-Host "  cw-docker-logs  - View Docker logs"
    
    Write-Host "`nTESTING:" -ForegroundColor Cyan
    Write-Host "  cw-test-unit    - Run unit tests"
    Write-Host "  cw-test-e2e     - Run E2E tests"
    Write-Host "  cw-test-ui      - Open test UI"
    
    Write-Host "`n═══════════════════════════════════════════════════════════════════════════`n"
}

# Show help on load
Write-Host "✅ ComicWise aliases loaded! Type 'cw-help' for available commands." -ForegroundColor Green
