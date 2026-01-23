#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Run Phase 9: Optional Enhancements
.DESCRIPTION
    Implements optional enhancements like i18n, analytics, and onboarding
.PARAMETER DryRun
    Preview mode - show what would be implemented
.PARAMETER Verbose
    Enable detailed logging output
.EXAMPLE
    .\run-phase-9.ps1
    .\run-phase-9.ps1 -DryRun
    .\run-phase-9.ps1 -Verbose
#>

param(
    [switch]$DryRun,
    [switch]$Verbose
)

Write-Host "🚀 Running Phase 9: Optional Enhancements" -ForegroundColor Cyan

$args = @(
    "run-phase",
    "9"
)

if ($DryRun) {
    $args += "--dry-run"
}

if ($Verbose) {
    $args += "--verbose"
}

tsx scripts/phases/phase-runner.ts @args

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Phase 9 completed successfully" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Phase 9 failed" -ForegroundColor Red
    exit $LASTEXITCODE
}
