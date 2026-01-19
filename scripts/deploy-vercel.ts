#!/usr/bin/env tsx
/**
 * Vercel Deployment Script
 * Automates deployment to Vercel for preview and production
 */

import chalk from "chalk";
import inquirer from "inquirer";
import { execSync } from "node:child_process";
import ora from "ora";

interface DeployOptions {
  environment?: "production" | "preview";
  skipBuild?: boolean;
  projectName?: string;
}

function exec(command: string, silent = false): string {
  try {
    const output = execSync(command, {
      encoding: "utf8",
      stdio: silent ? "pipe" : "inherit",
    });
    return output;
  } catch (error) {
    if (!silent) {
      console.error(chalk.red(`Command failed: ${command}`));
    }
    throw error;
  }
}

function checkVercelCLI(): boolean {
  try {
    exec("vercel --version", true);
    return true;
  } catch {
    return false;
  }
}

async function deployToVercel(options: DeployOptions = {}) {
  console.log(chalk.cyan("\n═══════════════════════════════════════════════════════════════"));
  console.log(chalk.cyan("   Vercel Deployment"));
  console.log(chalk.cyan("═══════════════════════════════════════════════════════════════\n"));

  // Check if Vercel CLI is installed
  if (!checkVercelCLI()) {
    console.error(chalk.red("❌ Vercel CLI is not installed."));
    console.log(chalk.yellow("\nInstall Vercel CLI:"));
    console.log(chalk.white("  pnpm add -g vercel"));
    console.log(chalk.white("  # or"));
    console.log(chalk.white("  npm install -g vercel"));
    process.exit(1);
  }

  // Get deployment options if not provided
  if (!options.environment) {
    const answers = await inquirer.prompt([
      {
        type: "list",
        name: "environment",
        message: "Select deployment environment:",
        choices: [
          { name: "Production (main branch)", value: "production" },
          { name: "Preview (development branch)", value: "preview" },
        ],
        default: "preview",
      },
      {
        type: "confirm",
        name: "skipBuild",
        message: "Skip build step? (if already built)",
        default: false,
      },
    ]);

    options = { ...options, ...answers };
  }

  const spinner = ora("Starting deployment...").start();

  try {
    // Build if not skipped
    if (!options.skipBuild) {
      spinner.text = "Building project...";
      exec("pnpm build");
      spinner.succeed("Build completed");
    }

    // Deploy to Vercel
    spinner.start("Deploying to Vercel...");

    const deployCommand = options.environment === "production" ? "vercel --prod" : "vercel";

    console.log(); // New line for vercel output
    exec(deployCommand);

    spinner.succeed(
      `Deployed to ${chalk.white(options.environment === "production" ? "Production" : "Preview")}`
    );

    console.log(chalk.green("\n✅ Deployment completed successfully!"));

    if (options.environment === "production") {
      console.log(chalk.cyan("\n📦 Production Deployment"));
      console.log(chalk.white("  Your site is now live!"));
    } else {
      console.log(chalk.cyan("\n🔍 Preview Deployment"));
      console.log(chalk.white("  Check the preview URL above"));
    }

    console.log(chalk.cyan("\n📊 View deployment:"));
    console.log(chalk.white("  vercel ls"));
    console.log(chalk.white("  vercel inspect <deployment-url>"));
  } catch (error) {
    spinner.fail("Deployment failed");
    console.error(chalk.red(error));
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options: DeployOptions = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--production":
      case "--prod":
        options.environment = "production";

        break;

      case "--preview":
        options.environment = "preview";

        break;

      case "--skip-build":
        options.skipBuild = true;

        break;

      case "--project":
        options.projectName = args[++i];

        break;

      // No default
    }
  }

  deployToVercel(options).catch(console.error);
}

export { deployToVercel };
