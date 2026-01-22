#!/usr/bin/env tsx

/**
 * Convert to Kebab-case - AST-based Transformation
 *
 * Converts all filenames and function names to kebab-case convention.
 * Uses ts-morph for safe AST manipulation.
 */

import chalk from "chalk";
import { readdir, rename } from "fs/promises";
import { basename, dirname, extname, join } from "path";
import { Project } from "ts-morph";

interface ConversionReport {
  filesRenamed: number;
  functionsRenamed: number;
  errors: string[];
  renames: Map<string, string>;
}

const report: ConversionReport = {
  filesRenamed: 0,
  functionsRenamed: 0,
  errors: [],
  renames: new Map(),
};

/**
 * Convert string to kebab-case
 * @param str
 */
function toKebabCase(str: string): string {
  return str
    // Insert hyphen before uppercase letters
    .replaceAll(/([a-z])([A-Z])/g, "$1-$2")
    // Replace spaces and underscores with hyphens
    .replaceAll(/[\s_]+/g, "-")
    // Convert to lowercase
    .toLowerCase()
    // Remove multiple consecutive hyphens
    .replaceAll(/-+/g, "-")
    // Remove leading/trailing hyphens
    .replaceAll(/^-+|-+$/g, "");
}

/**
 * Check if a string is already in kebab-case
 * @param str
 */
function isKebabCase(str: string): boolean {
  return /^[\da-z]+(-[\da-z]+)*$/.test(str);
}

/**
 * Rename files to kebab-case
 * @param dir
 * @param dryRun
 */
async function renameFiles(dir: string = "src", dryRun: boolean = true): Promise<void> {
  console.log(chalk.blue(`🔄 ${dryRun ? "Scanning" : "Renaming"} files to kebab-case...\n`));

  async function scanDir(currentDir: string): Promise<void> {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);

        if (entry.isDirectory()) {
          if (entry.name === "node_modules" || entry.name === ".git" || entry.name === ".next") {
            continue;
          }
          await scanDir(fullPath);

          // Rename directory if needed
          const nameWithoutExt = entry.name;
          if (!isKebabCase(nameWithoutExt)) {
            const newName = toKebabCase(nameWithoutExt);
            const newPath = join(dirname(fullPath), newName);

            report.renames.set(fullPath, newPath);

            if (!dryRun) {
              try {
                await rename(fullPath, newPath);
                report.filesRenamed++;
                console.log(chalk.green(`✓ Renamed dir: ${entry.name} → ${newName}`));
              } catch (error) {
                const errorMsg = `Failed to rename ${fullPath}: ${error}`;
                report.errors.push(errorMsg);
                console.log(chalk.red(`✗ ${errorMsg}`));
              }
            } else {
              console.log(chalk.yellow(`  Would rename: ${entry.name} → ${newName}`));
            }
          }
        } else if (entry.isFile()) {
          const ext = extname(entry.name);
          const nameWithoutExt = basename(entry.name, ext);

          // Skip files that are already in kebab-case or special files
          if (isKebabCase(nameWithoutExt) ||
              entry.name.startsWith(".") ||
              entry.name === "README.md" ||
              entry.name === "LICENSE") {
            continue;
          }

          const newName = toKebabCase(nameWithoutExt) + ext;
          const newPath = join(dirname(fullPath), newName);

          report.renames.set(fullPath, newPath);

          if (!dryRun) {
            try {
              await rename(fullPath, newPath);
              report.filesRenamed++;
              console.log(chalk.green(`✓ Renamed: ${entry.name} → ${newName}`));
            } catch (error) {
              const errorMsg = `Failed to rename ${fullPath}: ${error}`;
              report.errors.push(errorMsg);
              console.log(chalk.red(`✗ ${errorMsg}`));
            }
          } else {
            console.log(chalk.yellow(`  Would rename: ${entry.name} → ${newName}`));
          }
        }
      }
    } catch (error) {
      const errorMsg = `Error scanning ${currentDir}: ${error}`;
      report.errors.push(errorMsg);
      console.log(chalk.red(`✗ ${errorMsg}`));
    }
  }

  await scanDir(dir);

  if (dryRun) {
    console.log(chalk.green(`\n✓ Found ${report.renames.size} files to rename\n`));
  } else {
    console.log(chalk.green(`\n✓ Renamed ${report.filesRenamed} files\n`));
  }
}

/**
 * Rename functions to kebab-case (in camelCase to maintain JS standards)
 * Note: This keeps functions as camelCase but reports PascalCase ones
 * @param project
 * @param dryRun
 */
