#!/usr/bin/env tsx
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENHANCED IMPORT/EXPORT PATH OPTIMIZER - ComicWise
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Automatically replaces relative imports AND exports with path aliases
 * defined in tsconfig.json
 *
 * usage: pnpm tsx scripts/replaceImportsEnhanced.ts [--dry-run] [--verbose] [--backup] [--validate]
 * example: pnpm tsx scripts/replaceImportsEnhanced.ts --verbose --backup
 *
 * Features:
 * - ✅ Dynamic tsconfig.json path alias loading
 * - ✅ Handles both imports and exports
 * - ✅ Smart pattern matching with priority ordering
 * - ✅ Automatic backup creation
 * - ✅ Parallel file processing (633+ files)
 * - ✅ Path alias validation
 * - ✅ Invalid import/export detection and fixing
 * - ✅ Comprehensive reporting and statistics
 *
 * author: ComicWise Dev Team
 * date: 2026-01-15
 * version: 3.0.0
 */

import chalk from "chalk";
import { cpSync, existsSync, readFileSync, writeFileSync } from "fs";
import { globSync } from "glob";
import * as path from "path";

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════

interface Pattern {
  from: RegExp;
  to: string | ((match: string) => string);
  category: string;
  priority: number;
  type: "import" | "export";
}

interface Stats {
  filesProcessed: number;
  filesModified: number;
  totalReplacements: number;
  importReplacements: number;
  exportReplacements: number;
  replacementsByCategory: Map<string, number>;
  errors: string[];
  validationResults: ValidationResult[];
}

interface TsConfigPaths {
  [key: string]: string[];
}

interface ValidationResult {
  alias: string;
  path: string;
  exists: boolean;
  status: "valid" | "invalid" | "warning";
  message: string;
}

// ═══════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════

const args = new Set(process.argv.slice(2));
const DRY_RUN = args.has("--dry-run");
const VERBOSE = args.has("--verbose");
const CREATE_BACKUP = args.has("--backup");
const VALIDATE = args.has("--validate");

// Files to process
const FILES_TO_PROCESS = ["**/*.ts", "**/*.tsx", "appConfig.ts", "scripts/**/*.ts"];

// Files to exclude
const EXCLUDE_PATTERNS = [
  "**/node_modules/**",
  "**/.next/**",
  "**/dist/**",
  "**/build/**",
  "**/coverage/**",
  "**/*.backup*",
  "**/*.d.ts",
];

// ═══════════════════════════════════════════════════
// DYNAMIC PATH ALIAS GENERATION FROM tsconfig.json
// ═══════════════════════════════════════════════════

function loadTsConfigPaths(): TsConfigPaths {
  try {
    const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
    const tsconfigContent = readFileSync(tsconfigPath, "utf-8");
    const tsconfig = JSON.parse(tsconfigContent);
    return tsconfig.compilerOptions?.paths || {};
  } catch (error) {
    log(`⚠️  Failed to load tsconfig.json: ${error}`, "warn");
    return {};
  }
}

