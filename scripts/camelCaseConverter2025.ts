#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════════════════════
// CAMELCASE CONVENTION SCRIPT
// Task 7: Convert filenames and functions to CamelCase
// ═══════════════════════════════════════════════════════════════════════════════

import chalk from "chalk";
import fs from "fs-extra";
import { glob } from "glob";
import ora from "ora";
import path from "path";

interface RenameOperation {
  from: string;
  to: string;
  type: "file" | "function";
}

class CamelCaseConverter {
  private projectRoot: string;
  private operations: RenameOperation[] = [];
  private dryRun: boolean;

  private readonly IGNORE_PATTERNS = [
    "node_modules/**",
    ".git/**",
    ".next/**",
    "dist/**",
    "build/**",
    "coverage/**",
    "public/**",
  ];

  private readonly SKIP_FILES = [
    "next.config.ts",
    "next-env.d.ts",
    "tsconfig.json",
    "package.json",
    "README.md",
    ".gitignore",
    ".eslintrc",
    ".prettierrc",
  ];

  constructor(dryRun: boolean = false) {
    this.projectRoot = process.cwd();
    this.dryRun = dryRun;
  }

  /**
   * Convert kebab-case or snake_case to PascalCase for components
   * @param str
   */
  private toPascalCase(str: string): string {
    return str
      .replaceAll(/[_-](.)/g, (_, char) => char.toUpperCase())
      .replace(/^(.)/, (char) => char.toUpperCase());
  }

  /**
   * Convert kebab-case or snake_case to camelCase
   * @param str
   */
  private toCamelCase(str: string): string {
    return str
      .replaceAll(/[_-](.)/g, (_, char) => char.toUpperCase())
      .replace(/^(.)/, (char) => char.toLowerCase());
  }

  /**
   * Check if filename should be PascalCase (components, classes)
   * @param filePath
   */
  private shouldBePascalCase(filePath: string): boolean {
    const fileName = path.basename(filePath, path.extname(filePath));
    const dirName = path.dirname(filePath);

    // Components should be PascalCase
    if (dirName.includes("components")) {
      return true;
    }

    // Class files should be PascalCase
    const content = fs.readFileSync(filePath, "utf-8");
    if (content.includes("export class") || content.includes("export default class")) {
      return true;
    }

    // React components should be PascalCase
    if (content.includes("export default function") || content.includes("export function")) {
      // Check if it returns JSX
      if (content.includes("return (") && (content.includes("<") || content.includes("jsx"))) {
        return true;
      }
    }

    return false;
  }

  /**
   * Scan and plan file renames
   */
  private async planFileRenames() {
    const spinner = ora("Planning file renames").start();

    try {
      const files = await glob("src/**/*.{ts,tsx}", {
        cwd: this.projectRoot,
        ignore: this.IGNORE_PATTERNS,
        absolute: true,
      });

      for (const file of files) {
        const fileName = path.basename(file);
        const ext = path.extname(file);
        const baseName = path.basename(file, ext);

        // Skip files that should not be renamed
        if (this.SKIP_FILES.includes(fileName)) {
          continue;
        }

        // Skip if already in correct case
        const hasKebabOrSnake = /[_-]/.test(baseName);
        if (!hasKebabOrSnake) {
          continue;
        }

        const isPascal = this.shouldBePascalCase(file);
        const newBaseName = isPascal ? this.toPascalCase(baseName) : this.toCamelCase(baseName);

        if (newBaseName !== baseName) {
          const newFile = path.join(path.dirname(file), newBaseName + ext);
          this.operations.push({
            from: file,
            to: newFile,
            type: "file",
          });
        }
      }

      spinner.succeed(`Planned ${this.operations.length} file renames`);
    } catch (error) {
      spinner.fail("Failed to plan file renames");
      throw error;
    }
  }

