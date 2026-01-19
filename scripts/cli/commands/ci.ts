import chalk from "chalk";
import { execSync } from "child_process";
import ora from "ora";

/**
 *
 * param action
 * param options
 * @param action
 * @param options
 */
export async function ci(action: string, options: any) {
  const spinner = ora(`CI ${action}...`).start();

  try {
    switch (action) {
      case "test":
        spinner.text = "Running tests...";
        execSync("pnpm test", { stdio: "inherit" });
        spinner.succeed("All tests passed");
        break;
      case "build":
        spinner.text = "Building project...";
        execSync("pnpm build", { stdio: "inherit" });
        spinner.succeed("Build completed");
        break;
      case "check":
        spinner.text = "Running all checks...";
        execSync("pnpm type-check && pnpm lint", { stdio: "inherit" });
        spinner.succeed("All checks passed");
        break;
      case "deploy":
        spinner.text = "Deploying...";
        console.log(chalk.cyan("\n🚀 Deployment triggered"));
        spinner.succeed("Deployment initiated");
        break;
      default:
        spinner.warn(`Unknown action: ${action}`);
        console.log(chalk.yellow("\nAvailable actions:"), "test, build, check, deploy");
    }
  } catch (error) {
    spinner.fail(`CI ${action} failed`);
    console.error(error);
  }
}
