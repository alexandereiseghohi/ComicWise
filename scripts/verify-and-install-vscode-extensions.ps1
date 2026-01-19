#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Verify and install recommended VS Code extensions for ComicWise project

.DESCRIPTION
  This script checks which recommended extensions are installed and
  installs missing ones using the VS Code CLI.

.PARAMETER DryRun
  Check extensions without installing

.PARAMETER Force
  Force reinstall all extensions

.EXAMPLE
  .\verify-and-install-vscode-extensions.ps1
  .\verify-and-install-vscode-extensions.ps1 -DryRun
  .\verify-and-install-vscode-extensions.ps1 -Force

.NOTES
  Version: 1.0.0
  Author: ComicWise Team
  Last Modified: 2026-01-18
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false)]
    [switch]$DryRun,
    
    [Parameter(Mandatory = $false)]
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$EXTENSIONS_FILE = Join-Path $PSScriptRoot ".." ".vscode" "extensions.json"
$LOG_DIR = Join-Path $PSScriptRoot ".." ".vscode" "logs"
$LOG_FILE = Join-Path $LOG_DIR "extensions-install-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

# ═══════════════════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════

function Write-Log {
    param(
        [string]$Message,
        [ValidateSet("INFO", "SUCCESS", "WARNING", "ERROR")]
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    if (!(Test-Path $LOG_DIR)) {
        New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null
    }
    
    Add-Content -Path $LOG_FILE -Value $logMessage
    
    switch ($Level) {
        "SUCCESS" { Write-Host $logMessage -ForegroundColor Green }
        "WARNING" { Write-Host $logMessage -ForegroundColor Yellow }
        "ERROR"   { Write-Host $logMessage -ForegroundColor Red }
        default   { Write-Host $logMessage }
    }
}

function Test-VSCodeCLI {
    try {
        $null = code --version 2>&1
        return $true
    }
    catch {
        return $false
    }
}

function Get-InstalledExtensions {
    try {
        $output = code --list-extensions 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $output
        }
        return @()
    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-Log "Failed to get installed extensions: $errorMsg" -Level "ERROR"
        return @()
    }
}

function Install-Extension {
    param([string]$ExtensionId)
    
    if ($DryRun) {
        Write-Log "DRY RUN: Would install $ExtensionId" -Level "INFO"
        return $true
    }
    
    try {
        Write-Log "Installing $ExtensionId..." -Level "INFO"
        $output = code --install-extension $ExtensionId --force 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Successfully installed $ExtensionId" -Level "SUCCESS"
            return $true
        }
        else {
            Write-Log "Failed to install $ExtensionId" -Level "ERROR"
            return $false
        }
    }
    catch {
        $errorMsg = $_.Exception.Message
        Write-Log "Error installing $ExtensionId : $errorMsg" -Level "ERROR"
        return $false
    }
}

# ═══════════════════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════════════════

Write-Log "═══════════════════════════════════════════════════════════════" -Level "INFO"
Write-Log "ComicWise VS Code Extensions Installer" -Level "INFO"
Write-Log "═══════════════════════════════════════════════════════════════" -Level "INFO"

# Check VS Code CLI
Write-Log "`nChecking VS Code CLI availability..." -Level "INFO"
if (!(Test-VSCodeCLI)) {
    Write-Log "VS Code CLI 'code' command not found!" -Level "ERROR"
    Write-Log "Please ensure VS Code is installed and 'code' is in your PATH" -Level "ERROR"
    exit 1
}
Write-Log "VS Code CLI is available" -Level "SUCCESS"

# Load extensions configuration
Write-Log "`nLoading extensions configuration..." -Level "INFO"
if (!(Test-Path $EXTENSIONS_FILE)) {
    Write-Log "Extensions file not found: $EXTENSIONS_FILE" -Level "ERROR"
    exit 1
}

try {
    $config = Get-Content $EXTENSIONS_FILE -Raw | ConvertFrom-Json
    $recommendations = $config.recommendations
    Write-Log "Found $($recommendations.Count) recommended extensions" -Level "SUCCESS"
}
catch {
    Write-Log "Failed to parse extensions file: $_" -Level "ERROR"
    exit 1
}

# Get currently installed extensions
Write-Log "`nGetting currently installed extensions..." -Level "INFO"
$installedExtensions = Get-InstalledExtensions
Write-Log "Found $($installedExtensions.Count) installed extensions" -Level "SUCCESS"

# Analyze extensions
Write-Log "`nAnalyzing extensions..." -Level "INFO"
$toInstall = @()
$alreadyInstalled = @()

foreach ($ext in $recommendations) {
    if ($Force) {
        $toInstall += $ext
    }
    elseif ($installedExtensions -contains $ext) {
        $alreadyInstalled += $ext
    }
    else {
        $toInstall += $ext
    }
}

Write-Log "Already installed: $($alreadyInstalled.Count)" -Level "SUCCESS"
Write-Log "To install: $($toInstall.Count)" -Level "INFO"

# Display summary
if ($alreadyInstalled.Count -gt 0) {
    Write-Log "`nAlready installed extensions:" -Level "INFO"
    foreach ($ext in $alreadyInstalled | Select-Object -First 10) {
        Write-Log "  ✓ $ext" -Level "SUCCESS"
    }
    if ($alreadyInstalled.Count -gt 10) {
        Write-Log "  ... and $($alreadyInstalled.Count - 10) more" -Level "INFO"
    }
}

# Install missing extensions
if ($toInstall.Count -gt 0) {
    Write-Log "`nInstalling extensions..." -Level "INFO"
    
    $successCount = 0
    $failCount = 0
    
    foreach ($ext in $toInstall) {
        if (Install-Extension -ExtensionId $ext) {
            $successCount++
        }
        else {
            $failCount++
        }
        Start-Sleep -Milliseconds 500  # Rate limiting
    }
    
    Write-Log "`n═══════════════════════════════════════════════════════════════" -Level "INFO"
    Write-Log "Installation Complete" -Level "INFO"
    Write-Log "═══════════════════════════════════════════════════════════════" -Level "INFO"
    Write-Log "Successfully installed: $successCount" -Level "SUCCESS"
    if ($failCount -gt 0) {
        Write-Log "Failed: $failCount" -Level "ERROR"
    }
    Write-Log "Already installed: $($alreadyInstalled.Count)" -Level "INFO"
    Write-Log "Total recommended: $($recommendations.Count)" -Level "INFO"
}
else {
    Write-Log "`nAll recommended extensions are already installed!" -Level "SUCCESS"
}

Write-Log "`nLog file saved to: $LOG_FILE" -Level "INFO"

if ($DryRun) {
    Write-Log "`nThis was a DRY RUN. No extensions were installed." -Level "INFO"
}

exit 0
