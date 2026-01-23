# ═══════════════════════════════════════════════════════════════════════════
# ComicWise Phase Runner - Master PowerShell Wrapper
# ═══════════════════════════════════════════════════════════════════════════
#
# Orchestrates phase-based automation with options:
#   -DryRun              Preview without changes
#   -SkipCompleted       Skip completed phases
#   -Verbose             Detailed logging
#   -Phase 1             Run specific phase
#   -Phase "1-3"         Run phase range
#   -Force               Force re-run of completed
#
# Examples:
#   .\run-phases.ps1
#   .\run-phases.ps1 -DryRun -Verbose
#   .\run-phases.ps1 -Phase 1
#   .\run-phases.ps1 -Phase "1-5" -SkipCompleted

param(
    [switch]$DryRun,
    [switch]$SkipCompleted,
    [switch]$Verbose,
    [switch]$Force,
    [string]$Phase
)

$ErrorActionPreference = "Stop"

# Build command arguments
$args = @()

if ($DryRun) { $args += "--dry-run" }
if ($SkipCompleted) { $args += "--skip-completed" }
if ($Verbose) { $args += "--verbose" }
if ($Force) { $args += "--force" }
if ($Phase) { $args += "--phase=$Phase" }

# Execute phase runner
Write-Host "🚀 Starting ComicWise Phase Automation..." -ForegroundColor Cyan
Write-Host ""

node --loader tsx scripts/phases/phase-runner.ts run-all @args

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Phase automation completed successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Phase automation failed. See details above." -ForegroundColor Red
    exit 1
}