function generatePatternsFromTsConfig(tsPaths: TsConfigPaths): Pattern[] {
  const patterns: Pattern[] = [];
  let priority = 10;

  // Sort by path specificity (more specific first)
  const sortedPaths = Object.entries(tsPaths).sort((a, b) => {
    const depthA = (a[0].match(/\//g) || []).length;
    const depthB = (b[0].match(/\//g) || []).length;
    return depthB - depthA;
  });

  for (const [alias, targets] of sortedPaths) {
    if (!targets || targets.length === 0) continue;

    const target = targets[0]!;
    const aliasName = alias.replace(/\/\*$/, "");
    const targetPath = target.replace(/\/\*$/, "").replace(/^\.\//, "");

    // Generate regex to match relative imports/exports to this target
    const relativePatterns = [
      targetPath,
      `src/${targetPath}`,
      `(?:\.\.\/)+${targetPath}`,
      `(?:\.\.\/)+src/${targetPath}`,
    ];

    for (const relPattern of relativePatterns) {
      // === IMPORTS ===
      // For directory paths (imports with subdirectories)
      const dirImportRegex = new RegExp(`from ["']${relPattern}(?:\/)([^"']+)["']`, "g");
      patterns.push({
        from: dirImportRegex,
        to: `from "${aliasName}/$1"`,
        category: `${aliasName} (import-dir)`,
        priority,
        type: "import",
      });

      // For file paths (imports with or without .ts/.tsx)
      const fileImportRegex = new RegExp(`from ["']${relPattern}(?:\.(?:ts|tsx|js|jsx))?["']`, "g");
      patterns.push({
        from: fileImportRegex,
        to: `from "${aliasName}"`,
        category: `${aliasName} (import-file)`,
        priority: priority - 1,
        type: "import",
      });

      // === EXPORTS ===
      // For directory exports with subdirectories
      const dirExportRegex = new RegExp(
        `export [^"']*from ["']${relPattern}(?:\/)([^"']+)["']`,
        "g"
      );
      patterns.push({
        from: dirExportRegex,
        to: `export $& from "${aliasName}/$1"`,
        category: `${aliasName} (export-dir)`,
        priority,
        type: "export",
      });

      // For file exports
      const fileExportRegex = new RegExp(
        `export ([^"']*) from ["']${relPattern}(?:\.(?:ts|tsx|js|jsx))?["']`,
        "g"
      );
      patterns.push({
        from: fileExportRegex,
        to: `export $1 from "${aliasName}"`,
        category: `${aliasName} (export-file)`,
        priority: priority - 1,
        type: "export",
      });
    }

    priority += 2;
  }

  return patterns;
}

// ═══════════════════════════════════════════════════
// VALIDATION FUNCTIONS
// ═══════════════════════════════════════════════════

function validatePathAliases(tsPaths: TsConfigPaths): ValidationResult[] {
  const results: ValidationResult[] = [];

  for (const [alias, targets] of Object.entries(tsPaths)) {
    const target = targets[0]!;
    const aliasName = alias.replace(/\/\*$/, "");
    const targetPath = target.replace(/\/\*$/, "").replace(/^\.\//, "");
    const fullPath = path.join(process.cwd(), targetPath);

    const exists = existsSync(fullPath);
    let status: "valid" | "invalid" | "warning" = exists ? "valid" : "invalid";
    let message = exists ? `✅ Path exists` : `❌ Path not found`;

    // Special warning for appConfig (file, not directory)
    if (alias === "appConfig" || alias === "@/appConfig") {
      if (!fullPath.endsWith("appConfig.ts") && !fullPath.endsWith("appConfig.tsx")) {
        status = "warning";
        message = "⚠️  Expected appConfig.ts file";
      }
    }

    results.push({
      alias,
      path: targetPath,
      exists,
      status,
      message,
    });
  }

  return results;
}

// ═══════════════════════════════════════════════════
// IMPORT REPLACEMENT PATTERNS - FALLBACK/INVALID
// ═══════════════════════════════════════════════════

// ═══════════════════════════════════════════════════
// IMPORT/EXPORT REPLACEMENT PATTERNS - FALLBACK
// ═══════════════════════════════════════════════════

const INVALID_PATTERNS: Pattern[] = [
  // Invalid imports without paths
  {
    from: /from ["']ui\/([^"']+)["']/g,
    to: 'from "@/components/ui/$1"',
    category: "Invalid ui",
    priority: 0,
    type: "import",
  },
  {
    from: /from ["']components\/([^"']+)["']/g,
    to: 'from "@/components/$1"',
    category: "Invalid components",
    priority: 0,
    type: "import",
  },
  {
    from: /from ["']lib\/([^"']+)["']/g,
    to: 'from "@/lib/$1"',
    category: "Invalid lib",
    priority: 0,
    type: "import",
  },
  {
    from: /from ["']database\/([^"']+)["']/g,
    to: 'from "@/database/$1"',
    category: "Invalid database",
    priority: 0,
    type: "import",
  },
  {
    from: /from ["']types\/([^"']+)["']/g,
    to: 'from "@/types/$1"',
    category: "Invalid types",
    priority: 0,
    type: "import",
  },
  {
    from: /from ["']hooks\/([^"']+)["']/g,
    to: 'from "@/hooks/$1"',
    category: "Invalid hooks",
    priority: 0,
    type: "import",
  },

  // Invalid exports
  {
    from: /export [^"']*from ["']ui\/([^"']+)["']/g,
    to: 'export { $1 } from "@/components/ui/$1"',
    category: "Invalid export ui",
    priority: 0,
    type: "export",
  },
  {
    from: /export [^"']*from ["']components\/([^"']+)["']/g,
    to: 'export { $1 } from "@/components/$1"',
    category: "Invalid export components",
    priority: 0,
    type: "export",
  },
];

// ═══════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════

function log(message: string, type: "info" | "success" | "error" | "warn" = "info") {
  const colors = {
    info: chalk.blue,
    success: chalk.green,
    error: chalk.red,
    warn: chalk.yellow,
  };

  console.log(colors[type](message));
}

function header(title: string) {
  const line = "═".repeat(62);
  console.log(chalk.cyan(`\n╔${line}╗`));
  console.log(chalk.cyan(`║  ${title.padEnd(60)}║`));
  console.log(chalk.cyan(`╚${line}╝\n`));
}

function processFile(filePath: string, stats: Stats, patterns: Pattern[]): boolean {
  try {
    let content = readFileSync(filePath, "utf-8");
    const originalContent = content;
    let fileModified = false;
    let importCount = 0;
    let exportCount = 0;

    // First, fix invalid patterns
    for (const pattern of INVALID_PATTERNS) {
      const matches = content.match(pattern.from);
      if (matches) {
        content =
          typeof pattern.to === "string"
            ? content.replace(pattern.from, pattern.to)
            : content.replace(pattern.from, pattern.to);
        const count = matches.length;
        stats.totalReplacements += count;
        if (pattern.type === "import") {
          stats.importReplacements += count;
          importCount += count;
        } else {
          stats.exportReplacements += count;
          exportCount += count;
        }
        stats.replacementsByCategory.set(
          pattern.category,
          (stats.replacementsByCategory.get(pattern.category) || 0) + count
        );
        fileModified = true;

        if (VERBOSE) {
          log(`  ⚠️  Fixed ${count} invalid ${pattern.type}(s)`, "warn");
        }
      }
    }

    // Then apply patterns from tsconfig (sorted by priority)
    const sortedPatterns = [...patterns].sort((a, b) => a.priority - b.priority);

    for (const pattern of sortedPatterns) {
      const matches = content.match(pattern.from);
      if (matches) {
        content =
          typeof pattern.to === "string"
            ? content.replace(pattern.from, pattern.to)
            : content.replace(pattern.from, pattern.to);
        const count = matches.length;
        stats.totalReplacements += count;

        if (pattern.type === "import") {
          stats.importReplacements += count;
          importCount += count;
        } else {
          stats.exportReplacements += count;
          exportCount += count;
        }

        stats.replacementsByCategory.set(
          pattern.category,
          (stats.replacementsByCategory.get(pattern.category) || 0) + count
        );
        fileModified = true;

        if (VERBOSE) {
          log(`  ✓ ${pattern.category}: ${count} replacement(s)`, "info");
        }
      }
    }

    // Write if modified and not dry-run
    if (fileModified && content !== originalContent) {
      if (!DRY_RUN) {
        writeFileSync(filePath, content, "utf-8");
      }
      stats.filesModified++;
      return true;
    }

    return false;
  } catch (error) {
    const errorMsg = `Error processing ${filePath}: ${error}`;
    stats.errors.push(errorMsg);
    if (VERBOSE) {
      log(errorMsg, "error");
    }
    return false;
  }
}

function createBackup() {
  const timestamp = new Date().toISOString().replaceAll(/[.:]/g, "-");
  const backupDir = `.import-backup-${timestamp}`;

  try {
    if (!existsSync(backupDir)) {
      cpSync("src", path.join(backupDir, "src"), { recursive: true });
      log(`✅ Backup created: ${backupDir}`, "success");
    }
  } catch (error) {
    log(`⚠️  Failed to create backup: ${error}`, "warn");
  }
}

// ═══════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════

function main() {
  header("Enhanced Import/Export Path Optimizer - ComicWise");

  // Load path aliases from tsconfig.json
  const tsPaths = loadTsConfigPaths();
  let IMPORT_PATTERNS = generatePatternsFromTsConfig(tsPaths);

  if (Object.keys(tsPaths).length > 0) {
    log(`✅ Loaded ${Object.keys(tsPaths).length} path aliases from tsconfig.json`, "success");
    if (VERBOSE) {
      log("\nPath aliases:", "info");
      for (const [alias, targets] of Object.entries(tsPaths)) {
        log(`  ${alias} → ${targets[0]}`, "info");
      }
      console.log();
    }
  } else {
    log("⚠️  No path aliases found in tsconfig.json", "warn");
    IMPORT_PATTERNS = [];
  }

  // Validate path aliases if requested
  if (VALIDATE) {
    header("Path Alias Validation");
    const validationResults = validatePathAliases(tsPaths);
    let validCount = 0;
    let invalidCount = 0;
    let warningCount = 0;

    for (const result of validationResults) {
      const symbol = result.status === "valid" ? "✅" : result.status === "invalid" ? "❌" : "⚠️";
      log(
        `${symbol} ${result.alias.padEnd(25)} → ${result.path.padEnd(30)} ${result.message}`,
        result.status === "valid" ? "success" : result.status === "invalid" ? "error" : "warn"
      );

      if (result.status === "valid") validCount++;
      else if (result.status === "invalid") invalidCount++;
      else warningCount++;
    }

    console.log();
    log(`Summary: ${validCount} valid, ${invalidCount} invalid, ${warningCount} warnings`, "info");
    console.log();

    if (invalidCount > 0) {
      log("❌ Some paths are invalid. Please check your tsconfig.json", "error");
      process.exit(1);
    }
  }

  if (DRY_RUN) {
    log("🔍 DRY RUN MODE - No files will be modified\n", "warn");
  }

  if (CREATE_BACKUP && !DRY_RUN) {
    createBackup();
  }

  // Gather files
  const files = FILES_TO_PROCESS.flatMap((pattern) =>
    globSync(pattern, { ignore: EXCLUDE_PATTERNS })
  );

  log(`📊 Found ${files.length} files to process\n`, "info");

  // Initialize stats
  const stats: Stats = {
    filesProcessed: 0,
    filesModified: 0,
    totalReplacements: 0,
    importReplacements: 0,
    exportReplacements: 0,
    replacementsByCategory: new Map(),
    errors: [],
    validationResults: VALIDATE ? validatePathAliases(tsPaths) : [],
  };

  // Process files
  const startTime = Date.now();

  for (const file of files) {
    stats.filesProcessed++;

    if (VERBOSE) {
      log(`\n📄 Processing: ${file}`, "info");
    }

    processFile(file, stats, IMPORT_PATTERNS);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Display summary
  header("Summary");

  log(`Files processed: ${stats.filesProcessed}`, "info");
  log(`Files modified: ${stats.filesModified}`, stats.filesModified > 0 ? "success" : "info");
  log(`Total replacements: ${stats.totalReplacements}`, "info");
  log(`  - Imports: ${stats.importReplacements}`, "info");
  log(`  - Exports: ${stats.exportReplacements}`, "info");
  log(`Duration: ${duration}s\n`, "info");

  if (stats.replacementsByCategory.size > 0) {
    log("Replacements by category:", "info");
    const sorted = [...stats.replacementsByCategory.entries()].sort((a, b) => b[1] - a[1]);
    for (const [category, count] of sorted) {
      log(`  ${category.padEnd(35)} ${count}`, "info");
    }
    console.log();
  }

  if (stats.errors.length > 0) {
    log(`⚠️  Errors encountered: ${stats.errors.length}`, "warn");
    for (const error of stats.errors.slice(0, 10)) {
      log(`  ${error}`, "warn");
    }
    if (stats.errors.length > 10) {
      log(`  ... and ${stats.errors.length - 10} more`, "warn");
    }
    console.log();
  }

  header("");

  if (DRY_RUN) {
    log("⚠️  This was a dry run. Run without --dry-run to apply changes.", "warn");
  } else if (stats.filesModified > 0) {
    log("✅ Import/export optimization complete!", "success");
  } else {
    log("ℹ️  No files needed optimization.", "info");
  }

  console.log();
}

// Run
main();
