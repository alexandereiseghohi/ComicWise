#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Run Phase 2: Environment & Configuration
.DESCRIPTION
    Verifies and configures environment variables and application settings
.PARAMETER DryRun
    Preview mode - show what would be done without making changes
.PARAMETER Verbose
    Enable detailed logging output
.EXAMPLE
    .\run-phase-2.ps1
    .\run-phase-2.ps1 -DryRun
    .\run-phase-2.ps1 -Verbose
#>

param(
    [switch]$DryRun,
    [switch]$Verbose
)

Write-Host "🚀 Running Phase 2: Environment & Configuration" -ForegroundColor Cyan

$args = @(
    "run-phase",
    "2"
)

if ($DryRun) {
    $args += "--dry-run"
}

if ($Verbose) {
    $args += "--verbose"
}

tsx scripts/phases/phase-runner.ts @args

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Phase 2 completed successfully" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Phase 2 failed" -ForegroundColor Red
    exit $LASTEXITCODE
}
