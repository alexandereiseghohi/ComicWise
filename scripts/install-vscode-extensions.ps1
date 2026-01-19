#!/usr/bin/env pwsh
# ═══════════════════════════════════════════════════════════════════
# VS Code Extensions Installation Script
# ═══════════════════════════════════════════════════════════════════
# Description: Installs recommended VS Code extensions
# Usage: .\scripts\install-vscode-extensions.ps1
# ═══════════════════════════════════════════════════════════════════

param(
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"

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
# Check VS Code CLI
# ═══════════════════════════════════════════════════════════════════
Write-Header "`n═══════════════════════════════════════════════════════════════════"
Write-Header "VS Code Extensions Installer"
Write-Header "═══════════════════════════════════════════════════════════════════`n"

if (-not (Get-Command code -ErrorAction SilentlyContinue)) {
    Write-Error "VS Code CLI 'code' not found in PATH"
    Write-Info "Please ensure VS Code is installed and 'code' is added to PATH"
    Write-Info "You can add it via: VS Code > Command Palette > 'Shell Command: Install code command in PATH'"
    exit 1
}

Write-Success "VS Code CLI found"

# ═══════════════════════════════════════════════════════════════════
# Load Extensions Configuration
# ═══════════════════════════════════════════════════════════════════
$extensionsConfigPath = ".\.vscode\extensions.json"
if (-not (Test-Path $extensionsConfigPath)) {
    Write-Error "Extensions configuration not found at: $extensionsConfigPath"
    exit 1
}

Write-Info "Loading extensions configuration from: $extensionsConfigPath"
try {
    $extensionsConfig = Get-Content $extensionsConfigPath -Raw | ConvertFrom-Json
    Write-Success "Extensions configuration loaded successfully"
} catch {
    Write-Error "Failed to parse extensions configuration: $_"
    exit 1
}

# ═══════════════════════════════════════════════════════════════════
# Get Currently Installed Extensions
# ═══════════════════════════════════════════════════════════════════
Write-Header "`n--- Checking Installed Extensions ---`n"
Write-Info "Fetching list of installed extensions..."

try {
    $installedExtensions = code --list-extensions
    Write-Success "Found $($installedExtensions.Count) installed extensions"
} catch {
    Write-Error "Failed to get installed extensions: $_"
    exit 1
}

# ═══════════════════════════════════════════════════════════════════
# Install Recommended Extensions
# ═══════════════════════════════════════════════════════════════════
Write-Header "`n--- Installing Recommended Extensions ---`n"

$recommendations = $extensionsConfig.recommendations
$totalExtensions = $recommendations.Count
$alreadyInstalled = 0
$newlyInstalled = 0
$failed = 0

foreach ($extension in $recommendations) {
    if ($installedExtensions -contains $extension) {
        Write-Success "[$extension] Already installed"
        $alreadyInstalled++
    } else {
        if ($DryRun) {
            Write-Info "  [DRY RUN] Would install: $extension"
            $newlyInstalled++
        } else {
            Write-Info "[$extension] Installing..."
            try {
                $result = code --install-extension $extension --force 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Success "  [$extension] Installed successfully"
                    $newlyInstalled++
                } else {
                    Write-Error "  [$extension] Installation failed"
                    if ($Verbose) {
                        Write-Host $result
                    }
                    $failed++
                }
            } catch {
                Write-Error "  [$extension] Installation error: $_"
                $failed++
            }
        }
    }
}

# ═══════════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════════
Write-Header "`n═══════════════════════════════════════════════════════════════════"
Write-Header "Installation Summary"
Write-Header "═══════════════════════════════════════════════════════════════════`n"

Write-Info "Total Recommended Extensions: $totalExtensions"
Write-Success "Already Installed: $alreadyInstalled"
Write-Success "Newly Installed: $newlyInstalled"
if ($failed -gt 0) {
    Write-Error "Failed: $failed"
}

if ($failed -eq 0) {
    Write-Header "`n${GREEN}All recommended extensions are installed!${RESET}`n"
    Write-Info "Please restart VS Code to activate new extensions"
    exit 0
} else {
    Write-Header "`n${YELLOW}Some extensions failed to install. Check logs above.${RESET}`n"
    exit 1
}
