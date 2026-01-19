# ═══════════════════════════════════════════════════
# PROJECT OPTIMIZATION SCRIPT - PowerShell
# ═══════════════════════════════════════════════════

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     COMPREHENSIVE PROJECT OPTIMIZATION - ComicWise          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$ErrorActionPreference = "Continue"

# Task 1: Install dependencies
Write-Host "`n📦 Task 1: Installing Dependencies...`n" -ForegroundColor Yellow
pnpm install --prefer-offline
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed`n" -ForegroundColor Green
}

# Task 2: Optimize imports
Write-Host "`n🔧 Task 2: Optimizing Import Paths...`n" -ForegroundColor Yellow
pnpm tsx scripts/replace-imports.ts
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Import paths optimized`n" -ForegroundColor Green
}

# Task 3: Format code
Write-Host "`n✨ Task 3: Formatting Code...`n" -ForegroundColor Yellow
pnpm format
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Code formatted`n" -ForegroundColor Green
}

# Task 4: Lint and fix
Write-Host "`n🔍 Task 4: Linting and Fixing...`n" -ForegroundColor Yellow
pnpm lint:fix
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Linting complete`n" -ForegroundColor Green
}

# Task 5: Type check
Write-Host "`n📝 Task 5: Type Checking...`n" -ForegroundColor Yellow
pnpm type-check
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Type check passed`n" -ForegroundColor Green
} else {
    Write-Host "⚠ Type check found issues - review and fix manually`n" -ForegroundColor Yellow
}

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                  Optimization Complete                       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "✅ Project optimization completed!`n" -ForegroundColor Green
