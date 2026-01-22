#!/usr/bin/env tsx

/**
 * Find Duplicate Code - AST-based Analysis
 *
 * Uses ts-morph to find duplicate:
 * - Zod schemas
 * - Components
 * - Functions
 * - Types/Interfaces
 * - Empty folders
 * - Blank files
 */

import chalk from "chalk";
import { readdir, rmdir, stat, unlink } from "fs/promises";
import { join } from "path";
import { Project, SyntaxKind } from "ts-morph";

interface DuplicateReport {
  zodSchemas: Map<string, string[]>;
  components: Map<string, string[]>;
  functions: Map<string, string[]>;
  interfaces: Map<string, string[]>;
  emptyFolders: string[];
  blankFiles: string[];
}

const report: DuplicateReport = {
  zodSchemas: new Map(),
  components: new Map(),
  functions: new Map(),
  interfaces: new Map(),
  emptyFolders: [],
  blankFiles: [],
};

/**
 * Initialize ts-morph project
 */
function initProject(): Project {
  console.log(chalk.blue("🔍 Initializing TypeScript project analysis...\n"));
  return new Project({
    tsConfigFilePath: "tsconfig.json",
    skipAddingFilesFromTsConfig: false,
  });
}

/**
 * Find duplicate Zod schemas
 */
function findDuplicateZodSchemas(project: Project) {
  console.log(chalk.blue("📋 Analyzing Zod schemas...\n"));
  const schemas = new Map<string, string[]>();

  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    if (filePath.includes("node_modules")) continue;

    // Find z.object() calls
    const zodObjects = sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression)
      .filter(call => {
        const expr = call.getExpression().getText();
        return expr.includes("z.object");
      });

    for (const zodObj of zodObjects) {
      const schemaText = zodObj.getText();
      const existing = schemas.get(schemaText);
      if (existing) {
        existing.push(filePath);
      } else {
        schemas.set(schemaText, [filePath]);
      }
    }
  }

  // Filter to only duplicates
  for (const [schema, files] of schemas.entries()) {
    if (files.length > 1) {
      const schemaPreview = schema.slice(0, 100) + "...";
      report.zodSchemas.set(schemaPreview, files);
    }
  }

  console.log(chalk.green(`✓ Found ${report.zodSchemas.size} duplicate Zod schemas\n`));
}

/**
 * Find duplicate React components
 */
function findDuplicateComponents(project: Project) {
  console.log(chalk.blue("⚛️  Analyzing React components...\n"));
  const components = new Map<string, string[]>();

  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    if (filePath.includes("node_modules") || !filePath.includes("components")) continue;

    // Find function components
    const functionDeclarations = sourceFile.getFunctions();
    const arrowFunctions = sourceFile.getDescendantsOfKind(SyntaxKind.VariableDeclaration)
      .filter(v => v.getInitializer()?.getKind() === SyntaxKind.ArrowFunction);

    const allFunctions = [
      ...functionDeclarations.map(f => f.getName()),
      ...arrowFunctions.map(v => v.getName()),
    ];

    for (const name of allFunctions) {
      if (!name) continue;
      const existing = components.get(name);
      if (existing) {
        existing.push(filePath);
      } else {
        components.set(name, [filePath]);
      }
    }
  }

  // Filter to only duplicates
  for (const [name, files] of components.entries()) {
    if (files.length > 1) {
      report.components.set(name, files);
    }
  }

  console.log(chalk.green(`✓ Found ${report.components.size} duplicate components\n`));
}

/**
 * Find duplicate functions
 */
function findDuplicateFunctions(project: Project) {
  console.log(chalk.blue("🔧 Analyzing functions...\n"));
  const functions = new Map<string, string[]>();

  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    if (filePath.includes("node_modules")) continue;

    const functionDeclarations = sourceFile.getFunctions();

    for (const func of functionDeclarations) {
      const name = func.getName();
      if (!name) continue;

      const existing = functions.get(name);
      if (existing) {
        existing.push(filePath);
      } else {
        functions.set(name, [filePath]);
      }
    }
  }

  // Filter to only duplicates
  for (const [name, files] of functions.entries()) {
    if (files.length > 1) {
      report.functions.set(name, files);
    }
  }

  console.log(chalk.green(`✓ Found ${report.functions.size} duplicate functions\n`));
}

