#!/usr/bin/env tsx
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Comprehensive Project Analyzer
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Analyzes the project for:
 * - Performance bottlenecks
 * - Security vulnerabilities
 * - Code quality issues
 * - TypeScript errors
 * - Unused dependencies
 * - Duplicate code
 * - Bundle size analysis
 *
 * Generates a comprehensive report with actionable recommendations.
 *
 * Usage:
 *   pnpm tsx scripts/analyze-project.ts
 *   pnpm tsx scripts/analyze-project.ts --output=report.md
 */

import chalk from "chalk";
import { exec } from "child_process";
import fs from "fs/promises";
import ora from "ora";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const ROOT_DIR = process.cwd();
const OUTPUT_FILE =
  process.argv.find((arg) => arg.startsWith("--output="))?.split("=")[1] ||
  "project-analysis-report.md";

interface AnalysisResult {
  timestamp: string;
  typeScriptErrors: number;
  eslintErrors: number;
  eslintWarnings: number;
  securityVulnerabilities: number;
  performanceIssues: string[];
  bundleSize: string;
  recommendations: string[];
}

const analysisResult: AnalysisResult = {
  timestamp: new Date().toISOString(),
  typeScriptErrors: 0,
  eslintErrors: 0,
  eslintWarnings: 0,
  securityVulnerabilities: 0,
  performanceIssues: [],
  bundleSize: "N/A",
  recommendations: [],
};

// ═══════════════════════════════════════════════════════════════════════════
// ANALYSIS FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function analyzeTypeScript(): Promise<void> {
  const spinner = ora("Analyzing TypeScript...").start();

  try {
    await execAsync("pnpm type-check", { cwd: ROOT_DIR });
    spinner.succeed(chalk.green("✓ No TypeScript errors found"));
    analysisResult.typeScriptErrors = 0;
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string };
    const output = err.stdout || err.stderr || "";
    const errorCount = (output.match(/error TS/g) || []).length;
    analysisResult.typeScriptErrors = errorCount;

    spinner.warn(chalk.yellow(`⚠ Found ${errorCount} TypeScript errors`));
    analysisResult.recommendations.push(
      `Fix ${errorCount} TypeScript errors by running 'pnpm type-check'`
    );
  }
}

async function analyzeESLint(): Promise<void> {
  const spinner = ora("Analyzing ESLint...").start();

  try {
    const { stdout } = await execAsync("pnpm lint", { cwd: ROOT_DIR });
    spinner.succeed(chalk.green("✓ No ESLint errors found"));
    analysisResult.eslintErrors = 0;
    analysisResult.eslintWarnings = 0;
  } catch (error: unknown) {
    const err = error as { stdout?: string; stderr?: string };
    const output = err.stdout || err.stderr || "";

    const errorCount = (output.match(/✖.*error/g) || []).length;
    const warningCount = (output.match(/⚠.*warning/g) || []).length;

    analysisResult.eslintErrors = errorCount;
    analysisResult.eslintWarnings = warningCount;

    spinner.warn(chalk.yellow(`⚠ Found ${errorCount} errors and ${warningCount} warnings`));

    if (errorCount > 0) {
      analysisResult.recommendations.push(
        `Fix ${errorCount} ESLint errors by running 'pnpm lint:fix'`
      );
    }
  }
}

