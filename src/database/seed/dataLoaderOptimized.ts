/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UNIFIED DATA LOADER - Load and validate all seed data sources
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * DRY principle: Single loader for all data types
 * Supports dynamic source configuration
 * Provides detailed validation reporting
 */

import { logger } from "@/database/seed/LoggerOptimized";
import type {
  ChapterSeedData,
  ComicSeedData,
  UserSeedData,
  ValidationResult,
} from "@/database/seed/schemasOptimized";
import {
  chapterSeedSchema,
  comicSeedSchema,
  userSeedSchema,
  validateArray,
} from "@/database/seed/schemasOptimized";
import fs from "fs/promises";
import { glob } from "glob";
import path from "path";

// ─────────────────────────────────────────────────────────────────────────
// CONFIGURATION - Define data sources and their patterns
// ─────────────────────────────────────────────────────────────────────────

const DATA_SOURCES = {
  users: {
    patterns: ["users.json"],
    schema: userSeedSchema,
    type: "user" as const,
  },
  comics: {
    patterns: ["comics.json", "comicsdata*.json"],
    schema: comicSeedSchema,
    type: "comic" as const,
  },
  chapters: {
    patterns: ["chapters.json", "chaptersdata*.json"],
    schema: chapterSeedSchema,
    type: "chapter" as const,
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────

/**
 * Load JSON file with error handling
 * @param filePath
 */
async function loadJsonFile<T = unknown>(filePath: string): Promise<T | null> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch (error) {
    logger.warn(
      `Failed to load ${filePath}: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}

/**
 * Find files matching patterns from project root
 * @param patterns
 */
async function findFiles(patterns: string[]): Promise<string[]> {
  const files: string[] = [];

  for (const pattern of patterns) {
    try {
      const matches = await glob(pattern, {
        cwd: process.cwd(),
        absolute: true,
      });
      files.push(...matches);
    } catch (error) {
      logger.warn(
        `Pattern ${pattern} failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  return [...new Set(files)]; // Remove duplicates
}

/**
 * Consolidate multiple data arrays into one
 * @param dataSources
 */
function consolidateData(dataSources: unknown[][]): unknown[] {
  return dataSources.reduce((acc, array) => {
    if (Array.isArray(array)) acc.push(...array);
    return acc;
  }, [] as unknown[]);
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN DATA LOADERS - Type-safe loaders for each data type
// ─────────────────────────────────────────────────────────────────────────

/**
 * Load and validate users from JSON files
 */
export async function loadUsers(): Promise<ValidationResult<UserSeedData>> {
  const timer = logger.timing("Load users");

  try {
    logger.info("Loading user data from JSON sources");
    const { patterns, schema } = DATA_SOURCES.users;
    const files = await findFiles([...patterns]);

    if (files.length === 0) {
      logger.warn("No user files found");
      return { data: [], valid: 0, invalid: 0, errors: [] };
    }

    logger.debug(`Found ${files.length} user file(s)`, { files });

    const allData: unknown[] = [];
    for (const file of files) {
      const data = await loadJsonFile<unknown>(file);
      if (Array.isArray(data)) {
        allData.push(...data);
        logger.debug(`Loaded ${data.length} users from ${path.basename(file)}`);
      } else if (data) {
        allData.push(data);
      }
    }

    logger.metric("Total user records", allData.length);
    const result = validateArray(allData, schema);

    if (result.invalid > 0) {
      logger.warn(`User validation errors: ${result.invalid} invalid records`);
      if (result.errors.length > 0) {
        logger.debug(`First error: ${result.errors[0]!.error}`);
      }
    }

    logger.success(`Users loaded: ${result.valid} valid, ${result.invalid} invalid`, {
      component: "DataLoader",
      operation: "loadUsers",
    });
    timer();

    return result;
  } catch (error) {
    logger.error("Failed to load users", error as Error);
    return { data: [], valid: 0, invalid: 0, errors: [] };
  }
}

/**
 * Load and validate comics from JSON files
 */
export async function loadComics(): Promise<ValidationResult<ComicSeedData>> {
  const timer = logger.timing("Load comics");

  try {
    logger.info("Loading comic data from JSON sources");
    const { patterns, schema } = DATA_SOURCES.comics;
    const files = await findFiles([...patterns]);

    if (files.length === 0) {
      logger.warn("No comic files found");
      return { data: [], valid: 0, invalid: 0, errors: [] };
    }

    logger.debug(`Found ${files.length} comic file(s)`, { files });

    const allData: unknown[] = [];
    for (const file of files) {
      const data = await loadJsonFile<unknown>(file);
      if (Array.isArray(data)) {
        allData.push(...data);
        logger.debug(`Loaded ${data.length} comics from ${path.basename(file)}`);
      } else if (data) {
        allData.push(data);
      }
    }

    logger.metric("Total comic records", allData.length);
    const result = validateArray(allData, schema);

    if (result.invalid > 0) {
      logger.warn(`Comic validation errors: ${result.invalid} invalid records`);
    }

    logger.success(`Comics loaded: ${result.valid} valid, ${result.invalid} invalid`, {
      component: "DataLoader",
      operation: "loadComics",
    });
    timer();

    return result;
  } catch (error) {
    logger.error("Failed to load comics", error as Error);
    return { data: [], valid: 0, invalid: 0, errors: [] };
  }
}

/**
 * Load and validate chapters from JSON files
 */
export async function loadChapters(): Promise<ValidationResult<ChapterSeedData>> {
  const timer = logger.timing("Load chapters");

  try {
    logger.info("Loading chapter data from JSON sources");
    const { patterns, schema } = DATA_SOURCES.chapters;
    const files = await findFiles([...patterns]);

    if (files.length === 0) {
      logger.warn("No chapter files found");
      return { data: [], valid: 0, invalid: 0, errors: [] };
    }

    logger.debug(`Found ${files.length} chapter file(s)`, { files });

    const allData: unknown[] = [];
    for (const file of files) {
      const data = await loadJsonFile<unknown>(file);
      if (Array.isArray(data)) {
        allData.push(...data);
        logger.debug(`Loaded ${data.length} chapters from ${path.basename(file)}`);
      } else if (data) {
        allData.push(data);
      }
    }

    logger.metric("Total chapter records", allData.length);
    const result = validateArray(allData, schema);

    if (result.invalid > 0) {
      logger.warn(`Chapter validation errors: ${result.invalid} invalid records`);
    }

    logger.success(`Chapters loaded: ${result.valid} valid, ${result.invalid} invalid`, {
      component: "DataLoader",
      operation: "loadChapters",
    });
    timer();

    return result;
  } catch (error) {
    logger.error("Failed to load chapters", error as Error);
    return { data: [], valid: 0, invalid: 0, errors: [] };
  }
}

/**
 * Load all data at once
 */
export async function loadAllData() {
  logger.section("Loading All Seed Data");

  const [users, comics, chapters] = await Promise.all([loadUsers(), loadComics(), loadChapters()]);

  return { users, comics, chapters };
}
