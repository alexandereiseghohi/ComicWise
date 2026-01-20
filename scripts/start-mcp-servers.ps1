# ComicWise MCP Servers Startup Script - Windows PowerShell
#
# This script starts all necessary MCP servers for ComicWise development
#
# Usage:
# .\scripts\start-mcp-servers.ps1
# .\scripts\start-mcp-servers.ps1 -StopExisting
#
# Features:
# - Checks if servers are already running
# - Starts PostgreSQL adapter
# - Starts Redis adapter (if configured)
# - Logs to .vscode/logs/mcp-servers.log
# - Cross-platform compatible (PowerShell 5+)

param(
    [switch]$StopExisting,
    [int]$Timeout = 30
)

# Color definitions
$colors = @{
    'Reset'   = "`e[0m"
    'Green'   = "`e[32m"
    'Red'     = "`e[31m"
    'Yellow'  = "`e[33m"
    'Blue'    = "`e[36m"
    'Bold'    = "`e[1m"
}

function Write-ColorOutput {
    param (
        [string]$Message,
        [string]$Color = 'Reset'
    )
    Write-Host "$($colors[$Color])$Message$($colors['Reset'])"
}

function Write-Log {
    param (
        [string]$Message,
        [string]$Level = 'INFO'
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logDir = ".vscode/logs"

    # Create logs directory if it doesn't exist
    if (!(Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir | Out-Null
    }

    $logFile = Join-Path $logDir "mcp-servers.log"
    "$timestamp [$Level] $Message" | Add-Content -Path $logFile

    Write-ColorOutput "$Message" @{ 'INFO' = 'Blue'; 'ERROR' = 'Red'; 'SUCCESS' = 'Green'; 'WARN' = 'Yellow' }[$Level]
}

Write-ColorOutput "`n🚀 ComicWise MCP Servers Startup`n" 'Bold'
Write-Log "Starting MCP servers" "INFO"

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Log "Node.js version: $nodeVersion" "INFO"
    Write-ColorOutput "✅ Node.js found: $nodeVersion" "Green"
} catch {
    Write-Log "Node.js not found" "ERROR"
    Write-ColorOutput "❌ Node.js not found. Please install Node.js." "Red"
    exit 1
}

# Check if pnpm is installed
try {
    $pnpmVersion = pnpm -v
    Write-Log "pnpm version: $pnpmVersion" "INFO"
    Write-ColorOutput "✅ pnpm found: $pnpmVersion" "Green"
} catch {
    Write-Log "pnpm not found" "ERROR"
    Write-ColorOutput "❌ pnpm not found. Installing with npm..." "Yellow"
    npm install -g pnpm
}

# Load environment variables
if (Test-Path ".env.local") {
    Write-Log "Loading .env.local" "INFO"
    Get-Content .env.local | foreach-object {
        $name, $value = $_.split("=")
        if ($name -and $value) {
            Set-Item -Path env:$name -Value $value
        }
    }
} else {
    Write-Log ".env.local not found" "WARN"
}

# Stop existing processes if requested
if ($StopExisting) {
    Write-ColorOutput "`n🛑 Stopping existing MCP processes..." "Yellow"
    Write-Log "Stopping existing MCP processes" "INFO"

    Get-Process node -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -match "mcp|server" } |
        Stop-Process -Force -ErrorAction SilentlyContinue

    Start-Sleep -Seconds 2
}

# Start PostgreSQL MCP Server
Write-ColorOutput "`n📀 Starting PostgreSQL MCP Server..." "Blue"
Write-Log "Attempting to start PostgreSQL MCP server" "INFO"

$pgServerProcess = Start-Process `
    -FilePath "node" `
    -ArgumentList "./scripts/mcp/postgres-mcp-server.ts" `
    -RedirectStandardOutput ".vscode/logs/pg-server.log" `
    -RedirectStandardError ".vscode/logs/pg-server-error.log" `
    -PassThru `
    -WindowStyle Hidden

if ($pgServerProcess) {
    Write-Log "PostgreSQL MCP server started (PID: $($pgServerProcess.Id))" "INFO"
    Write-ColorOutput "✅ PostgreSQL MCP server started (PID: $($pgServerProcess.Id))" "Green"
} else {
    Write-Log "Failed to start PostgreSQL MCP server" "ERROR"
    Write-ColorOutput "❌ Failed to start PostgreSQL MCP server" "Red"
}

# Start Redis MCP Server (if Redis is configured)
if ($env:REDIS_URL) {
    Write-ColorOutput "`n🔴 Starting Redis MCP Server..." "Blue"
    Write-Log "Attempting to start Redis MCP server" "INFO"

    $redisServerProcess = Start-Process `
        -FilePath "node" `
        -ArgumentList "./scripts/mcp/redis-mcp-server.ts" `
        -RedirectStandardOutput ".vscode/logs/redis-server.log" `
        -RedirectStandardError ".vscode/logs/redis-server-error.log" `
        -PassThru `
        -WindowStyle Hidden

    if ($redisServerProcess) {
        Write-Log "Redis MCP server started (PID: $($redisServerProcess.Id))" "INFO"
        Write-ColorOutput "✅ Redis MCP server started (PID: $($redisServerProcess.Id))" "Green"
    } else {
        Write-Log "Failed to start Redis MCP server" "ERROR"
        Write-ColorOutput "⚠️  Failed to start Redis MCP server" "Yellow"
    }
} else {
    Write-ColorOutput "⏭️  Redis not configured (skipping)" "Yellow"
    Write-Log "Redis not configured - skipping Redis server startup" "WARN"
}

# Wait for servers to start
Write-ColorOutput "`n⏳ Waiting for servers to be ready..." "Yellow"
Start-Sleep -Seconds 3

# Verify servers are running
Write-ColorOutput "`n🔍 Verifying MCP servers..." "Blue"

$processCount = @(Get-Process node -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -match "mcp|server" }).Count

if ($processCount -gt 0) {
    Write-Log "Verification successful - $processCount MCP servers running" "SUCCESS"
    Write-ColorOutput "✅ Verification successful - $processCount MCP server(s) running" "Green"
} else {
    Write-Log "Verification failed - no MCP servers running" "ERROR"
    Write-ColorOutput "❌ Verification failed - no MCP servers running" "Red"
}

# Display server logs location
Write-ColorOutput "`n📋 Server logs:" "Blue"
Write-ColorOutput "  - PostgreSQL: .vscode/logs/pg-server.log" "Blue"
Write-ColorOutput "  - Redis: .vscode/logs/redis-server.log" "Blue"
Write-ColorOutput "  - Startup: .vscode/logs/mcp-servers.log" "Blue"

Write-ColorOutput "`n✅ MCP servers startup complete!\n" "Green"
Write-Log "MCP servers startup complete" "SUCCESS"
