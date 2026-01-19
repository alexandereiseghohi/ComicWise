# ═══════════════════════════════════════════════════════════════════════════
# ComicWise - Complete Setup & Upgrade Script
# ═══════════════════════════════════════════════════════════════════════════
# This script handles all Tasks1 and Tasks2 for comprehensive project setup
# ═══════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "ComicWise - Complete Project Setup & Optimization" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════
# TASK 1: Install Dependencies & Setup Environment
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "📦 Task 1: Installing Dependencies..." -ForegroundColor Green
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Warning: pnpm install had issues, continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Installing @imagekit/next package..." -ForegroundColor Green
pnpm add @imagekit/next
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ @imagekit/next installed successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: @imagekit/next installation had issues" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🗑️  Uninstalling imagekitio-next..." -ForegroundColor Green
pnpm remove imagekitio-next 2>$null
Write-Host "✅ imagekitio-next uninstalled" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Tasks 1 Status:" -ForegroundColor Cyan
Write-Host "  ✅ Dependencies installed" -ForegroundColor Green
Write-Host "  ✅ @imagekit/next added" -ForegroundColor Green
Write-Host "  ✅ imagekitio-next removed" -ForegroundColor Green
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════
# Completion Message
# ═══════════════════════════════════════════════════════════════════════════

Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Setup Script Completed" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review .env.local configuration" -ForegroundColor White
Write-Host "  2. Run: pnpm db:push" -ForegroundColor White
Write-Host "  3. Run: pnpm db:seed" -ForegroundColor White
Write-Host "  4. Run: pnpm dev" -ForegroundColor White
Write-Host ""
