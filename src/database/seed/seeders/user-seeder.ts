/**
 * Enhanced User Seeder
 *
 * Simplified user seeding with:
 * - Schema validation
 * - Zod-based parsing
 * - Error handling and logging
 * - Uses UserDal for consistency
 */

import { userDal } from "@/dal/user-dal";
import { db } from "@/database/db";
import { user } from "@/database/schema";
import { logger } from "@/database/seed/logger";
import {
  deduplicateByField,
  logProgress,
  validateData,
} from "@/database/seed/utils/seeder-helpers";
import type { InsertUser, UserSeedData } from "@/lib/validations/user-schema";
import { UserSeedSchema } from "@/lib/validations/user-schema";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";
import { extractImageUrls, imageCacheManager } from "../utils/image-seeder-helper";

/**
 * Seed users from JSON files
 * Uses UserDal for database operations
 * @param jsonFiles
 */
export async function seedUsersFromFiles(jsonFiles: string[] = ["users.json"]): Promise<{
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}> {
  logger.info("🌱 Starting user seeding...");

  let totalProcessed = 0;
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const jsonFile of jsonFiles) {
    try {
      const filePath = path.join(process.cwd(), jsonFile);
      const fileContent = await fs.readFile(filePath, "utf-8");
      const rawData = JSON.parse(fileContent);
      const usersData = Array.isArray(rawData) ? rawData : [rawData];

      logger.info(`Processing ${usersData.length} users from ${jsonFile}`);

      // Deduplicate by email
      const dedupedUsers = deduplicateByField(usersData, "email");
      const removed = usersData.length - dedupedUsers.length;
      if (removed > 0) {
        logger.info(`Removed ${removed} duplicate users (by email)`);
      }

      for (const userData of dedupedUsers) {
        try {
          // Validate user data
          const validation = await validateData(
            userData,
            UserSeedSchema,
            `user: ${userData.email}`
          );

          if (!validation.valid) {
            totalErrors++;
            totalSkipped++;
            continue;
          }

          const validatedUser = validation.data;

          // Extract and cache user images
          const imageUrls = extractImageUrls({ image: validatedUser.image });
          const cachedImages = await imageCacheManager.getOrDownloadImages(
            imageUrls,
            `user: ${validatedUser.email}`
          );
          const cachedImage = [...cachedImages.values()][0] ?? validatedUser.image;

          // Check if user exists by email
          const existingUser = await db.query.user.findFirst({
            where: eq(user.email, validatedUser.email),
          });

          if (existingUser) {
            // Update existing user (skip password on update for security)
            await userDal.update(existingUser.id, {
              name: validatedUser.name,
              image: cachedImage ?? null,
              role: validatedUser.role,
              emailVerified: validatedUser.emailVerified,
            } as InsertUser);
            totalUpdated++;
            logger.debug(`Updated user: ${validatedUser.email}`);
          } else {
            // Create new user
            await userDal.create({
              email: validatedUser.email,
              name: validatedUser.name,
              password: validatedUser.password,
              image: cachedImage ?? null,
              role: validatedUser.role,
            } as InsertUser);
            totalCreated++;
            logger.debug(`Created user: ${validatedUser.email}`);
          }

          totalProcessed++;

          // Log progress every 100 items
          if (totalProcessed % 100 === 0) {
            logProgress(
              "Users",
              {
                processed: totalProcessed,
                created: totalCreated,
                updated: totalUpdated,
                skipped: totalSkipped,
                errors: totalErrors,
              },
              dedupedUsers.length
            );
          }
        } catch (error) {
          totalErrors++;
          logger.error(
            `Error processing user ${userData.email}: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }

      logger.success(
        `Completed ${jsonFile}: ${totalCreated} created, ${totalUpdated} updated, ${totalSkipped} skipped`
      );
    } catch (error) {
      logger.error(
        `Failed to seed from ${jsonFile}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      totalErrors++;
    }
  }

  const result = {
    total: totalProcessed,
    created: totalCreated,
    updated: totalUpdated,
    skipped: totalSkipped,
    errors: totalErrors,
  };
  logger.success(`User seeding complete: ${JSON.stringify(result)}`);
  imageCacheManager.logStats();
  return result;
}

/**
 * Seed a single user (useful for manual operations)
 * @param userData
 */
export async function seedSingleUser(userData: Partial<UserSeedData>): Promise<boolean> {
  try {
    const validation = await validateData(
      userData,
      UserSeedSchema,
      `single user: ${userData.email}`
    );

    if (!validation.valid) {
      return false;
    }

    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, validation.data.email),
    });

    if (!existingUser) {
      await userDal.create(validation.data as InsertUser);
      logger.success(`Created single user: ${validation.data.email}`);
    } else {
      logger.info(`User already exists: ${validation.data.email}`);
    }

    return true;
  } catch (error) {
    logger.error(
      `Failed to seed single user: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    return false;
  }
}