function renameFunctions(project: Project, dryRun: boolean = true): void {
  console.log(chalk.blue(`🔧 ${dryRun ? "Analyzing" : "Renaming"} function names...\n`));

  for (const sourceFile of project.getSourceFiles()) {
    if (sourceFile.getFilePath().includes("node_modules")) continue;

    const functions = sourceFile.getFunctions();

    for (const func of functions) {
      const currentName = func.getName();
      if (!currentName) continue;

      // Check if function is exported as React component (PascalCase is OK)
      const isExported = func.isExported() || func.hasExportKeyword();
      const isPascalCase = /^[A-Z]/.test(currentName);

      if (isExported && isPascalCase) {
        // Skip React components and exported classes
        continue;
      }

      // Convert to camelCase if it's PascalCase or has underscores
      if (isPascalCase || currentName.includes("_")) {
        const newName = currentName.charAt(0).toLowerCase() + currentName.slice(1).replaceAll('_', "");

        if (newName !== currentName) {
          if (!dryRun) {
            try {
              func.rename(newName);
              report.functionsRenamed++;
              console.log(chalk.green(`✓ Renamed function: ${currentName} → ${newName}`));
            } catch (error) {
              const errorMsg = `Failed to rename function ${currentName}: ${error}`;
              report.errors.push(errorMsg);
              console.log(chalk.red(`✗ ${errorMsg}`));
            }
          } else {
            console.log(chalk.yellow(`  Would rename function: ${currentName} → ${newName}`));
          }
        }
      }
    }

    if (!dryRun && report.functionsRenamed > 0) {
      sourceFile.save();
    }
  }

  console.log(chalk.green(`\n✓ ${dryRun ? "Found" : "Renamed"} ${report.functionsRenamed} functions\n`));
}

/**
 * Update imports after file renames
 * @param project
 */
function updateImports(project: Project): void {
  console.log(chalk.blue("📝 Updating import statements...\n"));

  let updatedImports = 0;

  for (const sourceFile of project.getSourceFiles()) {
    if (sourceFile.getFilePath().includes("node_modules")) continue;

    const imports = sourceFile.getImportDeclarations();

    for (const importDecl of imports) {
      const moduleSpecifier = importDecl.getModuleSpecifierValue();

      // Check if this import needs updating
      for (const [oldPath, newPath] of report.renames.entries()) {
        if (moduleSpecifier.includes(oldPath) || moduleSpecifier.includes(basename(oldPath, extname(oldPath)))) {
          const newModuleSpecifier = moduleSpecifier.replace(
            basename(oldPath, extname(oldPath)),
            basename(newPath, extname(newPath))
          );

          importDecl.setModuleSpecifier(newModuleSpecifier);
          updatedImports++;
          console.log(chalk.green(`✓ Updated import in ${sourceFile.getBaseName()}`));
        }
      }
    }

    sourceFile.save();
  }

  console.log(chalk.green(`\n✓ Updated ${updatedImports} import statements\n`));
}

/**
 * Print report
 */
function printReport() {
  console.log(chalk.bold("\n" + "═".repeat(60)));
  console.log(chalk.bold.cyan("   KEBAB-CASE CONVERSION REPORT"));
  console.log(chalk.bold("═".repeat(60) + "\n"));

  console.log(chalk.green(`✓ Files renamed: ${report.filesRenamed}`));
  console.log(chalk.green(`✓ Functions renamed: ${report.functionsRenamed}`));
  console.log(chalk.red(`✗ Errors: ${report.errors.length}\n`));

  if (report.errors.length > 0) {
    console.log(chalk.bold.red("Errors:\n"));
    report.errors.forEach(err => console.log(chalk.red(`  - ${err}`)));
    console.log();
  }

  console.log(chalk.bold("═".repeat(60)));
  console.log(chalk.bold.green("\n✓ Conversion Complete\n"));
}

/**
 * Main execution
 */
async function main() {
  console.log(chalk.bold.cyan("\n╔═══════════════════════════════════════════════════════╗"));
  console.log(chalk.bold.cyan("║   ComicWise - Kebab-case Converter (ts-morph)         ║"));
  console.log(chalk.bold.cyan("╚═══════════════════════════════════════════════════════╝\n"));

  const args = new Set(process.argv.slice(2));
  const dryRun = !args.has("--no-dry-run");
  const filesOnly = args.has("--files-only");
  const functionsOnly = args.has("--functions-only");

  if (dryRun) {
    console.log(chalk.yellow("⚠️  DRY RUN MODE - No changes will be made\n"));
    console.log(chalk.yellow("   Use --no-dry-run to apply changes\n"));
  }

  try {
    // Rename files
    if (!functionsOnly) {
      await renameFiles("src", dryRun);
    }

    // Initialize project for function renaming
    if (!filesOnly) {
      console.log(chalk.blue("🔧 Initializing TypeScript project...\n"));
      const project = new Project({
        tsConfigFilePath: "tsconfig.json",
        skipAddingFilesFromTsConfig: false,
      });

      renameFunctions(project, dryRun);

      if (!dryRun && !filesOnly) {
        updateImports(project);
      }
    }

    // Print report
    printReport();

    if (dryRun) {
      console.log(chalk.yellow("\n💡 Review the changes above and run with --no-dry-run to apply\n"));
    }
  } catch (error) {
    console.error(chalk.red("\n✗ Error:"), error);
    process.exit(1);
  }
}

main();