  /**
   * Execute file renames
   */
  private async executeFileRenames() {
    const spinner = ora("Executing file renames").start();

    try {
      for (const op of this.operations) {
        if (op.type === "file") {
          if (this.dryRun) {
            console.log(chalk.gray(`  Would rename: ${op.from} → ${op.to}`));
          } else {
            await fs.move(op.from, op.to);
          }
        }
      }

      spinner.succeed(
        `${this.dryRun ? "Would rename" : "Renamed"} ${this.operations.length} files`
      );
    } catch (error) {
      spinner.fail("Failed to execute file renames");
      throw error;
    }
  }

  /**
   * Update imports after file renames
   */
  private async updateImports() {
    const spinner = ora("Updating import statements").start();

    try {
      const files = await glob("src/**/*.{ts,tsx}", {
        cwd: this.projectRoot,
        ignore: this.IGNORE_PATTERNS,
        absolute: true,
      });

      let updatedCount = 0;

      for (const file of files) {
        let content = await fs.readFile(file, "utf-8");
        let modified = false;

        for (const op of this.operations) {
          if (op.type === "file") {
            const oldImport = path.basename(op.from, path.extname(op.from));
            const newImport = path.basename(op.to, path.extname(op.to));

            // Match import statements
            const importRegex = new RegExp(
              `(import\\s+.*?from\\s+['"].*?/)${oldImport}(['"])`,
              "g"
            );

            if (importRegex.test(content)) {
              content = content.replace(importRegex, `$1${newImport}$2`);
              modified = true;
            }
          }
        }

        if (modified) {
          if (!this.dryRun) {
            await fs.writeFile(file, content, "utf-8");
          }
          updatedCount++;
        }
      }

      spinner.succeed(
        `${this.dryRun ? "Would update" : "Updated"} imports in ${updatedCount} files`
      );
    } catch (error) {
      spinner.fail("Failed to update imports");
      throw error;
    }
  }

  /**
   * Generate summary report
   */
  private generateReport() {
    console.log("\n");
    console.log(chalk.cyan("═".repeat(80)));
    console.log(chalk.yellow.bold("  CAMELCASE CONVERSION - SUMMARY REPORT"));
    console.log(chalk.gray(`  Date: ${new Date().toISOString()}`));
    console.log(chalk.gray(`  Mode: ${this.dryRun ? "DRY RUN" : "LIVE"}`));
    console.log(chalk.cyan("═".repeat(80)));
    console.log("\n");

    console.log(chalk.bold("📊 Conversion Statistics:"));
    console.log(chalk.green(`  📝 File Renames: ${this.operations.length}`));
    console.log("\n");

    if (this.operations.length > 0 && this.dryRun) {
      console.log(chalk.bold("📋 Planned Operations (sample):"));
      this.operations.slice(0, 10).forEach((op) => {
        console.log(chalk.gray(`  ${path.basename(op.from)} → ${path.basename(op.to)}`));
      });
      if (this.operations.length > 10) {
        console.log(chalk.gray(`  ... and ${this.operations.length - 10} more`));
      }
      console.log("\n");
    }

    console.log(chalk.cyan("═".repeat(80)));
  }

  /**
   * Main execution
   */
  async run() {
    console.log(
      chalk.cyan.bold(`\n📝 Starting CamelCase Conversion ${this.dryRun ? "(DRY RUN)" : ""}\n`)
    );

    await this.planFileRenames();

    if (this.operations.length === 0) {
      console.log(chalk.green("\n✨ All files already follow CamelCase convention!\n"));
      return;
    }

    if (this.dryRun) {
      this.generateReport();
      console.log(chalk.yellow("\n⚠️  This was a dry run. Use --execute to apply changes.\n"));
    } else {
      await this.executeFileRenames();
      await this.updateImports();
      this.generateReport();
      console.log(chalk.green.bold("\n✨ CamelCase conversion completed!\n"));
    }
  }
}

// Parse CLI arguments
const args = process.argv.slice(2);
const dryRun = !args.includes("--execute");

// Execute
const converter = new CamelCaseConverter(dryRun);
converter.run().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
