/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Enhanced User Seeder V4 - JSON-based Dynamic Seeding
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Features:
 * ✅ Zod validation for all user data
 * ✅ onConflictDoUpdate for upsert operations
 * ✅ CUSTOM_PASSWORD environment variable with bcryptjs
 * ✅ Default fallback to /shadcn.jpg for user images
 * ✅ Comprehensive logging with operation tracking
 * ✅ Deduplication and error handling
 */

import { db } from "@/database/db";
import { user } from "@/database/schema";
import { hashPassword } from "@/database/seed/helpers/password-hasher";
import type { UserSeedData } from "@/database/seed/helpers/validation-schemas";
import { UserSeedSchema } from "@/database/seed/helpers/validation-schemas";
import { logger } from "@/database/seed/logger";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

export interface SeedResult {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

const FALLBACK_USER_IMAGE = "/shadcn.jpg";

/**
 * Load and validate users from JSON file
 * @param filePath
 */
async function loadUsersFromFile(filePath: string): Promise<UserSeedData[]> {
  try {
    logger.info(`📖 Loading users from: ${filePath}`);
    const fullPath = path.join(process.cwd(), filePath);
    const content = await fs.readFile(fullPath, "utf-8");
    const rawData = JSON.parse(content);
    const dataArray = Array.isArray(rawData) ? rawData : [rawData];

    const validUsers: UserSeedData[] = [];
    const errors: string[] = [];

    for (let i = 0; i < dataArray.length; i++) {
      try {
        const validated = UserSeedSchema.parse(dataArray[i]);
        validUsers.push(validated);
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error}`);
        logger.warn(`❌ Invalid user data at row ${i + 1}`);
      }
    }

    logger.info(`✅ Validated ${validUsers.length}/${dataArray.length} users from ${filePath}`);
    if (errors.length > 0) {
      logger.warn(`⚠️  ${errors.length} validation errors encountered`);
    }

    return validUsers;
  } catch (error) {
    logger.error(`💥 Failed to load ${filePath}: ${error}`);
    return [];
  }
}

/**
 * Seed a single user with onConflictDoUpdate behavior
 * @param userData
 * @param customPassword
 */
async function seedUser(
  userData: UserSeedData,
  customPassword: string
): Promise<"created" | "updated" | "error"> {
  try {
    // Hash password using CUSTOM_PASSWORD
    const hashedPassword = await hashPassword(customPassword);

    // Use fallback image for users
    const userImage =
      userData.image && userData.image.trim() !== "" ? userData.image : FALLBACK_USER_IMAGE;

    const userRecord = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      password: hashedPassword,
      role: userData.role || "user",
      image: userImage,
      emailVerified: userData.emailVerified || new Date(),
      createdAt: userData.createdAt || new Date(),
      updatedAt: new Date(),
    };

    // Check if user exists
    const existing = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, userData.email))
      .limit(1);

    if (existing.length > 0) {
      // Update existing user (onConflictDoUpdate behavior)
      await db
        .update(user)
        .set({
          name: userRecord.name,
          role: userRecord.role,
          image: userRecord.image,
          emailVerified: userRecord.emailVerified,
          updatedAt: userRecord.updatedAt,
        })
        .where(eq(user.email, userData.email));

      logger.debug(`🔄 Updated user: ${userData.email}`);
      return "updated";
    } else {
      // Create new user
      await db.insert(user).values(userRecord);
      logger.info(`✨ Created user: ${userData.email} (${userData.role})`);
      return "created";
    }
  } catch (error) {
    logger.error(`💥 Failed to seed user ${userData.email}: ${error}`);
    return "error";
  }
}

/**
 * Seed users from multiple JSON files
 * @param filePatterns
 * @param customPassword
 */
export async function seedUsersV4(
  filePatterns: string[],
  customPassword?: string
): Promise<SeedResult> {
  const result: SeedResult = {
    total: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: 0,
  };

  logger.info("═══════════════════════════════════════════════════════════");
  logger.info("🌱 Starting Enhanced User Seeding V4");
  logger.info("═══════════════════════════════════════════════════════════");

  const password = customPassword || process.env["CUSTOM_PASSWORD"] || "DefaultPassword123!";
  logger.info(`🔐 Using ${customPassword ? "provided" : "environment"} password for all users`);

  for (const pattern of filePatterns) {
    const users = await loadUsersFromFile(pattern);
    result.total += users.length;

    logger.info(`⚙️  Processing ${users.length} users from ${pattern}...`);

    for (let i = 0; i < users.length; i++) {
      const userData = users[i];
      if (!userData) {
        result.errors++;
        continue;
      }

      const action = await seedUser(userData, password);

      switch (action) {
        case "created":
          result.created++;
          break;

        case "updated":
          result.updated++;
          break;

        case "error":
          {
            result.errors++;
            // No default
          }
          break;
      }

      // Log progress every 10 users
      if ((i + 1) % 10 === 0) {
        logger.info(`  Progress: ${i + 1}/${users.length} users processed`);
      }
    }
  }

  logger.info("═══════════════════════════════════════════════════════════");
  logger.info("📊 User Seeding Complete:");
  logger.info(`   Total:   ${result.total}`);
  logger.info(`   Created: ${result.created}`);
  logger.info(`   Updated: ${result.updated}`);
  logger.info(`   Errors:  ${result.errors}`);
  logger.info("═══════════════════════════════════════════════════════════");

  return result;
}
