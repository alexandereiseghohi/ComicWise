<#
.SYNOPSIS
    Run test suite (Playwright + Vitest)
    
.DESCRIPTION
    Runs either E2E tests (Playwright) or unit tests (Vitest)
    
.PARAMETER Unit
    Run unit tests with Vitest (default)
    
.PARAMETER E2E
    Run E2E tests with Playwright
    
.PARAMETER Watch
    Run in watch mode
    
.PARAMETER UI
    Run tests with UI interface
    
.PARAMETER Coverage
    Generate coverage report
    
.EXAMPLE
    .\test.ps1 --Unit
    
.EXAMPLE
    .\test.ps1 --E2E --Watch
    
.EXAMPLE
    .\test.ps1 --Unit --Coverage
#>

param(
    [switch]$Unit,
    [switch]$E2E,
    [switch]$Watch,
    [switch]$UI,
    [switch]$Coverage
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

    Write-Info "Running tests..."
    
    if ($E2E) {
        if ($Watch) {
            Write-Info "Running E2E tests in watch mode (not supported)"
            & $pm test
        }
        else {
            & $pm test
        }
    }
    else {
        # Unit tests (default)
        if ($UI) {
            & $pm test:unit:ui
        }
        elseif ($Coverage) {
            & $pm test:unit:coverage
        }
        elseif ($Watch) {
            & $pm test:unit:watch
        }
        else {
            & $pm test:unit:run
        }
    }
    
    Write-Success "Tests completed"
}
catch {
    Write-Error-Custom "Tests failed: $_"
    exit 1
}
