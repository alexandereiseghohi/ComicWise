#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Run Phase 5: Scripts & Automation
.DESCRIPTION
    Optimizes and validates all project automation scripts
.PARAMETER DryRun
    Preview mode - show what would be optimized
.PARAMETER Verbose
    Enable detailed logging output
.EXAMPLE
    .\run-phase-5.ps1
    .\run-phase-5.ps1 -DryRun
    .\run-phase-5.ps1 -Verbose
#>

param(
    [switch]$DryRun,
    [switch]$Verbose
)

Write-Host "🚀 Running Phase 5: Scripts & Automation" -ForegroundColor Cyan

$args = @(
    "run-phase",
    "5"
)

if ($DryRun) {
    $args += "--dry-run"
}

if ($Verbose) {
    $args += "--verbose"
}

tsx scripts/phases/phase-runner.ts @args

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Phase 5 completed successfully" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Phase 5 failed" -ForegroundColor Red
    exit $LASTEXITCODE
}
