/**
 * 🌱 Optimized Data Loader - Universal JSON Loader with Validation
 * ═══════════════════════════════════════════════════════════════════════════
 * Dynamically loads data from multiple JSON files with Zod validation
 */

import { logger } from "@/database/seed/logger";
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

// ═══════════════════════════════════════════════════════════════════════════
// UNIVERSAL DATA LOADER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Load JSON file from project root
 * @param filePath
 */
async function loadJsonFile<T = unknown>(filePath: string): Promise<T> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as T;
  } catch (error) {
    logger.error(`Failed to load ${filePath}: ${error}`);
    throw error;
  }
}

/**
 * Find files matching pattern(s)
 * @param patterns
 */
async function findFiles(patterns: string | string[]): Promise<string[]> {
  const patternArray = Array.isArray(patterns) ? patterns : [patterns];
  const files: string[] = [];

  for (const pattern of patternArray) {
    const matches = await glob(pattern, {
      cwd: process.cwd(),
      absolute: true,
    });
    files.push(...matches);
  }

  return [...new Set(files)]; // Remove duplicates
}

// ═══════════════════════════════════════════════════════════════════════════
// LOAD USERS
// ═══════════════════════════════════════════════════════════════════════════

export async function loadUsers(
  patterns: string | string[] = "users.json"
): Promise<ValidationResult<UserSeedData>> {
  logger.debug("Loading user data...");
  const files = await findFiles(patterns);

  if (files.length === 0) {
    logger.warn("No user files found");
    return { data: [], valid: 0, invalid: 0, errors: [] };
  }

  const allData: unknown[] = [];

  for (const file of files) {
    try {
      const data = await loadJsonFile<unknown[]>(file);
      if (Array.isArray(data)) {
        allData.push(...data);
      } else if (data && typeof data === "object") {
        allData.push(data);
      }
      logger.debug(
        `Loaded users from ${path.basename(file)}: ${Array.isArray(data) ? (data as any[]).length : 1}`
      );
    } catch (error) {
      logger.warn(`Skipped ${file}: ${error}`);
    }
  }

  if (allData.length === 0) {
    return { data: [], valid: 0, invalid: 0, errors: [] };
  }

  return validateArray(allData, userSeedSchema);
}

// ═══════════════════════════════════════════════════════════════════════════
// LOAD COMICS
// ═══════════════════════════════════════════════════════════════════════════

export async function loadComics(
  patterns: string | string[] = ["comics.json", "comicsdata*.json"]
): Promise<ValidationResult<ComicSeedData>> {
  logger.debug("Loading comic data...");
  const files = await findFiles(patterns);

  if (files.length === 0) {
    logger.warn("No comic files found");
    return { data: [], valid: 0, invalid: 0, errors: [] };
  }

  const allData: unknown[] = [];

  for (const file of files) {
    try {
      const data = await loadJsonFile<unknown[]>(file);
      if (Array.isArray(data)) {
        allData.push(...data);
      } else if (data && typeof data === "object") {
        allData.push(data);
      }
      logger.debug(
        `Loaded comics from ${path.basename(file)}: ${Array.isArray(data) ? (data as any[]).length : 1}`
      );
    } catch (error) {
      logger.warn(`Skipped ${file}: ${error}`);
    }
  }

  if (allData.length === 0) {
    return { data: [], valid: 0, invalid: 0, errors: [] };
  }

  return validateArray(allData, comicSeedSchema);
}

// ═══════════════════════════════════════════════════════════════════════════
// LOAD CHAPTERS
// ═══════════════════════════════════════════════════════════════════════════

export async function loadChapters(
  patterns: string | string[] = ["chapters.json", "chaptersdata*.json"]
): Promise<ValidationResult<ChapterSeedData>> {
  logger.debug("Loading chapter data...");
  const files = await findFiles(patterns);

  if (files.length === 0) {
    logger.warn("No chapter files found");
    return { data: [], valid: 0, invalid: 0, errors: [] };
  }

  const allData: unknown[] = [];

  for (const file of files) {
    try {
      const data = await loadJsonFile<unknown[]>(file);
      if (Array.isArray(data)) {
        allData.push(...data);
      } else if (data && typeof data === "object") {
        allData.push(data);
      }
      logger.debug(
        `Loaded chapters from ${path.basename(file)}: ${Array.isArray(data) ? (data as any[]).length : 1}`
      );
    } catch (error) {
      logger.warn(`Skipped ${file}: ${error}`);
    }
  }

  if (allData.length === 0) {
    return { data: [], valid: 0, invalid: 0, errors: [] };
  }

  return validateArray(allData, chapterSeedSchema);
}

// ═══════════════════════════════════════════════════════════════════════════
// LOAD ALL DATA
// ═══════════════════════════════════════════════════════════════════════════

export async function loadAllSeedData() {
  logger.info("Loading all seed data...");

  const [users, comics, chapters] = await Promise.all([loadUsers(), loadComics(), loadChapters()]);

  return {
    users,
    comics,
    chapters,
  };
}
