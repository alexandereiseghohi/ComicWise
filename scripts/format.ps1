<#
.SYNOPSIS
    Run Prettier code formatter
    
.DESCRIPTION
    Formats code using Prettier with optional check mode
    
.PARAMETER Check
    Check formatting without making changes
    
.PARAMETER Write
    Write formatted code to files (default)
    
.EXAMPLE
    .\format.ps1
    
.EXAMPLE
    .\format.ps1 -Check
#>

param(
    [switch]$Check
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

    Write-Info "Running Prettier..."
    
    if ($Check) {
        & $pm format:check
        Write-Success "Format check completed"
    }
    else {
        & $pm format
        Write-Success "Formatting completed successfully"
    }
}
catch {
    Write-Error-Custom "Formatting failed: $_"
    exit 1
}
