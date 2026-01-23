#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Run All Phases or Specific Phase Range
.DESCRIPTION
    Master runner for the complete 9-phase automation system
.PARAMETER DryRun
    Preview mode - show what would be done without making changes
.PARAMETER SkipCompleted
    Automatically skip phases marked as completed
.PARAMETER Verbose
    Enable detailed logging output
.PARAMETER StartPhase
    Start from specific phase (1-9, default: 1)
.PARAMETER EndPhase
    End at specific phase (1-9, default: 9)
.PARAMETER Verify
    Run verification only, don't execute phases
.PARAMETER Status
    Show status of all phases
.PARAMETER Report
    Generate completion report
.EXAMPLE
    .\run-all-phases.ps1                           # Run all phases
    .\run-all-phases.ps1 -DryRun                   # Preview without changes
    .\run-all-phases.ps1 -SkipCompleted            # Skip completed phases
    .\run-all-phases.ps1 -Verbose                  # Detailed output
    .\run-all-phases.ps1 -StartPhase 5 -EndPhase 8 # Run phases 5-8
    .\run-all-phases.ps1 -Status                   # Show phase status
    .\run-all-phases.ps1 -Report                   # Generate report
#>

param(
    [switch]$DryRun,
    [switch]$SkipCompleted,
    [switch]$Verbose,
    [switch]$Verify,
    [switch]$Status,
    [switch]$Report,
    [ValidateRange(1, 9)]
    [int]$StartPhase = 1,
    [ValidateRange(1, 9)]
    [int]$EndPhase = 9
)

if ($Status) {
    Write-Host "📊 Phase Status Report" -ForegroundColor Cyan
    tsx scripts/phases/phase-runner.ts status
    exit 0
}

if ($Report) {
    Write-Host "📋 Generating Phase Completion Report" -ForegroundColor Cyan
    tsx scripts/phases/phase-runner.ts report
    exit 0
}

if ($Verify) {
    Write-Host "🔍 Verifying All Phases" -ForegroundColor Cyan
    tsx scripts/phases/phase-runner.ts verify
    exit 0
}

Write-Host "🚀 Running Phases $StartPhase to $EndPhase" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$args = @(
    "run-all"
)

if ($DryRun) {
    $args += "--dry-run"
    Write-Host "📝 DRY-RUN MODE: No changes will be made" -ForegroundColor Yellow
}

if ($SkipCompleted) {
    $args += "--skip-completed"
}

if ($Verbose) {
    $args += "--verbose"
}

$args += "--start-phase=$StartPhase"
$args += "--end-phase=$EndPhase"

tsx scripts/phases/phase-runner.ts @args

$exitCode = $LASTEXITCODE

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

if ($exitCode -eq 0) {
    Write-Host "✅ All phases completed successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  • Run '.\run-all-phases.ps1 -Report' to view completion report"
    Write-Host "  • Run 'pnpm validate' to ensure code quality"
    Write-Host "  • Run 'pnpm test' to execute test suite"
    exit 0
} else {
    Write-Host "❌ Phase execution failed (exit code: $exitCode)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Cyan
    Write-Host "  • Run with -Verbose flag for detailed output"
    Write-Host "  • Check logs in .phases-progress.json"
    Write-Host "  • Run '.\run-all-phases.ps1 -Status' to see current status"
    exit $exitCode
}
