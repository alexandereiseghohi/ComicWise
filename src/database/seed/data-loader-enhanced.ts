/**
 * Unified Seed Data Loader
 * Handles loading and validating all seed data from JSON files
 * Supports dynamic file patterns and comprehensive validation
 */

import { logger } from "@/database/seed/logger";
import type { ChapterSeedData, ComicSeedData, UserSeedData } from "@/database/seed/schemas";
import { chapterSeedSchema, comicSeedSchema, userSeedSchema } from "@/database/seed/schemas";
import fs from "fs/promises";
import { glob } from "glob";
import type { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface LoadResult<T> {
  data: T[];
  valid: number;
  invalid: number;
  errors: Array<{ file: string; error: string }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// UNIVERSAL DATA LOADER (DRY PRINCIPLE)
// ═══════════════════════════════════════════════════════════════════════════

async function loadFromJsonFiles<T>(
  pattern: string | string[],
  schema: z.ZodType<T>,
  context: string
): Promise<LoadResult<T>> {
  const result: LoadResult<T> = {
    data: [],
    valid: 0,
    invalid: 0,
    errors: [],
  };

  try {
    // Resolve glob patterns
    const patterns = Array.isArray(pattern) ? pattern : [pattern];
    const files = new Set<string>();

    for (const p of patterns) {
      const matches = await glob(p, { cwd: process.cwd() });
      matches.forEach((f) => files.add(f));
    }

    logger.debug(`Found ${files.size} files for ${context}`);

    // Load and validate each file
    for (const file of files) {
      try {
        const content = await fs.readFile(file, "utf-8");
        const parsed = JSON.parse(content);
        const items = Array.isArray(parsed) ? parsed : [parsed];

        for (const item of items) {
          const validation = schema.safeParse(item);
          if (validation.success) {
            result.data.push(validation.data);
            result.valid++;
          } else {
            result.invalid++;
            result.errors.push({
              file,
              error: validation.error.issues
                .map((e) => `${e.path.join(".")}: ${e.message}`)
                .join("; "),
            });
          }
        }
      } catch (error) {
        result.errors.push({
          file,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  } catch (error) {
    logger.error(`Failed to load data for ${context}: ${error}`);
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// SPECIALIZED LOADERS (USING UNIVERSAL LOADER)
// ═══════════════════════════════════════════════════════════════════════════

export async function loadUsers(
  patterns: string[] = ["users.json"]
): Promise<LoadResult<UserSeedData>> {
  return loadFromJsonFiles(patterns, userSeedSchema, "users");
}

export async function loadComics(
  pattern: string | string[] = "comics*.json"
): Promise<LoadResult<ComicSeedData>> {
  return loadFromJsonFiles(pattern, comicSeedSchema, "comics");
}

export async function loadChapters(
  patterns: string[] = ["chapters*.json"]
): Promise<LoadResult<ChapterSeedData>> {
  return loadFromJsonFiles(patterns, chapterSeedSchema, "chapters");
}

// ═══════════════════════════════════════════════════════════════════════════
// BATCH LOADING (FOR ALL DATA AT ONCE)
// ═══════════════════════════════════════════════════════════════════════════

export async function loadAllSeedData() {
  const startTime = Date.now();

  logger.section("Loading Seed Data");

  const [users, comics, chapters] = await Promise.all([loadUsers(), loadComics(), loadChapters()]);

  // Log results
  if (users.valid > 0) {
    logger.success(`✓ Loaded ${users.valid} users`);
  }
  if (users.invalid > 0) {
    logger.warn(`⚠ Skipped ${users.invalid} invalid users`);
  }

  if (comics.valid > 0) {
    logger.success(`✓ Loaded ${comics.valid} comics`);
  }
  if (comics.invalid > 0) {
    logger.warn(`⚠ Skipped ${comics.invalid} invalid comics`);
  }

  if (chapters.valid > 0) {
    logger.success(`✓ Loaded ${chapters.valid} chapters`);
  }
  if (chapters.invalid > 0) {
    logger.warn(`⚠ Skipped ${chapters.invalid} invalid chapters`);
  }

  // Log errors if any
  const allErrors = [...users.errors, ...comics.errors, ...chapters.errors];
  if (allErrors.length > 0) {
    logger.warn(`Total validation errors: ${allErrors.length}`);
    allErrors.forEach((err) => {
      logger.debug(`${err.file}: ${err.error}`);
    });
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  logger.debug(`Data loading completed in ${elapsed}s`);

  return { users, comics, chapters };
}
