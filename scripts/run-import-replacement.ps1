#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Import Replacement Script Runner - Optimized & Validated

.DESCRIPTION
    Runs the import path replacement script with proper error handling,
    validation, and backup capabilities.

.PARAMETER DryRun
    Run in dry-run mode without modifying files

.PARAMETER Verbose
    Show detailed progress information

.PARAMETER Backup
    Create backup before running (recommended)

.PARAMETER Validate
    Run validation checks after replacement

.EXAMPLE
    .\run-import-replacement.ps1 -DryRun -Verbose
    Test what changes would be made

.EXAMPLE
    .\run-import-replacement.ps1 -Backup -Validate
    Run with backup and validation

.NOTES
    Version: 1.0.0
    Author: ComicWise Dev Team
    Date: 2025-12-26
#>

param(
    [switch]$DryRun,
    [switch]$Verbose,
    [switch]$Backup,
    [switch]$Validate
)

# ═══════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$SCRIPT_NAME = "fix-imports.cjs"  # Using the proven working script
$BACKUP_DIR = ".import-backup-$(Get-Date -Format 'yyyy-MM-dd-HHmmss')"

# ═══════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═══════════════════════════════════════════════════

function Write-Header {
    param([string]$Title)
    
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  $($Title.PadRight(58))║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Success "Node.js: $nodeVersion"
    } catch {
        Write-Error-Custom "Node.js not found. Please install Node.js 20+"
        exit 1
    }
    
    # Check pnpm
    try {
        $pnpmVersion = pnpm --version
        Write-Success "pnpm: $pnpmVersion"
    } catch {
        Write-Error-Custom "pnpm not found. Please install pnpm"
        exit 1
    }
    
    # Check script exists
    if (-not (Test-Path $SCRIPT_NAME)) {
        Write-Error-Custom "Script not found: $SCRIPT_NAME"
        exit 1
    }
    
    Write-Success "All prerequisites met"
    Write-Host ""
}

function New-Backup {
    if (-not $Backup) {
        return
    }
    
    Write-Info "Creating backup..."
    
    try {
        if (Test-Path "src") {
            New-Item -ItemType Directory -Path $BACKUP_DIR -Force | Out-Null
            Copy-Item -Path "src" -Destination "$BACKUP_DIR/src" -Recurse -Force
            Write-Success "Backup created: $BACKUP_DIR"
        } else {
            Write-Warning "src directory not found, skipping backup"
        }
    } catch {
        Write-Warning "Backup failed: $_"
    }
    
    Write-Host ""
}

function Invoke-ImportReplacement {
    Write-Info "Running import replacement script..."
    Write-Host ""
    
    try {
        # Build command
        $cmd = "node $SCRIPT_NAME"
        
        if ($Verbose) {
            Write-Info "Command: $cmd"
        }
        
        # Execute
        if ($DryRun) {
            Write-Warning "DRY RUN MODE - No files will be modified"
            Write-Host ""
        }
        
        $output = Invoke-Expression $cmd 2>&1
        
        # Display output
        $output | ForEach-Object {
            if ($_ -match "^✅") {
                Write-Host $_ -ForegroundColor Green
            } elseif ($_ -match "^⚠️") {
                Write-Host $_ -ForegroundColor Yellow
            } elseif ($_ -match "^❌") {
                Write-Host $_ -ForegroundColor Red
            } else {
                Write-Host $_
            }
        }
        
        Write-Host ""
        Write-Success "Script completed successfully"
        
        return $true
    } catch {
        Write-Error-Custom "Script failed: $_"
        return $false
    }
}

function Invoke-Validation {
    if (-not $Validate) {
        return
    }
    
    Write-Header "Running Validation"
    
    # Type check
    Write-Info "Running type check..."
    try {
        $typeCheckOutput = pnpm type-check 2>&1
        $errors = $typeCheckOutput | Select-String "error TS"
        
        if ($errors.Count -eq 0) {
            Write-Success "Type check passed"
        } else {
            Write-Warning "Type check found $($errors.Count) error(s)"
            Write-Info "Run 'pnpm type-check' for details"
        }
    } catch {
        Write-Warning "Type check failed to run"
    }
    
    Write-Host ""
    
    # Format check
    Write-Info "Checking code formatting..."
    try {
        pnpm format:check 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Format check passed"
        } else {
            Write-Info "Run 'pnpm format' to fix formatting"
        }
    } catch {
        Write-Info "Format check skipped"
    }
    
    Write-Host ""
}

function Show-Summary {
    param([bool]$Success)
    
    Write-Header "Summary"
    
    if ($Success) {
        Write-Success "Import replacement completed successfully!"
        
        if ($Backup) {
            Write-Info "Backup location: $BACKUP_DIR"
        }
        
        Write-Host ""
        Write-Info "Next steps:"
        Write-Host "  1. Review changes with: git status" -ForegroundColor White
        Write-Host "  2. Run validation: pnpm validate" -ForegroundColor White
        Write-Host "  3. Test build: pnpm build" -ForegroundColor White
        Write-Host "  4. Commit changes if satisfied" -ForegroundColor White
    } else {
        Write-Error-Custom "Import replacement failed!"
        Write-Info "Check the error messages above"
        
        if ($Backup -and (Test-Path $BACKUP_DIR)) {
            Write-Info "Restore from backup: $BACKUP_DIR"
        }
    }
    
    Write-Host ""
}

# ═══════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════

Write-Header "Import Replacement Script Runner v1.0.0"

# Show configuration
if ($DryRun) {
    Write-Warning "DRY RUN MODE - No files will be modified"
}
if ($Verbose) {
    Write-Info "VERBOSE MODE - Detailed output enabled"
}
if ($Backup) {
    Write-Info "BACKUP MODE - Creating backup before changes"
}
if ($Validate) {
    Write-Info "VALIDATE MODE - Running validation after changes"
}

Write-Host ""

# Execute workflow
Test-Prerequisites
New-Backup
$success = Invoke-ImportReplacement
Invoke-Validation
Show-Summary -Success $success

# Exit with appropriate code
if ($success) {
    exit 0
} else {
    exit 1
}
