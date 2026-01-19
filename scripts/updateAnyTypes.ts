#!/usr/bin/env tsx
/**
 * ═══════════════════════════════════════════════════════════════════════════
 * TYPE SYSTEM UPDATER - Remove 'any' Types & Infer Proper Types
 * ═══════════════════════════════════════════════════════════════════════════
 */

import chalk from "chalk";
import { readFileSync, writeFileSync } from "fs";
import { globSync } from "glob";

console.log(chalk.cyan("\n╔══════════════════════════════════════════════════════════════╗"));
console.log(chalk.cyan("║          Type System Updater - Remove 'any' Types           ║"));
console.log(chalk.cyan("╚══════════════════════════════════════════════════════════════╝\n"));

const files = globSync("**/*.{ts,tsx}", {
  ignore: ["**/node_modules/**", "**/.next/**", "**/types/*.d.ts"],
});

console.log(chalk.blue(`📁 Found ${files.length} files to process\n`));

interface Replacement {
  from: RegExp;
  to: string;
  description: string;
}

const replacements: Replacement[] = [
  // Function parameters with any
  {
    from: /\(([^):]+):\s*any\)/g,
    to: "<T>($1: T)",
    description: "Function parameter any -> generic T",
  },
  // Variable declarations
  {
    from: /const\s+(\w+):\s*any\s*=/g,
    to: "const $1 =",
    description: "Const with any -> infer type",
  },
  {
    from: /let\s+(\w+):\s*any\s*=/g,
    to: "let $1 =",
    description: "Let with any -> infer type",
  },
  // Array of any
  {
    from: /:\s*any\[]/g,
    to: ": unknown[]",
    description: "any[] -> unknown[]",
  },
  // Object with any
  {
    from: /:\s*Record<string,\s*any>/g,
    to: ": Record<string, unknown>",
    description: "Record<string, any> -> Record<string, unknown>",
  },
  // Generic any
  {
    from: /<any>/g,
    to: "<unknown>",
    description: "<any> -> <unknown>",
  },
];

let totalReplacements = 0;
let filesModified = 0;

for (const file of files) {
  let content = readFileSync(file, "utf8");
  const originalContent = content;
  let fileReplacements = 0;

  // Skip files with eslint-disable any
  if (content.includes("eslint-disable") && content.includes("typescript-eslint/no-explicit-any")) {
    continue;
  }

  for (const replacement of replacements) {
    const matches = content.match(replacement.from);
    if (matches) {
      content = content.replace(replacement.from, replacement.to);
      fileReplacements += matches.length;
    }
  }

  if (content !== originalContent) {
    writeFileSync(file, content, "utf8");
    filesModified++;
    totalReplacements += fileReplacements;
    console.log(chalk.green(`✓ ${file} - ${fileReplacements} replacements`));
  }
}

console.log(chalk.cyan("\n╔══════════════════════════════════════════════════════════════╗"));
console.log(chalk.cyan("║                        Summary                                ║"));
console.log(chalk.cyan("╚══════════════════════════════════════════════════════════════╝\n"));

console.log(chalk.yellow("Files processed:"), files.length);
console.log(chalk.yellow("Files modified:"), filesModified);
console.log(chalk.yellow("Total replacements:"), totalReplacements);

console.log(chalk.green("\n✅ Type system update complete!\n"));

process.exit(0);
