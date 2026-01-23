# ═══════════════════════════════════════════════════════════════════════════
# Phase 1: VS Code Configuration
# ═══════════════════════════════════════════════════════════════════════════

param(
    [switch]$DryRun,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Running Phase 1: VS Code Configuration" -ForegroundColor Cyan
Write-Host ""

$args = @("--phase=1")
if ($DryRun) { $args += "--dry-run" }
if ($Verbose) { $args += "--verbose" }

node --loader tsx scripts/phases/phase-runner.ts run-all @args

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Phase 1 completed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Phase 1 failed" -ForegroundColor Red
    exit 1
}
