<#
.SYNOPSIS
    Run ESLint linter with various options
    
.DESCRIPTION
    Runs ESLint on the project with support for fixing and strict modes
    
.PARAMETER Fix
    Automatically fix linting errors
    
.PARAMETER Strict
    Fail on any warnings (no warnings allowed)
    
.PARAMETER FixType
    Automatically fix specific types: problem, suggestion, layout
    
.EXAMPLE
    .\lint.ps1
    
.EXAMPLE
    .\lint.ps1 -Fix
    
.EXAMPLE
    .\lint.ps1 -Strict
#>

param(
    [switch]$Fix,
    [switch]$Strict,
    [switch]$FixType
)

$ErrorActionPreference = "Stop"

function Write-Info { Write-Host "ℹ $_" -ForegroundColor Cyan }
function Write-Success { Write-Host "✓ $_" -ForegroundColor Green }
function Write-Error-Custom { Write-Host "✗ $_" -ForegroundColor Red }

try {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        $pm = "pnpm"
    }
    elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        $pm = "npm run"
    }
    else {
        throw "pnpm or npm not found"
    }

    Write-Info "Running ESLint..."
    
    if ($Strict) {
        & $pm lint:strict
    }
    elseif ($FixType) {
        & $pm lint:fixtype
    }
    elseif ($Fix) {
        & $pm lint:fix
    }
    else {
        & $pm lint
    }
    
    Write-Success "Linting completed successfully"
}
catch {
    Write-Error-Custom "Linting failed: $_"
    exit 1
}
