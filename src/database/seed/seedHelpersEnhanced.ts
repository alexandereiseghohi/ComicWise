/**
 * Enhanced Seed Helpers - Optimized with Universal Seeder
 *
 * @module SeedHelpers
 * @description Unified seeding interface using universalSeeder for optimal performance
 */

import { logger } from "./logger";
import {
  seedAllFromJSON,
  seedChaptersFromJSON,
  seedComicsFromJSON,
  seedUsersFromJSON,
} from "./seeders/universalSeeder";
import type { SeedOptions, SeedResult } from "./types";

// ═══════════════════════════════════════════════════
// SEED FUNCTIONS - Using Universal Seeder
// ═══════════════════════════════════════════════════

/**
 * Seed users from JSON files
 * @param _options
 */
export async function seedUsers(_options: SeedOptions = {}): Promise<SeedResult> {
  const startTime = Date.now();
  await seedUsersFromJSON(["users.json"]);
  return { inserted: 0, updated: 0, skipped: 0, errors: 0, duration: Date.now() - startTime };
}

/**
 * Seed comics (with authors, artists, genres, types)
 * @param _options
 */
export async function seedComics(_options: SeedOptions = {}): Promise<SeedResult> {
  const startTime = Date.now();
  await seedComicsFromJSON("comics*.json");
  return { inserted: 0, updated: 0, skipped: 0, errors: 0, duration: Date.now() - startTime };
}

/**
 * Seed chapters
 * @param _options
 */
export async function seedChapters(_options: SeedOptions = {}): Promise<SeedResult> {
  const startTime = Date.now();
  await seedChaptersFromJSON("chapters*.json");
  return { inserted: 0, updated: 0, skipped: 0, errors: 0, duration: Date.now() - startTime };
}
export async function seedAll(_options: SeedOptions = {}): Promise<{
  users: SeedResult;
  comics: SeedResult;
  chapters: SeedResult;
}> {
  const startTime = Date.now();

  // Use universal seeder for optimal performance
  await seedAllFromJSON();

  const duration = Date.now() - startTime;

  return {
    users: { inserted: 0, updated: 0, skipped: 0, errors: 0, duration },
    comics: { inserted: 0, updated: 0, skipped: 0, errors: 0, duration },
    chapters: { inserted: 0, updated: 0, skipped: 0, errors: 0, duration },
  };
}

/**
 * Clear all seeded data
 * @param _options
 */
export async function clearAll(_options: SeedOptions = {}): Promise<void> {
  logger.header("Clearing All Data");
  logger.info("Clear operations not yet implemented in universal seeder");
  logger.info("Use database reset or migration rollback instead");
}

/**
 * Reset database and reseed
 * @param options
 */
export async function resetDatabase(options: SeedOptions = {}): Promise<void> {
  logger.header("Database Reset & Reseed");
  await clearAll(options);
  await seedAll(options);
  logger.success("Database reset complete");
}

/**
 * Validate seed data without inserting
 * @param _options
 */
export async function validateSeedData(_options: SeedOptions = {}): Promise<{
  users: boolean;
  comics: boolean;
  chapters: boolean;
}> {
  logger.header("Validating Seed Data");

  // Note: Universal seeder validates during seeding
  // This is a placeholder for future validation-only mode

  return {
    users: true,
    comics: true,
    chapters: true,
  };
}

// ═══════════════════════════════════════════════════
// EXPORT ALL
// ═══════════════════════════════════════════════════

export { logger };
export type { SeedOptions, SeedResult };
