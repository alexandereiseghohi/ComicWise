/**
 * 🌱 Optimized User Seeder
 * ═══════════════════════════════════════════════════════════════════════════
 * Handles user creation with avatar image management
 */

import { db } from "@/database/db";
import { user } from "@/database/schema";
import { loadUsers } from "@/database/seed/dataLoaderOptimized";
import { downloadImage } from "@/database/seed/imageHandlerOptimized";
import { logger } from "@/database/seed/logger";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface SeedOptions {
  dryRun?: boolean;
  verbose?: boolean;
}

interface SeedStats {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
  emailVerified?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface LoadResult {
  data: UserData[];
  valid: number;
  invalid: number;
  errors: Array<{ index: number; error: string }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEED USERS
// ═══════════════════════════════════════════════════════════════════════════

export async function seedUsers(options: SeedOptions = {}): Promise<SeedStats> {
  const startTime = Date.now();
  const stats: SeedStats = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    logger.debug("Loading user data from files...");
    const loadResult = (await loadUsers("users.json")) as LoadResult | null;

    if (!loadResult || !Array.isArray(loadResult.data)) {
      logger.warn("Invalid load result for users");
      return stats;
    }

    logger.debug(`Loaded ${loadResult.valid} valid users, ${loadResult.invalid} invalid`);

    if (loadResult.invalid > 0) {
      logger.warn(`⚠ User validation errors: ${loadResult.invalid}`);
      loadResult.errors.forEach((error) => {
        logger.debug(`  Row ${error.index}: ${error.error}`);
      });
    }

    if (loadResult.data.length === 0) {
      logger.warn("No valid users found");
      return stats;
    }

    logger.info(`Processing ${loadResult.data.length} users...`);

    // Process each user
    for (const userData of loadResult.data) {
      try {
        const result = await upsertUser(userData, options);
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

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.debug(
      `User seeding complete: ${stats.created} created, ${stats.updated} updated (${elapsed}s)`
    );

    if (stats.errors > 0) {
      logger.warn(`⚠ User seeding had ${stats.errors} errors`);
    }
  } catch (error) {
    logger.error(`Fatal error in user seeding: ${error}`);
    stats.errors++;
  }

  return stats;
}

// ═══════════════════════════════════════════════════════════════════════════
// UPSERT USER
// ═══════════════════════════════════════════════════════════════════════════

// eslint-disable-next-line sonarjs/cognitive-complexity
async function upsertUser(
  data: UserData,
  options: SeedOptions
): Promise<{ created: boolean; updated: boolean }> {
  try {
    // Check if user exists
    const existing = await db.query.user.findFirst({
      where: eq(user.email, data.email),
    });

    // Download avatar if provided
    let avatarUrl: string | null = null;
    if (data.image) {
      const imageResult = await downloadImage(data.image, "user");
      // downloadImage returns the local path directly as a string
      if (imageResult) {
        avatarUrl = imageResult;
      }
    }

    if (existing) {
      // Update existing user
      if (!options.dryRun) {
        await db
          .update(user)
          .set({
            name: data.name,
            image: avatarUrl ?? existing.image,
            role: (data.role as "user" | "admin" | "moderator" | undefined) ?? "user",
            emailVerified: data.emailVerified
              ? new Date(data.emailVerified)
              : existing.emailVerified,
            updatedAt: new Date(),
          })
          .where(eq(user.id, existing.id));
      }

      if (options.verbose) {
        logger.debug(`Updated user: ${data.email}`);
      }
      return { created: false, updated: true };
    } else {
      // Create new user
      if (!options.dryRun) {
        const hashedPassword = await bcrypt.hash(data.email, 12);

        await db.insert(user).values({
          id: data.id,
          name: data.name,
          email: data.email,
          image: avatarUrl,
          password: hashedPassword,
          role: (data.role as "user" | "admin" | "moderator" | undefined) ?? "user",
          emailVerified: data.emailVerified ? new Date(data.emailVerified) : null,
          status: true,
          createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
        });
      }

      if (options.verbose) {
        logger.debug(`Created user: ${data.email}`);
      }
      return { created: true, updated: false };
    }
  } catch (error) {
    logger.error(`Failed to upsert user: ${error}`);
    return { created: false, updated: false };
  }
}
