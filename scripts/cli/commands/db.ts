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
export async function db(action: string, options: any) {
  const spinner = ora(`Database ${action}...`).start();

  try {
    switch (action) {
      case "migrate":
        execSync("pnpm db:migrate", { stdio: "inherit" });
        spinner.succeed("Migrations completed");
        break;
      case "seed":
        execSync("pnpm db:seed", { stdio: "inherit" });
        spinner.succeed("Database seeded");
        break;
      case "reset":
        spinner.text = "Resetting database...";
        execSync("pnpm db:reset", { stdio: "inherit" });
        spinner.succeed("Database reset complete");
        break;
      case "studio":
        spinner.stop();
        console.log(chalk.cyan("Opening Drizzle Studio..."));
        execSync("pnpm db:studio", { stdio: "inherit" });
        break;
      default:
        spinner.warn(`Unknown action: ${action}`);
        console.log(chalk.yellow("\nAvailable actions:"), "migrate, seed, reset, studio");
    }
  } catch (error) {
    spinner.fail(`Failed to ${action} database`);
    console.error(error);
  }
}
