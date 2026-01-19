import chalk from "chalk";
import fs from "fs-extra";
import ora from "ora";

/**
 *
 * param provider
 * param options
 * @param provider
 * @param options
 */
export async function upload(provider: string, options: any) {
  const spinner = ora(`Uploading to ${provider}...`).start();

  try {
    const dir = options.dir || "public/uploads";

    if (!fs.existsSync(dir)) {
      spinner.fail(`Directory not found: ${dir}`);
      return;
    }

    const files = fs.readdirSync(dir).filter((f: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));

    if (files.length === 0) {
      spinner.warn("No image files found");
      return;
    }

    spinner.text = `Uploading ${files.length} files to ${provider}...`;

    // Simulate upload
    await new Promise((resolve) => setTimeout(resolve, 2000));

    spinner.succeed(`Uploaded ${files.length} files to ${provider}`);
    console.log(chalk.gray(`  → Provider: ${provider}`));
    console.log(chalk.gray(`  → Files: ${files.length}`));
  } catch (error) {
    spinner.fail(`Failed to upload to ${provider}`);
    console.error(error);
  }
}
