/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Data Validator - Validate and Clean JSON Data Before Seeding
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { logger } from "@/database/seed/logger";
import type { z } from "zod";
import { ChapterSeedSchema, ComicSeedSchema, UserSeedSchema } from "./validationSchemas";

export interface ValidationResult<T> {
  valid: T[];
  invalid: Array<{ data: unknown; error: string }>;
  stats: {
    total: number;
    valid: number;
    invalid: number;
  };
}

export async function validateUsers(
  data: unknown[]
): Promise<ValidationResult<z.infer<typeof UserSeedSchema>>> {
  const valid: z.infer<typeof UserSeedSchema>[] = [];
  const invalid: Array<{ data: unknown; error: string }> = [];

  for (const item of data) {
    try {
      const validated = UserSeedSchema.parse(item);
      valid.push(validated);
    } catch (error) {
      invalid.push({
        data: item,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const stats = {
    total: data.length,
    valid: valid.length,
    invalid: invalid.length,
  };

  logger.info(`User validation: ${stats.valid}/${stats.total} valid`);
  return { valid, invalid, stats };
}

export async function validateComics(
  data: unknown[]
): Promise<ValidationResult<z.infer<typeof ComicSeedSchema>>> {
  const valid: z.infer<typeof ComicSeedSchema>[] = [];
  const invalid: Array<{ data: unknown; error: string }> = [];

  for (const item of data) {
    try {
      const validated = ComicSeedSchema.parse(item);
      valid.push(validated);
    } catch (error) {
      invalid.push({
        data: item,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const stats = {
    total: data.length,
    valid: valid.length,
    invalid: invalid.length,
  };

  logger.info(`Comic validation: ${stats.valid}/${stats.total} valid`);
  return { valid, invalid, stats };
}

export async function validateChapters(
  data: unknown[]
): Promise<ValidationResult<z.infer<typeof ChapterSeedSchema>>> {
  const valid: z.infer<typeof ChapterSeedSchema>[] = [];
  const invalid: Array<{ data: unknown; error: string }> = [];

  for (const item of data) {
    try {
      const validated = ChapterSeedSchema.parse(item);
      valid.push(validated);
    } catch (error) {
      invalid.push({
        data: item,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const stats = {
    total: data.length,
    valid: valid.length,
    invalid: invalid.length,
  };

  logger.info(`Chapter validation: ${stats.valid}/${stats.total} valid`);
  return { valid, invalid, stats };
}
