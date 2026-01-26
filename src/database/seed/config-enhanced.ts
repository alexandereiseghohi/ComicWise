/**
 * Enhanced Seed Configuration
 */

export interface SeedConfig {
  enabled: {
    users: boolean;
    comics: boolean;
    chapters: boolean;
    all: boolean;
  };
  mode: "seed" | "clear" | "reset";
  options: {
    batchSize: number;
    imageDownloadConcurrency: number;
    skipImageDownload: boolean;
    verbose: boolean;
    dryRun: boolean;
    skipValidation: boolean;
    forceOverwrite: boolean;
  };
}

const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_IMAGE_CONCURRENCY = 5;

export function parseCLIArgs(args: string[]): SeedConfig {
  const config: SeedConfig = {
    enabled: {
      users: false,
      comics: false,
      chapters: false,
      all: false,
    },
    mode: "seed",
    options: {
      batchSize: DEFAULT_BATCH_SIZE,
      imageDownloadConcurrency: DEFAULT_IMAGE_CONCURRENCY,
      skipImageDownload: false,
      verbose: false,
      dryRun: false,
      skipValidation: false,
      forceOverwrite: false,
    },
  };

  args.forEach((argument) => {
    if (argument === "--users") config.enabled.users = true;
    if (argument === "--comics") config.enabled.comics = true;
    if (argument === "--chapters") config.enabled.chapters = true;
    if (argument === "--all") config.enabled.all = true;
    if (argument === "--verbose" || argument === "-v") config.options.verbose = true;
    if (argument === "--dry-run") config.options.dryRun = true;
    if (argument === "--skip-validation") config.options.skipValidation = true;
    if (argument === "--skip-images") config.options.skipImageDownload = true;
    if (argument === "--force" || argument === "-f") config.options.forceOverwrite = true;
    if (argument === "--clear") config.mode = "clear";
    if (argument === "--reset") config.mode = "reset";
    if (argument.startsWith("--batch-size=")) {
      config.options.batchSize =
        Number.parseInt(argument.split("=")[1] ?? "", 10) || DEFAULT_BATCH_SIZE;
    }
  });

  if (
    !config.enabled.users &&
    !config.enabled.comics &&
    !config.enabled.chapters &&
    !config.enabled.all
  ) {
    config.enabled.all = true;
  }

  return config;
}