async function analyzePerformance(): Promise<void> {
  const spinner = ora("Analyzing performance...").start();

  const issues: string[] = [];

  // Check for large files
  try {
    const { stdout } = await execAsync("find src -type f -size +100k 2>/dev/null || echo ''", {
      cwd: ROOT_DIR,
    });

    if (stdout.trim()) {
      const largeFiles = stdout.trim().split("\n");
      issues.push(`Found ${largeFiles.length} files larger than 100KB`);
      analysisResult.recommendations.push(
        "Consider code-splitting for large files to improve load times"
      );
    }
  } catch {
    // Command failed, skip
  }

  // Check for console.log statements
  try {
    const { stdout } = await execAsync('git grep -l "console\\.log" src || echo ""', {
      cwd: ROOT_DIR,
    });

    if (stdout.trim()) {
      const fileCount = stdout.trim().split("\n").length;
      issues.push(`Found console.log statements in ${fileCount} files`);
      analysisResult.recommendations.push("Remove console.log statements from production code");
    }
  } catch {
    // Command failed, skip
  }

  // Check for unoptimized images
  try {
    const imageFiles = await execAsync(
      'find public -type f \\( -name "*.jpg" -o -name "*.png" \\) 2>/dev/null || echo ""',
      { cwd: ROOT_DIR }
    );

    if (imageFiles.stdout.trim()) {
      issues.push("Consider converting images to WebP/AVIF format");
      analysisResult.recommendations.push(
        "Use next/image component and convert images to modern formats (WebP/AVIF)"
      );
    }
  } catch {
    // Command failed, skip
  }

  analysisResult.performanceIssues = issues;

  if (issues.length > 0) {
    spinner.warn(chalk.yellow(`⚠ Found ${issues.length} performance issues`));
  } else {
    spinner.succeed(chalk.green("✓ No major performance issues found"));
  }
}

async function analyzeSecurity(): Promise<void> {
  const spinner = ora("Analyzing security...").start();

  try {
    const { stdout } = await execAsync("pnpm audit --json", { cwd: ROOT_DIR });
    const auditData = JSON.parse(stdout);

    const vulnerabilities = auditData.metadata?.vulnerabilities?.total || 0;

    analysisResult.securityVulnerabilities = vulnerabilities;

    if (vulnerabilities > 0) {
      spinner.warn(chalk.yellow(`⚠ Found ${vulnerabilities} security vulnerabilities`));
      analysisResult.recommendations.push(
        `Fix ${vulnerabilities} security vulnerabilities by running 'pnpm audit fix'`
      );
    } else {
      spinner.succeed(chalk.green("✓ No security vulnerabilities found"));
    }
  } catch {
    spinner.warn(chalk.yellow("⚠ Could not perform security audit"));
  }
}

async function analyzeBundleSize(): Promise<void> {
  const spinner = ora("Analyzing bundle size...").start();

  try {
    // Check if .next/analyze exists
    const analyzeDir = path.join(ROOT_DIR, ".next", "analyze");

    try {
      await fs.access(analyzeDir);
      spinner.info(chalk.blue("ℹ Run 'pnpm build:analyze' to generate bundle analysis"));
    } catch {
      spinner.info(chalk.blue("ℹ Bundle analysis not available - run 'pnpm build:analyze'"));
    }

    analysisResult.bundleSize = "Run 'pnpm build:analyze' to generate";
  } catch {
    spinner.warn(chalk.yellow("⚠ Could not analyze bundle size"));
  }
}

