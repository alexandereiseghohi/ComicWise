#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Run Phase 4: Frontend Implementation
.DESCRIPTION
    Creates and validates all frontend pages and components
.PARAMETER DryRun
    Preview mode - show what would be created
.PARAMETER Verbose
    Enable detailed logging output
.EXAMPLE
    .\run-phase-4.ps1
    .\run-phase-4.ps1 -DryRun
    .\run-phase-4.ps1 -Verbose
#>

param(
    [switch]$DryRun,
    [switch]$Verbose
)

Write-Host "🚀 Running Phase 4: Frontend Implementation" -ForegroundColor Cyan

$args = @(
    "run-phase",
    "4"
)

if ($DryRun) {
    $args += "--dry-run"
}

if ($Verbose) {
    $args += "--verbose"
}

tsx scripts/phases/phase-runner.ts @args

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Phase 4 completed successfully" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Phase 4 failed" -ForegroundColor Red
    exit $LASTEXITCODE
}
