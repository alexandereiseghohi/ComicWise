/**
 * Enhanced User Seeder
 * Handles user creation and updates with image management
 * Implements upsert logic with comprehensive error handling
 */

import { db } from "@/database/db";
import { user } from "@/database/schema";
import { loadUsers } from "@/database/seed/data-loader-enhanced";
import { getImageManager } from "@/database/seed/image-manager";
import { logger } from "@/database/seed/logger";
import type { UserSeedData } from "@/database/seed/schemas";
import bcryptjs from "bcryptjs";
import { eq } from "drizzle-orm";

// ═══════════════════════════════════════════════════════════════════════════
// USER SEEDER
// ═══════════════════════════════════════════════════════════════════════════

interface SeedStats {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

/**
 * Seed users from JSON files
 * Handles both creation and updates with proper upsert logic
 * @param patterns
 */
export async function seedUsersFromFiles(patterns: string[] = ["users.json"]): Promise<SeedStats> {
  const startTime = Date.now();
  const stats: SeedStats = {
    total: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    logger.info("Loading user data from files...");
    const loadResult = await loadUsers(patterns);
    stats.total = loadResult.valid;

    if (stats.total === 0) {
      logger.warn("No valid users found in data files");
      return stats;
    }

    logger.info(`Processing ${stats.total} users...`);

    // Get image manager for user avatars
    const imageManager = await getImageManager();

    // Process each user
    for (const userData of loadResult.data) {
      try {
        const result = await upsertUser(userData, imageManager);
        if (result.created) {
          stats.created++;
        } else if (result.updated) {
          stats.updated++;
        } else {
          stats.skipped++;
        }
      } catch (error) {
        stats.errors++;
        logger.error(`Error processing user ${userData.email}: ${error}`);
      }
    }

    // Log summary
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.success(
      `User seeding complete: ${stats.created} created, ${stats.updated} updated, ${stats.skipped} skipped (${elapsed}s)`
    );

    if (stats.errors > 0) {
      logger.warn(`User seeding had ${stats.errors} errors`);
    }
  } catch (error) {
    logger.error(`Fatal error in user seeding: ${error}`);
  }

  return stats;
}

/**
 * Upsert user - create or update based on email
 * @param data
 * @param imageManager
 */
async function upsertUser(
  data: UserSeedData,
  imageManager: Awaited<ReturnType<typeof getImageManager>>
): Promise<{ created: boolean; updated: boolean }> {
  // Check if user exists
  const existing = await db.query.user.findFirst({
    where: eq(user.email, data.email),
  });

  let imageUrl = data.image;

  // Download image if provided
  if (imageUrl) {
    try {
      const result = await imageManager.downloadImage(imageUrl);
      if (result.success && result.local) {
        imageUrl = result.local;
      }
    } catch (error) {
      logger.warn(`Failed to download user image: ${error}`);
    }
  }

  if (existing) {
    // Update existing user
    await db
      .update(user)
      .set({
        name: data.name,
        image: imageUrl,
        role: data.role,
        emailVerified: data.emailVerified,
        updatedAt: new Date(),
      })
      .where(eq(user.id, existing.id));

    logger.debug(`Updated user: ${data.email}`);
    return { created: false, updated: true };
  } else {
    // Create new user with generated password hash
    const passwordHash = await bcryptjs.hash(data.email, 10);

    await db.insert(user).values({
      id: data.id,
      name: data.name,
      email: data.email,
      password: passwordHash,
      image: imageUrl,
      role: data.role,
      emailVerified: data.emailVerified,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
    });

    logger.debug(`Created user: ${data.email}`);
    return { created: true, updated: false };
  }
}

/**
 * Clear all users (for testing)
 */
export async function clearUsers(): Promise<void> {
  try {
    logger.info("Clearing all users...");
    await db.delete(user);
    logger.success("All users cleared");
  } catch (error) {
    logger.error(`Failed to clear users: ${error}`);
  }
}
