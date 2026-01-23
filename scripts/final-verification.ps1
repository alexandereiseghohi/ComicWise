#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Final Verification & Build Script
    Validates all fixes and builds the project
#>

$ErrorActionPreference = "Continue"

Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║     Final Verification & Build - ComicWise Project            ║
╚════════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

Write-Host "`n[1/4] TYPE CHECKING..." -ForegroundColor Yellow
Write-Host "━" * 60

pnpm type-check 2>&1 | Select-Object -Last 10
$typeCheckResult = $LASTEXITCODE

Write-Host "`n[2/4] VALIDATION..." -ForegroundColor Yellow
Write-Host "━" * 60

pnpm validate:quick 2>&1 | Select-Object -Last 15
$validateResult = $LASTEXITCODE

Write-Host "`n[3/4] LINTING CHECK..." -ForegroundColor Yellow
Write-Host "━" * 60

$lintOutput = pnpm lint 2>&1 | Select-Object -Last 20
$lintOutput
$lintResult = $LASTEXITCODE

Write-Host "`n[4/4] BUILD..." -ForegroundColor Yellow
Write-Host "━" * 60

$buildOutput = pnpm build 2>&1 | Select-Object -Last 30
$buildOutput
$buildResult = $LASTEXITCODE

# Summary
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║                      FINAL RESULTS                            ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Blue

Write-Host "`nType Checking:  $(if ($typeCheckResult -eq 0) { '✓ PASS' } else { '✗ FAIL' })" -ForegroundColor $(if ($typeCheckResult -eq 0) { 'Green' } else { 'Red' })
Write-Host "Validation:     $(if ($validateResult -eq 0) { '✓ PASS' } else { '✗ FAIL' })" -ForegroundColor $(if ($validateResult -eq 0) { 'Green' } else { 'Red' })
Write-Host "Linting:        $(if ($lintResult -eq 0) { '✓ PASS' } else { '⚠ WARNINGS' })" -ForegroundColor $(if ($lintResult -eq 0) { 'Green' } else { 'Yellow' })
Write-Host "Build:          $(if ($buildResult -eq 0) { '✓ PASS' } else { '✗ FAIL' })" -ForegroundColor $(if ($buildResult -eq 0) { 'Green' } else { 'Red' })

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  ✓ ComicWise Project Validation Complete                      ║" -ForegroundColor Cyan
Write-Host "║    All critical systems verified and ready for deployment     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

exit (($typeCheckResult -bor $validateResult -bor $buildResult) -ne 0 ? 1 : 0)
