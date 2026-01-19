#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Cleanup script to remove unused files and optimize folder structure
.DESCRIPTION
    Removes documentation files, unused markdown files, and optimizes project structure
#>

param(
    [switch]$DryRun,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ComicWise Project Cleanup Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "[DRY RUN MODE] - No files will be deleted`n" -ForegroundColor Yellow
}

# Define files to remove (documentation and temporary files)
$filesToRemove = @(
    ".*.backup"
    "**/*.backup"
    "**/*.backup.*"
    "**/.*.backup.*"
    # "BUILD_FIXES_SUMMARY.md",
    # "CLEANUP_AUDIT_REPORT.md",
    # "CLEANUP_DOCUMENTATION_INDEX.md",
    # "CLEANUP_EXECUTION_GUIDE.md",
    # "CLEANUP_FINAL_REPORT.md",
    # "CLEANUP_QUICK_REFERENCE.md",
    # "COGNITIVE_COMPLEXITY_FINAL_FIX.md",
    # "COGNITIVE_COMPLEXITY_FIXES.md",
    # "COGNITIVE_COMPLEXITY_QUICK_GUIDE.md",
    # "COGNITIVE_COMPLEXITY_REFACTORING.md",
    # "COMPLETE_IMPLEMENTATION_REPORT.md",
    # "COMPLETE_OPTIMIZATION_SUMMARY.md",
    # "COMPLETE_PROJECT_INDEX.md",
    # "COMPREHENSIVE_ERROR_ANALYSIS.md",
    # "CONFIGURATION_IMPLEMENTATION_GUIDE.md",
    # "CONFIG_FILE_INDEX.md",
    # "CONFIG_OPTIMIZATION_CHECKLIST.md",
    # "CONFIG_OPTIMIZATION_SUMMARY.md",
    # "DATABASE_SEED_FIXES.md",
    # "DEPLOYMENT_READY.md",
    # "DEVELOPER_GUIDE.md",
    # "DEVELOPER_QUICK_REFERENCE.md",
    # "DOCKER_ENV_SETUP.md",
    # "DOCKER_ENV_SETUP_COMPLETE.md",
    # "DOCUMENTATION_SUMMARY.md",
    # "ENVIRONMENT_DOCKER_SETUP_INDEX.md",
    # "ERROR_FIXES_INDEX.md",
    # "ERROR_FIXES_SUMMARY.md",
    # "EXACT_CODE_CHANGES.md",
    # "FIXES_COMPLETE_SUMMARY.md",
    # "FIXES_VERIFICATION_CHECKLIST.md",
    # "GITHUB_ACTIONS_ESLINT_COMPLETE.md",
    # "IMAGE_SERVICE_COMPLETE.md",
    # "IMAGE_SERVICE_FINAL_OPTIMIZATION.md",
    # "IMAGE_SERVICE_OPTIMIZATION.md",
    # "IMAGE_SERVICE_QUICK_REFERENCE.md",
    # "IMAGE_UPLOAD_FIX_SUMMARY.md",
    # "INSTALLATION_VERIFICATION.md",
    # "NEXT_STEPS_GUIDE.md",
    # "ONBOARDING.md",
    # "PACKAGE_INSTALLATION_GUIDE.md",
    # "PACKAGE_JSON_OPTIMIZATION.md",
    # "PATH_ALIASES_GUIDE.md",
    # "PATH_ALIASES_IMPLEMENTATION.md",
    # "PROJECT_COMPLETION_FINAL.md",
    # "PROJECT_IMPLEMENTATION_COMPLETE.md",
    # "README_CLEANUP_COMPLETE.md",
    # "README_FIXES.md",
    # "RETURN_TYPES_ANALYSIS_REPORT.md",
    # "SCRIPTS_QUICK_REFERENCE.md",
    # "SEED_BEFORE_AFTER.md",
    # "SEED_OPTIMIZATION_COMPLETE.md",
    # "SEED_OPTIMIZATION_COMPLETION.md",
    # "SEED_OPTIMIZATION_FINAL_REPORT.md",
    # "SEED_OPTIMIZATION_FINAL_STATUS.md",
    # "SEED_OPTIMIZATION_QUICK_REFERENCE.md",
    # "SEED_OPTIMIZATION_REPORT.md",
    # "SEED_OPTIMIZATION_SUMMARY.txt",
    # "SEED_QUERIES_OPTIMIZATION.md",
    # "SEED_REFACTORING_QUICK_REF.md",
    # "SETUP_COMPLETE.md",
    # "SETUP_COMPLETION_REPORT.md",
    # "SETUP_QUICK_REFERENCE.md",
    # "START_HERE.md",
    # "TASKS_COMPLETION_REPORT.md",
    # "THEMING_IMPLEMENTATION_PLAN.md",
    # "VSCODE_SETUP_COMPLETE.md",
    # "build_output.txt",
    # "prompt.txt",
    # "fix-build-errors.ps1",
    # "fix-final.ps1",
    # "fix-type-errors.ps1"
)

# Unused files in src to remove
$srcFilesToRemove = @(
  ".*.backup"
  "**/*.backup"
  "**/*.backup.*"
  "**/.*.backup.*"
)

# Old seeding files to remove (replaced by Enhanced versions)
$seedFilesToRemove = @(
  ".*.backup"
  "**/*.backup"
  "**/*.backup.*"
  "**/.*.backup.*"
  # "src/database/seed/config.ts",
  # "src/database/seed/run.ts",
  # "src/database/seed/seedHelpers.ts",
  # "src/database/seed/orchestrator.ts",
  # "src/database/seed/seeders/userSeeder.ts",
  # "src/database/seed/seeders/comicSeeder.ts",
  # "src/database/seed/seeders/chapterSeeder.ts"
)

