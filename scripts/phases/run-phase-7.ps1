#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Run Phase 7: Documentation & Quality
.DESCRIPTION
    Generates documentation and validates code quality standards
.PARAMETER DryRun
    Preview mode - show what would be generated
.PARAMETER Verbose
    Enable detailed logging output
.EXAMPLE
    .\run-phase-7.ps1
    .\run-phase-7.ps1 -DryRun
    .\run-phase-7.ps1 -Verbose
#>

param(
    [switch]$DryRun,
    [switch]$Verbose
)

Write-Host "🚀 Running Phase 7: Documentation & Quality" -ForegroundColor Cyan

$args = @(
    "run-phase",
    "7"
)

if ($DryRun) {
    $args += "--dry-run"
}

if ($Verbose) {
    $args += "--verbose"
}

tsx scripts/phases/phase-runner.ts @args

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Phase 7 completed successfully" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Phase 7 failed" -ForegroundColor Red
    exit $LASTEXITCODE
}
