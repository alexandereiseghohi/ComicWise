<#
.SYNOPSIS
    Start development server with optional debugging
    
.DESCRIPTION
    Starts the Next.js development server with Turbopack
    
.PARAMETER Debug
    Enable Node.js debugging (--inspect)
    
.PARAMETER Port
    Port number for the development server (default: 3000)
    
.PARAMETER Https
    Use experimental HTTPS support
    
.EXAMPLE
    .\dev.ps1
    
.EXAMPLE
    .\dev.ps1 -Debug
    
.EXAMPLE
    .\dev.ps1 -Port 4000
#>

param(
    [switch]$Debug,
    [int]$Port = 3000,
    [switch]$Https
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

    Write-Info "Starting development server on port $Port..."
    
    $env:PORT = $Port
    
    if ($Debug) {
        $env:NODE_OPTIONS = "--inspect"
        Write-Info "Debugging enabled - connect debugger to localhost:9229"
    }
    
    if ($Https) {
        & $pm dev:https
    }
    else {
        & $pm dev
    }
}
catch {
    Write-Error-Custom "Failed to start dev server: $_"
    exit 1
}