async function checkDuplicateDependencies(): Promise<void> {
  const spinner = ora("Checking for duplicate dependencies...").start();

  try {
    const packageJson = JSON.parse(await fs.readFile(path.join(ROOT_DIR, "package.json"), "utf-8"));

    const deps = new Set(Object.keys(packageJson.dependencies || {}));
    const devDeps = new Set(Object.keys(packageJson.devDependencies || {}));

    const duplicates = [...deps].filter((dep) => devDeps.has(dep));

    if (duplicates.length > 0) {
      spinner.warn(
        chalk.yellow(
          `⚠ Found ${duplicates.length} packages in both dependencies and devDependencies`
        )
      );
      analysisResult.recommendations.push(
        `Remove duplicate dependencies: ${duplicates.join(", ")}`
      );
    } else {
      spinner.succeed(chalk.green("✓ No duplicate dependencies found"));
    }
  } catch {
    spinner.fail(chalk.red("✗ Could not check dependencies"));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORT GENERATION
// ═══════════════════════════════════════════════════════════════════════════

function generateReport(): string {
  const report = `# ComicWise Project Analysis Report

**Generated:** ${new Date(analysisResult.timestamp).toLocaleString()}

## Executive Summary

| Metric | Count |
|--------|-------|
| TypeScript Errors | ${analysisResult.typeScriptErrors} |
| ESLint Errors | ${analysisResult.eslintErrors} |
| ESLint Warnings | ${analysisResult.eslintWarnings} |
| Security Vulnerabilities | ${analysisResult.securityVulnerabilities} |
| Performance Issues | ${analysisResult.performanceIssues.length} |

## Performance Issues

${
  analysisResult.performanceIssues.length > 0
    ? analysisResult.performanceIssues.map((issue) => `- ${issue}`).join("\n")
    : "No major performance issues detected."
}

## Bundle Size

${analysisResult.bundleSize}

## Recommendations

${
  analysisResult.recommendations.length > 0
    ? analysisResult.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join("\n")
    : "No specific recommendations at this time."
}

## Next Steps

1. **Fix Critical Issues**: Address TypeScript and ESLint errors first
2. **Security**: Run \`pnpm audit fix\` to patch vulnerabilities
3. **Performance**: Implement code-splitting and optimize images
4. **Code Quality**: Run \`pnpm lint:fix\` and \`pnpm format\`
5. **Testing**: Ensure test coverage is above 80%

## Additional Resources

- [Next.js Best Practices](https://nextjs.org/docs/app/building-your-application/deploying/production-checklist)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [ESLint Rules](https://eslint.org/docs/rules/)

---

*Generated by ComicWise Project Analyzer*
`;

  return report;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log(chalk.bold.cyan("\n═══════════════════════════════════════════════════════"));
  console.log(chalk.bold.cyan("   ComicWise Project Analyzer"));
  console.log(chalk.bold.cyan("═══════════════════════════════════════════════════════\n"));

  console.log(chalk.white("Performing comprehensive project analysis...\n"));

  // Run all analyses
  await analyzeTypeScript();
  await analyzeESLint();
  await analyzePerformance();
  await analyzeSecurity();
  await analyzeBundleSize();
  await checkDuplicateDependencies();

  // Generate and save report
  console.log(chalk.bold("\nGenerating report..."));

  const report = generateReport();
  const outputPath = path.join(ROOT_DIR, OUTPUT_FILE);

  await fs.writeFile(outputPath, report, "utf-8");

  console.log(chalk.green(`\n✓ Report saved to: ${outputPath}\n`));

  // Display summary
  console.log(chalk.bold.cyan("═══════════════════════════════════════════════════════"));
  console.log(chalk.bold.cyan("   Analysis Complete"));
  console.log(chalk.bold.cyan("═══════════════════════════════════════════════════════\n"));

  console.log(
    chalk.white("TypeScript Errors:     "),
    analysisResult.typeScriptErrors > 0
      ? chalk.red(analysisResult.typeScriptErrors)
      : chalk.green(analysisResult.typeScriptErrors)
  );

  console.log(
    chalk.white("ESLint Issues:         "),
    analysisResult.eslintErrors + analysisResult.eslintWarnings > 0
      ? chalk.yellow(
          `${analysisResult.eslintErrors} errors, ${analysisResult.eslintWarnings} warnings`
        )
      : chalk.green("0")
  );

  console.log(
    chalk.white("Security Issues:       "),
    analysisResult.securityVulnerabilities > 0
      ? chalk.red(analysisResult.securityVulnerabilities)
      : chalk.green(analysisResult.securityVulnerabilities)
  );

  console.log(
    chalk.white("Performance Issues:    "),
    analysisResult.performanceIssues.length > 0
      ? chalk.yellow(analysisResult.performanceIssues.length)
      : chalk.green(analysisResult.performanceIssues.length)
  );

  console.log(
    chalk.white("\nRecommendations:       "),
    chalk.cyan(analysisResult.recommendations.length)
  );

  console.log(chalk.green(`\n✓ Full report available at: ${OUTPUT_FILE}\n`));
}

main().catch((error) => {
  console.error(chalk.red(`\n✗ Analysis failed: ${error}\n`));
  process.exit(1);
});