/**
 * Find duplicate interfaces/types
 */
function findDuplicateInterfaces(project: Project) {
  console.log(chalk.blue("📐 Analyzing interfaces and types...\n"));
  const interfaces = new Map<string, string[]>();

  for (const sourceFile of project.getSourceFiles()) {
    const filePath = sourceFile.getFilePath();
    if (filePath.includes("node_modules")) continue;

    const interfaceDecls = sourceFile.getInterfaces();
    const typeAliases = sourceFile.getTypeAliases();

    for (const iface of interfaceDecls) {
      const name = iface.getName();
      const existing = interfaces.get(name);
      if (existing) {
        existing.push(filePath);
      } else {
        interfaces.set(name, [filePath]);
      }
    }

    for (const typeAlias of typeAliases) {
      const name = typeAlias.getName();
      const existing = interfaces.get(name);
      if (existing) {
        existing.push(filePath);
      } else {
        interfaces.set(name, [filePath]);
      }
    }
  }

  // Filter to only duplicates
  for (const [name, files] of interfaces.entries()) {
    if (files.length > 1) {
      report.interfaces.set(name, files);
    }
  }

  console.log(chalk.green(`✓ Found ${report.interfaces.size} duplicate interfaces/types\n`));
}

/**
 * Find empty folders recursively
 */
async function findEmptyFolders(dir: string = "src"): Promise<void> {
  console.log(chalk.blue("📁 Finding empty folders...\n"));

  async function scanDir(currentDir: string): Promise<void> {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true });

      if (entries.length === 0) {
        report.emptyFolders.push(currentDir);
        return;
      }

      const folders = entries.filter(e => e.isDirectory());
      for (const folder of folders) {
        if (folder.name === "node_modules" || folder.name === ".git") continue;
        await scanDir(join(currentDir, folder.name));
      }
    } catch (error) {
      // Ignore permission errors
    }
  }

  await scanDir(dir);
  console.log(chalk.green(`✓ Found ${report.emptyFolders.length} empty folders\n`));
}

/**
 * Find blank files (empty or only whitespace)
 */