$removedCount = 0
$skippedCount = 0
$totalSize = 0

# Clean up backup files first
Write-Host "🗑️  Removing all .backup files...`n" -ForegroundColor Yellow

$backupFiles = Get-ChildItem -Path (Join-Path $PSScriptRoot "..") -Filter "*.backup_*" -Recurse -File |
Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.git*" }

foreach ($file in $backupFiles) {
  $relativePath = $file.FullName.Replace((Join-Path $PSScriptRoot ".."), "").TrimStart("\")
  $fileSize = $file.Length
  $totalSize += $fileSize

  if ($Verbose) {
    $sizeStr = if ($fileSize -gt 1MB) {
      "{0:N2} MB" -f ($fileSize / 1MB)
    }
    elseif ($fileSize -gt 1KB) {
      "{0:N2} KB" -f ($fileSize / 1KB)
    }
    else {
      "$fileSize bytes"
    }
    Write-Host "  📄 $relativePath ($sizeStr)" -ForegroundColor Gray
  }

  if (-not $DryRun) {
    Remove-Item $file.FullName -Force
    $removedCount++
  }
  else {
    Write-Host "  [DRY RUN] Would remove: $relativePath" -ForegroundColor Yellow
    $removedCount++
  }
}

Write-Host "`n🗑️  Removing old seeding files...`n" -ForegroundColor Yellow

foreach ($file in $seedFilesToRemove) {
  $filePath = Join-Path $PSScriptRoot ".." $file

  if (Test-Path $filePath) {
    $fileInfo = Get-Item $filePath
    $fileSize = $fileInfo.Length
    $totalSize += $fileSize

    if ($Verbose) {
      Write-Host "  📄 $file" -ForegroundColor Gray
    }

    if (-not $DryRun) {
      Remove-Item $filePath -Force
      $removedCount++
    }
    else {
      Write-Host "  [DRY RUN] Would remove: $file" -ForegroundColor Yellow
      $removedCount++
    }
  }
  else {
    $skippedCount++
    if ($Verbose) {
      Write-Host "  ⚠️  Not found: $file" -ForegroundColor DarkGray
    }
  }
}

Write-Host "`n🗑️  Cleaning up documentation and temporary files...`n" -ForegroundColor Yellow

foreach ($file in $filesToRemove) {
  $filePath = Join-Path $PSScriptRoot ".." $file

  if (Test-Path $filePath) {
    $fileInfo = Get-Item $filePath
    $fileSize = $fileInfo.Length
    $totalSize += $fileSize

    $sizeStr = if ($fileSize -gt 1MB) {
      "{0:N2} MB" -f ($fileSize / 1MB)
    }
    elseif ($fileSize -gt 1KB) {
      "{0:N2} KB" -f ($fileSize / 1KB)
    }
    else {
      "$fileSize bytes"
    }

    if ($Verbose) {
      Write-Host "  📄 $file ($sizeStr)" -ForegroundColor Gray
    }

    if (-not $DryRun) {
      Remove-Item $filePath -Force
      $removedCount++
    }
    else {
      Write-Host "  [DRY RUN] Would remove: $file" -ForegroundColor Yellow
      $removedCount++
    }
  }
  else {
    $skippedCount++
    if ($Verbose) {
      Write-Host "  ⚠️  Not found: $file" -ForegroundColor DarkGray
    }
  }
}

Write-Host "`n🗑️  Cleaning up src directory...`n" -ForegroundColor Yellow

foreach ($file in $srcFilesToRemove) {
  $filePath = Join-Path $PSScriptRoot ".." "src" $file

  if (Test-Path $filePath) {
    $fileInfo = Get-Item $filePath
    $fileSize = $fileInfo.Length
    $totalSize += $fileSize

    if ($Verbose) {
      Write-Host "  📄 src/$file" -ForegroundColor Gray
    }

    if (-not $DryRun) {
      Remove-Item $filePath -Force
      $removedCount++
    }
    else {
      Write-Host "  [DRY RUN] Would remove: src/$file" -ForegroundColor Yellow
      $removedCount++
    }
  }
}

# Clean up empty directories
Write-Host "`n📁 Checking for empty directories...`n" -ForegroundColor Yellow

$emptyDirs = Get-ChildItem -Path (Join-Path $PSScriptRoot "..") -Directory -Recurse |
Where-Object { (Get-ChildItem $_.FullName -Force).Count -eq 0 } |
Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.git*" }

foreach ($dir in $emptyDirs) {
  if ($Verbose) {
    Write-Host "  📁 $($dir.FullName)" -ForegroundColor Gray
  }

    if (-not $DryRun) {
        Remove-Item $dir.FullName -Force
    } else {
        Write-Host "  [DRY RUN] Would remove empty dir: $($dir.Name)" -ForegroundColor Yellow
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Cleanup Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Files removed:        $removedCount" -ForegroundColor Green
Write-Host "Files not found:      $skippedCount" -ForegroundColor Yellow
Write-Host "Empty dirs removed:   $($emptyDirs.Count)" -ForegroundColor Green

$totalSizeStr = if ($totalSize -gt 1MB) {
    "{0:N2} MB" -f ($totalSize / 1MB)
} elseif ($totalSize -gt 1KB) {
    "{0:N2} KB" -f ($totalSize / 1KB)
} else {
    "$totalSize bytes"
}

Write-Host "Space freed:          $totalSizeStr" -ForegroundColor Green

if ($DryRun) {
    Write-Host "`n[DRY RUN] Run without -DryRun flag to actually remove files" -ForegroundColor Yellow
} else {
    Write-Host "`n✅ Cleanup completed successfully!" -ForegroundColor Green
}

Write-Host ""
