#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Run Phase 8: Testing & Quality Assurance
.DESCRIPTION
    Executes comprehensive testing and quality assurance checks
.PARAMETER DryRun
    Preview mode - show what would be tested
.PARAMETER Verbose
    Enable detailed logging output
.EXAMPLE
    .\run-phase-8.ps1
    .\run-phase-8.ps1 -DryRun
    .\run-phase-8.ps1 -Verbose
#>

param(
    [switch]$DryRun,
    [switch]$Verbose
)

Write-Host "🚀 Running Phase 8: Testing & Quality Assurance" -ForegroundColor Cyan

$args = @(
    "run-phase",
    "8"
)

if ($DryRun) {
    $args += "--dry-run"
}

if ($Verbose) {
    $args += "--verbose"
}

tsx scripts/phases/phase-runner.ts @args

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Phase 8 completed successfully" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Phase 8 failed" -ForegroundColor Red
    exit $LASTEXITCODE
}