async function findBlankFiles(dir: string = "src"): Promise<void> {
  console.log(chalk.blue("📄 Finding blank files...\n"));

  async function scanDir(currentDir: string): Promise<void> {
    try {
      const entries = await readdir(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(currentDir, entry.name);

        if (entry.isDirectory()) {
          if (entry.name === "node_modules" || entry.name === ".git") continue;
          await scanDir(fullPath);
        } else if (entry.isFile()) {
          const stats = await stat(fullPath);
          if (stats.size === 0) {
            report.blankFiles.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Ignore permission errors
    }
  }

  await scanDir(dir);
  console.log(chalk.green(`✓ Found ${report.blankFiles.length} blank files\n`));
}

/**
 * Print report
 */
function printReport() {
  console.log(chalk.bold("\n" + "═".repeat(60)));
  console.log(chalk.bold.cyan("   DUPLICATE CODE ANALYSIS REPORT"));
  console.log(chalk.bold("═".repeat(60) + "\n"));

  // Zod Schemas
  if (report.zodSchemas.size > 0) {
    console.log(chalk.bold.yellow(`\n📋 Duplicate Zod Schemas (${report.zodSchemas.size}):\n`));
    for (const [schema, files] of report.zodSchemas.entries()) {
      console.log(chalk.white(`  Schema: ${schema}`));
      files.forEach(f => console.log(chalk.gray(`    - ${f}`)));
      console.log();
    }
  }

  // Components
  if (report.components.size > 0) {
    console.log(chalk.bold.yellow(`\n⚛️  Duplicate Components (${report.components.size}):\n`));
    for (const [name, files] of report.components.entries()) {
      console.log(chalk.white(`  ${name}:`));
      files.forEach(f => console.log(chalk.gray(`    - ${f}`)));
      console.log();
    }
  }

  // Functions
  if (report.functions.size > 0) {
    console.log(chalk.bold.yellow(`\n🔧 Duplicate Functions (${report.functions.size}):\n`));
    for (const [name, files] of report.functions.entries()) {
      console.log(chalk.white(`  ${name}:`));
      files.forEach(f => console.log(chalk.gray(`    - ${f}`)));
      console.log();
    }
  }

  // Interfaces
  if (report.interfaces.size > 0) {
    console.log(chalk.bold.yellow(`\n📐 Duplicate Interfaces/Types (${report.interfaces.size}):\n`));
    for (const [name, files] of report.interfaces.entries()) {
      console.log(chalk.white(`  ${name}:`));
      files.forEach(f => console.log(chalk.gray(`    - ${f}`)));
      console.log();
    }
  }

  // Empty Folders
  if (report.emptyFolders.length > 0) {
    console.log(chalk.bold.yellow(`\n📁 Empty Folders (${report.emptyFolders.length}):\n`));
    report.emptyFolders.forEach(f => console.log(chalk.gray(`  - ${f}`)));
    console.log();
  }

  // Blank Files
  if (report.blankFiles.length > 0) {
    console.log(chalk.bold.yellow(`\n📄 Blank Files (${report.blankFiles.length}):\n`));
    report.blankFiles.forEach(f => console.log(chalk.gray(`  - ${f}`)));
    console.log();
  }

  console.log(chalk.bold("═".repeat(60)));
  console.log(chalk.bold.green("\n✓ Analysis Complete\n"));
}

/**
 * Delete empty folders and blank files (optional)
 */
async function cleanup(dryRun: boolean = true) {
  if (dryRun) {
    console.log(chalk.yellow("\n⚠️  DRY RUN MODE - No files will be deleted\n"));
    return;
  }

  console.log(chalk.blue("\n🧹 Cleaning up...\n"));

  // Delete blank files
  for (const file of report.blankFiles) {
    try {
      await unlink(file);
      console.log(chalk.green(`✓ Deleted: ${file}`));
    } catch (error) {
      console.log(chalk.red(`✗ Failed to delete: ${file}`));
    }
  }

  // Delete empty folders
  for (const folder of report.emptyFolders) {
    try {
      await rmdir(folder);
      console.log(chalk.green(`✓ Deleted: ${folder}`));
    } catch (error) {
      console.log(chalk.red(`✗ Failed to delete: ${folder}`));
    }
  }

  console.log(chalk.green("\n✓ Cleanup complete\n"));
}

/**
 * Main execution
 */
async function main() {
  console.log(chalk.bold.cyan("\n╔═══════════════════════════════════════════════════════╗"));
  console.log(chalk.bold.cyan("║   ComicWise - Duplicate Code Finder (ts-morph)        ║"));
  console.log(chalk.bold.cyan("╚═══════════════════════════════════════════════════════╝\n"));

  const args = process.argv.slice(2);
  const shouldCleanup = args.includes("--cleanup");
  const dryRun = !args.includes("--no-dry-run");

  try {
    const project = initProject();

    // Run all analyses
    findDuplicateZodSchemas(project);
    findDuplicateComponents(project);
    findDuplicateFunctions(project);
    findDuplicateInterfaces(project);
    await findEmptyFolders();
    await findBlankFiles();

    // Print report
    printReport();

    // Cleanup if requested
    if (shouldCleanup) {
      await cleanup(dryRun);
    } else {
      console.log(chalk.yellow("\n💡 Tip: Run with --cleanup to delete empty folders and blank files"));
      console.log(chalk.yellow("   Add --no-dry-run to actually delete files\n"));
    }
  } catch (error) {
    console.error(chalk.red("\n✗ Error:"), error);
    process.exit(1);
  }
}

main();
