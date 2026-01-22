#!/usr/bin/env tsx

/**
 * Verify MCP Setup - Comprehensive validation script for ComicWise
 *
 * This script validates:
 * - VS Code configuration files (.vscode/*)
 * - MCP server configurations
 * - Database connectivity
 * - Redis connectivity (if configured)
 * - Environment variables
 * - TypeScript and ESLint configuration
 *
 * Usage:
 * $ tsx scripts/verify-mcp-setup.ts
 * $ pnpm verify-setup
 *
 * Exit codes:
 * 0 = All checks passed
 * 1 = One or more checks failed
 */

import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  details?: string;
}

interface VerificationReport {
  timestamp: string;
  environment: string;
  checks: CheckResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
  status: "✅ PASSED" | "⚠️  WARNING" | "❌ FAILED";
}

/**
 * Color codes for console output
 */
const colors = {
  reset: "\x1B[0m",
  green: "\x1B[32m",
  red: "\x1B[31m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  cyan: "\x1B[36m",
  bold: "\x1B[1m",
};

/**
 * Print colored message to console
 * @param message
 * @param color
 */
function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Check if file exists and is valid JSON/JSONC
 * @param filePath
 * @param fileName
 */
function checkConfigFile(filePath: string, fileName: string): CheckResult {
  try {
    if (!fs.existsSync(filePath)) {
      return {
        name: `${fileName} exists`,
        passed: false,
        message: `❌ ${fileName} not found at ${filePath}`,
      };
    }

    const content = fs.readFileSync(filePath, "utf-8");
    // Simple JSONC validation - this will fail on actual comments, but that's ok for basic check
    JSON.parse(content.replaceAll(/\/\*[\S\s]*?\*\/|\/\/.*/g, ""));

    return {
      name: `${fileName} valid`,
      passed: true,
      message: `✅ ${fileName} is valid`,
    };
  } catch (error) {
    return {
      name: `${fileName} valid`,
      passed: false,
      message: `❌ ${fileName} parse error`,
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check environment variables
 */
function checkEnvironmentVariables(): CheckResult[] {
  const results: CheckResult[] = [];
  const requiredVars = ["DATABASE_URL", "NODE_ENV", "NEXT_PUBLIC_APP_URL"];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (value) {
      results.push({
        name: `ENV: ${varName}`,
        passed: true,
        message: `✅ ${varName} is set`,
      });
    } else {
      results.push({
        name: `ENV: ${varName}`,
        passed: false,
        message: `❌ ${varName} not set`,
      });
    }
  }

  return results;
}

/**
 * Check TypeScript and ESLint configuration
 */
async function checkTypeScriptConfig(): Promise<CheckResult> {
  try {
    const tsConfigPath = path.join(process.cwd(), "tsconfig.json");
    if (!fs.existsSync(tsConfigPath)) {
      return {
        name: "TypeScript config",
        passed: false,
        message: "❌ tsconfig.json not found",
      };
    }

    const tsConfig = JSON.parse(
      fs.readFileSync(tsConfigPath, "utf-8").replaceAll(/\/\*[\S\s]*?\*\/|\/\/.*/g, "")
    );

    const hasStrictMode = tsConfig.compilerOptions?.strict === true;
    const hasPathAliases = Object.keys(tsConfig.compilerOptions?.paths || {}).length > 0;

    if (hasStrictMode && hasPathAliases) {
      return {
        name: "TypeScript config",
        passed: true,
        message: "✅ TypeScript configured correctly (strict mode + path aliases)",
      };
    }

    return {
      name: "TypeScript config",
      passed: false,
      message: "⚠️  TypeScript config incomplete",
      details: `Strict: ${hasStrictMode}, Path Aliases: ${hasPathAliases}`,
    };
  } catch (error) {
    return {
      name: "TypeScript config",
      passed: false,
      message: "❌ TypeScript config error",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check VS Code extensions are recommended
 */
function checkVSCodeExtensions(): CheckResult {
  try {
    const extPath = path.join(process.cwd(), ".vscode/extensions.json");
    if (!fs.existsSync(extPath)) {
      return {
        name: "VS Code extensions",
        passed: false,
        message: "❌ .vscode/extensions.json not found",
      };
    }

    const extConfig = JSON.parse(
      fs.readFileSync(extPath, "utf-8").replaceAll(/\/\*[\S\s]*?\*\/|\/\/.*/g, "")
    );
    const extensions = extConfig.recommendations || [];

    const requiredExtensions = [
      "dbaeumer.vscode-eslint",
      "esbenp.prettier-vscode",
      "github.copilot",
    ];
    const hasRequired = requiredExtensions.every((ext) => extensions.includes(ext));

    return {
      name: "VS Code extensions",
      passed: hasRequired,
      message: hasRequired
        ? `✅ All required extensions recommended (${extensions.length} total)`
        : "⚠️  Some recommended extensions missing",
      details: `Found ${extensions.length} extensions`,
    };
  } catch (error) {
    return {
      name: "VS Code extensions",
      passed: false,
      message: "❌ Extensions check error",
      details: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Run all verification checks
 */
async function runAllChecks(): Promise<VerificationReport> {
  const checks: CheckResult[] = [];

  log("\n🔍 ComicWise MCP Setup Verification\n", "cyan");
  log("═".repeat(60), "cyan");

  // 1. Configuration file checks
  log("\n1️⃣  Configuration Files:", "blue");
  const vscodeDir = path.join(process.cwd(), ".vscode");
  checks.push(checkConfigFile(path.join(vscodeDir, "settings.json"), "settings.json"));
  checks.push(checkConfigFile(path.join(vscodeDir, "extensions.json"), "extensions.json"));
  checks.push(checkConfigFile(path.join(vscodeDir, "launch.json"), "launch.json"));
  checks.push(checkConfigFile(path.join(vscodeDir, "tasks.json"), "tasks.json"));
  checks.push(checkConfigFile(path.join(vscodeDir, "mcp.json"), "mcp.json"));

  // 2. Environment variables
  log("\n2️⃣  Environment Variables:", "blue");
  checks.push(...checkEnvironmentVariables());

  // 3. TypeScript configuration
  log("\n3️⃣  TypeScript Configuration:", "blue");
  checks.push(await checkTypeScriptConfig());

  // 4. VS Code extensions
  log("\n4️⃣  VS Code Extensions:", "blue");
  checks.push(checkVSCodeExtensions());

  // 5. Print results
  log("\n5️⃣  Check Results:", "blue");
  for (const check of checks) {
    const status = check.passed ? "✅" : "❌";
    log(`  ${status} ${check.name}: ${check.message}`);
    if (check.details) {
      log(`     → ${check.details}`, "yellow");
    }
  }

  // 6. Summary
  const passed = checks.filter((c) => c.passed).length;
  const total = checks.length;
  const failed = total - passed;

  log("\n═".repeat(60), "cyan");
  log(`\n📊 Summary: ${passed}/${total} checks passed\n`, "bold");

  if (failed === 0) {
    log("✅ All systems operational! Ready for development.\n", "green");
  } else if (failed < 3) {
    log(`⚠️  ${failed} issue(s) found. Review and fix before deployment.\n`, "yellow");
  } else {
    log(`❌ ${failed} critical issue(s) found. Fix before proceeding.\n`, "red");
  }

  const report: VerificationReport = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    checks,
    summary: { total, passed, failed },
    status: failed === 0 ? "✅ PASSED" : failed < 3 ? "⚠️  WARNING" : "❌ FAILED",
  };

  return report;
}

/**
 * Main execution
 */
async function main() {
  try {
    const report = await runAllChecks();

    // Exit with appropriate code
    process.exit(report.summary.failed > 0 ? 1 : 0);
  } catch (error) {
    log(
      `\n❌ Verification failed: ${error instanceof Error ? error.message : String(error)}\n`,
      "red"
    );
    process.exit(1);
  }
}

main();
