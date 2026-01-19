/**
 * Enhanced Dynamic Data Loader
 *
 * @module DataLoader
 * @description Loads and processes JSON data files with validation and transformation
 */

import * as fs from "fs/promises";
import { glob } from "glob";
import type { z } from "zod";
import { logger } from "./logger";

// ═══════════════════════════════════════════════════
// DATA LOADER CLASS
// ═══════════════════════════════════════════════════

export class DataLoader<T = unknown> {
  constructor(
    private readonly entity: string,
    private readonly schema?: z.ZodType<T>
  ) {}

  /**
   * Load data from single or multiple JSON files
   * @param sources
   */
  async load(sources: string | string[]): Promise<T[]> {
    const sourcesArray = Array.isArray(sources) ? sources : [sources];
    const allData: T[] = [];

    for (const source of sourcesArray) {
      try {
        // Support glob patterns
        const files = await this.resolveFiles(source);

        for (const file of files) {
          const data = await this.loadFile(file);
          allData.push(...data);
        }
      } catch (error) {
        logger.warn(`Failed to load ${source}: ${error}`);
        // Continue with other sources
      }
    }

    logger.info(`Loaded ${allData.length} ${this.entity} records`);
    return allData;
  }

  /**
   * Resolve file paths (supports glob patterns)
   * @param pattern
   */
  private async resolveFiles(pattern: string): Promise<string[]> {
    // If it's a direct file path and exists, return it
    try {
      const stats = await fs.stat(pattern);
      if (stats.isFile()) {
        return [pattern];
      }
    } catch {
      // Not a direct file, try glob
    }

    // Use glob to find matching files
    const files = await glob(pattern, {
      cwd: process.cwd(),
      absolute: true,
      nodir: true,
    });

    return files;
  }

  /**
   * Load and parse a single JSON file
   * @param filePath
   */
  private async loadFile(filePath: string): Promise<T[]> {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      const data = JSON.parse(content);

      // Handle both array and single object
      const dataArray = Array.isArray(data) ? data : [data];

      // Validate if schema provided
      if (this.schema) {
        return this.validate(dataArray);
      }

      return dataArray as T[];
    } catch (error) {
      logger.error(`Failed to load file ${filePath}: ${error}`);
      throw error;
    }
  }

  /**
   * Validate data against Zod schema
   * @param data
   */
  private validate(data: unknown[]): T[] {
    if (!this.schema) {
      return data as T[];
    }

    const validated: T[] = [];
    const errors: Array<{ index: number; error: string }> = [];

    data.forEach((item, index) => {
      try {
        const result = this.schema?.parse(item) ?? item;
        validated.push(result as T);
      } catch (error) {
        errors.push({
          index,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    if (errors.length > 0) {
      logger.warn(`Validation errors in ${this.entity}:`);
      errors.slice(0, 5).forEach((err) => {
        logger.warn(`  Record ${err.index}: ${err.error}`);
      });
      if (errors.length > 5) {
        logger.warn(`  ... and ${errors.length - 5} more errors`);
      }
    }

    return validated;
  }

  /**
   * Load data from multiple sources with fallback
   * @param entity
   * @param sources
   * @param schema
   */
  static async loadWithFallback<T>(
    entity: string,
    sources: string[],
    schema?: z.ZodType<T>
  ): Promise<T[]> {
    const loader = new DataLoader<T>(entity, schema);
    return loader.load(sources);
  }

  /**
   * Check if any source files exist
   * @param sources
   */
  static async hasData(sources: string[]): Promise<boolean> {
    for (const source of sources) {
      try {
        const files = await glob(source, { cwd: process.cwd() });
        if (files.length > 0) {
          return true;
        }
      } catch {
        continue;
      }
    }
    return false;
  }
}

// ═══════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════

/**
 * Load JSON data from files
 * @param sources
 * @param schema
 */
export async function loadJsonData<T = unknown>(
  sources: string | string[],
  schema?: z.ZodType<T>
): Promise<T[]> {
  const sourcesArray = Array.isArray(sources) ? sources : [sources];
  const loader = new DataLoader<T>("data", schema);
  return loader.load(sourcesArray);
}

/**
 * Check if data files exist
 * @param sources
 */
export async function dataExists(sources: string | string[]): Promise<boolean> {
  const sourcesArray = Array.isArray(sources) ? sources : [sources];
  return DataLoader.hasData(sourcesArray);
}

/**
 * Get all matching files for a pattern
 * @param pattern
 */
export async function getDataFiles(pattern: string): Promise<string[]> {
  return glob(pattern, {
    cwd: process.cwd(),
    absolute: true,
    nodir: true,
  });
}

// ═══════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════

export { logger };
