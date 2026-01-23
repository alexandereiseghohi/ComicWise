#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Run Phase 6: CI/CD & DevOps
.DESCRIPTION
    Validates and optimizes CI/CD pipelines and DevOps configurations
.PARAMETER DryRun
    Preview mode - show what would be validated
.PARAMETER Verbose
    Enable detailed logging output
.EXAMPLE
    .\run-phase-6.ps1
    .\run-phase-6.ps1 -DryRun
    .\run-phase-6.ps1 -Verbose
#>

param(
    [switch]$DryRun,
    [switch]$Verbose
)

Write-Host "🚀 Running Phase 6: CI/CD & DevOps" -ForegroundColor Cyan

$args = @(
    "run-phase",
    "6"
)

if ($DryRun) {
    $args += "--dry-run"
}

if ($Verbose) {
    $args += "--verbose"
}

tsx scripts/phases/phase-runner.ts @args

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Phase 6 completed successfully" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Phase 6 failed" -ForegroundColor Red
    exit $LASTEXITCODE
}
