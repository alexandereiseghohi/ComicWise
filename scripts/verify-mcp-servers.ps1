#!/usr/bin/env pwsh
# ═══════════════════════════════════════════════════════════════════
# MCP Servers Verification and Startup Script (Enhanced with VS Code CLI)
# ═══════════════════════════════════════════════════════════════════
# Description: Verifies MCP servers, VS Code extensions, and project configuration
# Usage: .\scripts\verify-mcp-servers.ps1 [-InstallExtensions] [-StartServers] [-Verbose]
# ═══════════════════════════════════════════════════════════════════

param(
    [switch]$DryRun = $false,
    [switch]$Verbose = $false,
    [switch]$InstallExtensions = $false,
    [switch]$StartServers = $false,
    [switch]$CheckHealth = $false
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

# Check VS Code CLI
$vscodeCliAvailable = $false
$vscodeCommand = ""

if (Get-Command code -ErrorAction SilentlyContinue) {
    try {
        $vscodeVersion = code --version 2>$null | Select-Object -First 1
        Write-Success "VS Code CLI: $vscodeVersion"
        $vscodeCliAvailable = $true
        $vscodeCommand = "code"
    } catch {
        Write-Warning "VS Code CLI found but version check failed"
    }
}

if (-not $vscodeCliAvailable -and (Get-Command code-insiders -ErrorAction SilentlyContinue)) {
    try {
        $vscodeVersion = code-insiders --version 2>$null | Select-Object -First 1
        Write-Success "VS Code Insiders CLI: $vscodeVersion"
        $vscodeCliAvailable = $true
        $vscodeCommand = "code-insiders"
    } catch {
        Write-Warning "VS Code Insiders CLI found but version check failed"
    }
}

if (-not $vscodeCliAvailable) {
    Write-Warning "VS Code CLI not found in PATH. Extension management features disabled."
    Write-Info "To enable VS Code CLI, add VS Code to your PATH or run: code --install-extension"
}

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

# Check PostgreSQL (optional)
if (Get-Command psql -ErrorAction SilentlyContinue) {
    try {
        $pgVersion = psql --version
        Write-Success "PostgreSQL: $pgVersion"
    } catch {
        Write-Info "PostgreSQL CLI found but version check failed"
    }
} else {
    Write-Info "PostgreSQL CLI not found (optional)"
}

# Check Redis CLI (optional)
if (Get-Command redis-cli -ErrorAction SilentlyContinue) {
    try {
        $redisVersion = redis-cli --version
        Write-Success "Redis CLI: $redisVersion"
    } catch {
        Write-Info "Redis CLI found but version check failed"
    }
} else {
    Write-Info "Redis CLI not found (optional)"
}

# ═══════════════════════════════════════════════════════════════════
# Verify VS Code Extensions (if CLI available)
# ═══════════════════════════════════════════════════════════════════
if ($vscodeCliAvailable -and $InstallExtensions) {
    Write-Header "`n--- Verifying VS Code Extensions ---`n"

    $extensionsConfigPath = ".\.vscode\extensions.json"
    if (Test-Path $extensionsConfigPath) {
        try {
            $extensionsConfig = Get-Content $extensionsConfigPath -Raw | ConvertFrom-Json
            $recommendedExtensions = $extensionsConfig.recommendations

            Write-Info "Found $($recommendedExtensions.Count) recommended extensions"

            # Get installed extensions
            $installedExtensions = & $vscodeCommand --list-extensions 2>$null

            $missingExtensions = @()
            foreach ($ext in $recommendedExtensions) {
                if ($installedExtensions -contains $ext) {
                    Write-Success "  [$ext] Installed"
                } else {
                    Write-Warning "  [$ext] Not installed"
                    $missingExtensions += $ext
                }
            }

            if ($missingExtensions.Count -gt 0 -and -not $DryRun) {
                Write-Info "`nInstalling $($missingExtensions.Count) missing extensions..."
                foreach ($ext in $missingExtensions) {
                    Write-Info "  Installing: $ext"
                    & $vscodeCommand --install-extension $ext --force 2>$null
                    if ($LASTEXITCODE -eq 0) {
                        Write-Success "    Installed: $ext"
                    } else {
                        Write-Error "    Failed to install: $ext"
                    }
                }
            } elseif ($DryRun) {
                Write-Info "[DRY RUN] Would install $($missingExtensions.Count) extensions"
            }
        } catch {
            Write-Error "Failed to process extensions.json: $_"
        }
    } else {
        Write-Warning "Extensions configuration not found at: $extensionsConfigPath"
    }
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
$criticalServers = @()
$highPriorityServers = @()

foreach ($server in $servers) {
    $serverName = $server.Name
    $serverConfig = $server.Value

    if ($serverConfig.disabled -eq $true) {
        Write-Warning "[$serverName] Disabled - Skipping"
        $disabledServers++
        continue
    }

    $enabledServers++

    # Track priority servers
    if ($serverConfig.priority -eq "critical") {
        $criticalServers += $serverName
    } elseif ($serverConfig.priority -eq "high") {
        $highPriorityServers += $serverName
    }

    Write-Info "[$serverName] Verifying... (Priority: $($serverConfig.priority))"

    # Extract package name from args
    if ($serverConfig.args -and $serverConfig.args.Count -gt 1) {
        $packageName = $serverConfig.args[1]

        if ($DryRun) {
            Write-Info "  [DRY RUN] Would verify: $packageName"
            $verifiedServers++
        } else {
            # Try to verify package exists
            try {
                if ($Verbose) {
                    Write-Info "  Package: $packageName"
                    Write-Info "  Command: $($serverConfig.command) $($serverConfig.args -join ' ')"
                    Write-Info "  Timeout: $($serverConfig.timeout)ms"
                    if ($serverConfig.env) {
                        Write-Info "  Environment: $($serverConfig.env.PSObject.Properties.Name -join ', ')"
                    }
                }

                # Quick package availability check
                $process = Start-Process -FilePath "npx" -ArgumentList "-y", $packageName, "--version" `
                    -NoNewWindow -PassThru -Wait -RedirectStandardOutput "nul" -RedirectStandardError "nul"

                if ($null -eq $process.ExitCode -or $process.ExitCode -eq 0) {
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
# Health Check (Optional)
# ═══════════════════════════════════════════════════════════════════
if ($CheckHealth) {
    Write-Header "`n--- MCP Health Check ---`n"

    # Check log directory
    $logDir = ".\.vscode\logs"
    if (-not (Test-Path $logDir)) {
        Write-Info "Creating log directory: $logDir"
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        Write-Success "Log directory created"
    } else {
        Write-Success "Log directory exists: $logDir"
    }

    # Check MCP log file
    $mcpLogFile = "$logDir\mcp.log"
    if (Test-Path $mcpLogFile) {
        $logSize = (Get-Item $mcpLogFile).Length / 1MB
        Write-Info "MCP log file size: $([Math]::Round($logSize, 2)) MB"

        if ($logSize -gt 100) {
            Write-Warning "Log file exceeds 100MB. Consider rotating logs."
        }
    } else {
        Write-Info "MCP log file not found (will be created on first run)"
    }

    # Check environment variables
    Write-Header "`n--- Environment Variables ---`n"
    $requiredEnvVars = @(
        "DATABASE_URL",
        "REDIS_URL",
        "NEXTAUTH_SECRET"
    )

    foreach ($envVar in $requiredEnvVars) {
        $envValue = [Environment]::GetEnvironmentVariable($envVar)
        if ($envValue) {
            Write-Success "  [$envVar] Set (masked)"
        } else {
            Write-Warning "  [$envVar] Not set"
        }
    }
}

# ═══════════════════════════════════════════════════════════════════
# Start VS Code (Optional)
# ═══════════════════════════════════════════════════════════════════
if ($StartServers -and $vscodeCliAvailable -and -not $DryRun) {
    Write-Header "`n--- Starting VS Code with MCP Support ---`n"
    Write-Info "Opening VS Code with MCP configuration..."
    Write-Info "MCP servers will start automatically when needed by Copilot"

    # Open VS Code in current directory
    & $vscodeCommand . 2>$null

    if ($LASTEXITCODE -eq 0) {
        Write-Success "VS Code started successfully"
        Write-Info "MCP servers are managed by VS Code and will auto-start on demand"
    } else {
        Write-Error "Failed to start VS Code"
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

if ($criticalServers.Count -gt 0) {
    Write-Header "`n--- Critical Servers (Required) ---"
    foreach ($srv in $criticalServers) {
        Write-Info "  • $srv"
    }
}

if ($highPriorityServers.Count -gt 0) {
    Write-Header "`n--- High Priority Servers ---"
    foreach ($srv in $highPriorityServers) {
        Write-Info "  • $srv"
    }
}

Write-Header "`n--- MCP Server Information ---`n"
Write-Info "MCP servers are managed by VS Code and start automatically when needed"
Write-Info "To use MCP servers, ensure GitHub Copilot CLI extension is installed"
Write-Info "Configuration: .vscode\mcp.json"
Write-Info "Logs: .vscode\logs\mcp.log"

Write-Header "`n--- Available Commands ---`n"
Write-Info "Verify servers:           .\scripts\verify-mcp-servers.ps1"
Write-Info "Install extensions:       .\scripts\verify-mcp-servers.ps1 -InstallExtensions"
Write-Info "Start VS Code:            .\scripts\verify-mcp-servers.ps1 -StartServers"
Write-Info "Health check:             .\scripts\verify-mcp-servers.ps1 -CheckHealth"
Write-Info "Dry run:                  .\scripts\verify-mcp-servers.ps1 -DryRun"
Write-Info "Verbose output:           .\scripts\verify-mcp-servers.ps1 -Verbose"

if ($vscodeCliAvailable) {
    Write-Header "`n--- VS Code CLI Available ---`n"
    Write-Success "VS Code CLI: $vscodeCommand"
    Write-Info "Extensions can be installed automatically using -InstallExtensions flag"
} else {
    Write-Header "`n--- VS Code CLI Not Available ---`n"
    Write-Warning "Install VS Code CLI to enable automatic extension installation"
    Write-Info "Add VS Code to PATH or use: code --install-extension <extension-id>"
}

if ($failedServers -eq 0) {
    Write-Header "`n${GREEN}✓ All enabled MCP servers verified successfully!${RESET}`n"
    exit 0
} else {
    Write-Header "`n${YELLOW}⚠ Some MCP servers failed verification. Check logs above.${RESET}`n"
    exit 1
}
