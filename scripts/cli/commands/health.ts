import chalk from "chalk";
import fs from "fs";

/**
 *
 * param options
 * @param options
 */
export async function health<T>(options: T) {
  console.log(chalk.bold("\n🏥 System Health Check\n"));

  const checks = [
    {
      name: "TypeScript Config",
      check: () => fs.existsSync("tsconfig.json"),
      status: true,
    },
    {
      name: "Environment Variables",
      check: () => fs.existsSync(".env.local"),
      status: true,
    },
    {
      name: "Node Modules",
      check: () => fs.existsSync("node_modules"),
      status: true,
    },
    {
      name: "Database Config",
      check: () => fs.existsSync("drizzle.config.ts"),
      status: true,
    },
    {
      name: "Next.js Config",
      check: () => fs.existsSync("next.config.ts"),
      status: true,
    },
  ];

  for (const check of checks) {
    const result = check.check();
    const status = result ? chalk.green("✓") : chalk.red("✗");
    console.log(`${status} ${check.name}`);

    if ((options as any).verbose && result) {
      console.log(chalk.gray(`  → OK`));
    }
  }

  console.log(chalk.green("\n✅ Health check complete\n"));
}
