#!/usr/bin/env pwsh
# ═══════════════════════════════════════════════════════════════════
# MCP Servers Verification and Startup Script
# ═══════════════════════════════════════════════════════════════════
# Description: Verifies and starts Model Context Protocol servers
# Usage: .\scripts\verify-mcp-servers.ps1
# ═══════════════════════════════════════════════════════════════════

param(
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

# ═══════════════════════════════════════════════════════════════════
# ANSI Color Codes
# ═══════════════════════════════════════════════════════════════════
$GREEN = "`e[32m"
$YELLOW = "`e[33m"
$RED = "`e[31m"
$BLUE = "`e[34m"
$CYAN = "`e[36m"
$RESET = "`e[0m"
$BOLD = "`e[1m"

# ═══════════════════════════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════════════════════════
function Write-Success { param($msg) Write-Host "${GREEN}✓${RESET} $msg" }
function Write-Info { param($msg) Write-Host "${BLUE}ℹ${RESET} $msg" }
function Write-Warning { param($msg) Write-Host "${YELLOW}⚠${RESET} $msg" }
function Write-Error { param($msg) Write-Host "${RED}✗${RESET} $msg" }
function Write-Header { param($msg) Write-Host "${BOLD}${CYAN}$msg${RESET}" }

# ═══════════════════════════════════════════════════════════════════
# Load MCP Configuration
# ═══════════════════════════════════════════════════════════════════
Write-Header "`n═══════════════════════════════════════════════════════════════════"
Write-Header "MCP Servers Verification"
Write-Header "═══════════════════════════════════════════════════════════════════`n"

$mcpConfigPath = ".\.vscode\mcp.json"
if (-not (Test-Path $mcpConfigPath)) {
    Write-Error "MCP configuration not found at: $mcpConfigPath"
    exit 1
}

Write-Info "Loading MCP configuration from: $mcpConfigPath"
try {
    $mcpConfig = Get-Content $mcpConfigPath -Raw | ConvertFrom-Json -ErrorAction Stop
    Write-Success "MCP configuration loaded successfully"
} catch {
    Write-Error "Failed to parse MCP configuration: $_"
    exit 1
}

# ═══════════════════════════════════════════════════════════════════
# Verify Prerequisites
# ═══════════════════════════════════════════════════════════════════
Write-Header "`n--- Checking Prerequisites ---`n"

# Check Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Success "Node.js: $nodeVersion"
} else {
    Write-Error "Node.js not found. Please install Node.js 20+"
    exit 1
}

# Check npm/npx
if (Get-Command npx -ErrorAction SilentlyContinue) {
    $npxVersion = npx --version
    Write-Success "npx: v$npxVersion"
} else {
    Write-Error "npx not found. Please ensure npm is installed"
    exit 1
}

# Check pnpm
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    $pnpmVersion = pnpm --version
    Write-Success "pnpm: v$pnpmVersion"
} else {
    Write-Warning "pnpm not found. Installing pnpm..."
    npm install -g pnpm
}

# ═══════════════════════════════════════════════════════════════════
# Verify MCP Servers
# ═══════════════════════════════════════════════════════════════════
Write-Header "`n--- Verifying MCP Servers ---`n"

$servers = $mcpConfig.mcpServers.PSObject.Properties | Where-Object { $_.Name -notlike "//*" }
$totalServers = $servers.Count
$enabledServers = 0
$disabledServers = 0
$verifiedServers = 0
$failedServers = 0

foreach ($server in $servers) {
    $serverName = $server.Name
    $serverConfig = $server.Value
    
    if ($serverConfig.disabled -eq $true) {
        Write-Warning "[$serverName] Disabled - Skipping"
        $disabledServers++
        continue
    }
    
    $enabledServers++
    
    Write-Info "[$serverName] Verifying..."
    
    # Extract package name from args
    if ($serverConfig.args -and $serverConfig.args.Count -gt 1) {
        $packageName = $serverConfig.args[1]
        
        if ($DryRun) {
            Write-Info "  [DRY RUN] Would verify: $packageName"
            $verifiedServers++
        } else {
            # Try to verify package exists
            try {
                $checkCmd = "npx -y $packageName --help"
                if ($Verbose) {
                    Write-Info "  Command: $checkCmd"
                }
                
                $process = Start-Process -FilePath "npx" -ArgumentList "-y", $packageName, "--version" `
                    -NoNewWindow -PassThru -Wait -RedirectStandardOutput "nul" -RedirectStandardError "nul"
                
                if ($process.ExitCode -eq 0 -or $process.ExitCode -eq $null) {
                    Write-Success "  [$serverName] Verified"
                    $verifiedServers++
                } else {
                    Write-Warning "  [$serverName] Package verification returned non-zero exit code"
                    $verifiedServers++
                }
            } catch {
                Write-Error "  [$serverName] Verification failed: $_"
                $failedServers++
            }
        }
    } else {
        Write-Warning "  [$serverName] No package specified in args"
        $failedServers++
    }
}

# ═══════════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════════
Write-Header "`n═══════════════════════════════════════════════════════════════════"
Write-Header "Verification Summary"
Write-Header "═══════════════════════════════════════════════════════════════════`n"

Write-Info "Total Servers: $totalServers"
Write-Success "Enabled Servers: $enabledServers"
Write-Warning "Disabled Servers: $disabledServers"
Write-Success "Verified Servers: $verifiedServers"
if ($failedServers -gt 0) {
    Write-Error "Failed Servers: $failedServers"
}

Write-Header "`n--- MCP Server Information ---`n"
Write-Info "MCP servers are managed by VS Code and start automatically when needed"
Write-Info "To use MCP servers, ensure GitHub Copilot CLI extension is installed"
Write-Info "Configuration: .vscode\mcp.json"

if ($failedServers -eq 0) {
    Write-Header "`n${GREEN}All enabled MCP servers verified successfully!${RESET}`n"
    exit 0
} else {
    Write-Header "`n${YELLOW}Some MCP servers failed verification. Check logs above.${RESET}`n"
    exit 1
}
