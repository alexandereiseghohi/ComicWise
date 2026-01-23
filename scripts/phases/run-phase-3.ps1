#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Run Phase 3: Database & Seeding
.DESCRIPTION
    Executes database migrations and seeding operations
.PARAMETER DryRun
    Preview mode - validate without making changes
.PARAMETER Verbose
    Enable detailed logging output
.EXAMPLE
    .\run-phase-3.ps1
    .\run-phase-3.ps1 -DryRun
    .\run-phase-3.ps1 -Verbose
#>

param(
    [switch]$DryRun,
    [switch]$Verbose
)

Write-Host "🚀 Running Phase 3: Database & Seeding" -ForegroundColor Cyan

$args = @(
    "run-phase",
    "3"
)

if ($DryRun) {
    $args += "--dry-run"
}

if ($Verbose) {
    $args += "--verbose"
}

tsx scripts/phases/phase-runner.ts @args

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Phase 3 completed successfully" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Phase 3 failed" -ForegroundColor Red
    exit $LASTEXITCODE
}
