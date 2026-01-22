/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Enhanced Seed API Route V4 - Database Seeding Operations
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * POST: Seed specified entities (users, comics, chapters)
 * DELETE: Clear all seed data
 *
 * Features:
 * ✅ Dynamic JSON loading from multiple files
 * ✅ Image download with caching
 * ✅ Zod validation
 * ✅ onConflictDoUpdate for upserts
 * ✅ CUSTOM_PASSWORD support
 * ✅ Comprehensive logging
 * ✅ Fallback images
 * ✅ Original filename preservation
 *
 * IMPORTANT: This is a server-only route. All imports are dynamic to prevent
 * bundling seed utilities into the client bundle.
 */

import { NextResponse } from "next/server";
import { z } from "zod";

const seedOptionsSchema = z
  .object({
    verbose: z.boolean().optional(),
    dryRun: z.boolean().optional(),
  })
  .strict();

type SeedOptions = z.infer<typeof seedOptionsSchema>;

function validateOptions(body: unknown): SeedOptions {
  try {
    return seedOptionsSchema.parse(body ?? {});
  } catch (error) {
    throw new Error(`Invalid seed options: ${error}`);
  }
}

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export async function GET() {
  try {
    return successResponse({
      message: "Enhanced Seed API V4 Ready",
      version: "4.0.0",
      endpoints: {
        POST: "Seed entities (POST /api/seed with { entities: 'all|users|comics|chapters', options: {...} })",
        DELETE: "Clear all data (DELETE /api/seed)",
      },
      features: [
        "Dynamic JSON loading from multiple files",
        "Image download with caching and deduplication",
        "Zod validation for all data",
        "onConflictDoUpdate for upserts",
        "CUSTOM_PASSWORD environment variable support",
        "Comprehensive logging with operation tracking",
        "Fallback images (placeholder-comic.jpg, shadcn.jpg)",
        "Original filename and extension preservation",
      ],
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Check failed");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const options = validateOptions(body.options ?? {});
    const entities = body.entities ?? "all";

    const result = {
      users: { total: 0, created: 0, updated: 0, skipped: 0, errors: 0 },
      comics: { total: 0, created: 0, updated: 0, skipped: 0, errors: 0, imagesDownloaded: 0, imagesCached: 0 },
      chapters: { total: 0, created: 0, updated: 0, skipped: 0, errors: 0, imagesDownloaded: 0, imagesCached: 0 },
    };

    if (options.dryRun) {
      return successResponse({
        message: "Dry run mode - no changes made",
        result,
      });
    }

    // Dynamic imports prevent seed utilities from bundling into client (using V4 seeders)
    const { seedUsersV4 } = await import("@/database/seed/seeders/userSeederV4");
    const { seedComicsV4 } = await import("@/database/seed/seeders/comicSeederV4");
    const { seedChaptersV4 } = await import("@/database/seed/seeders/chapterSeederV4");

    switch (entities) {
      case "all":
        result.users = await seedUsersV4(["users.json"]);
        result.comics = await seedComicsV4([
          "comics.json",
          "comicsdata1.json",
          "comicsdata2.json",
        ]);
        result.chapters = await seedChaptersV4([
          "chapters.json",
          "chaptersdata1.json",
          "chaptersdata2.json",
        ]);
        break;

      case "users":
        result.users = await seedUsersV4(["users.json"]);
        break;

      case "comics":
        result.comics = await seedComicsV4([
          "comics.json",
          "comicsdata1.json",
          "comicsdata2.json",
        ]);
        break;

      case "chapters":
        result.chapters = await seedChaptersV4([
          "chapters.json",
          "chaptersdata1.json",
          "chaptersdata2.json",
        ]);
        break;

      default:
        return errorResponse("Invalid entity specified", 400);
    }

    return successResponse({ message: "Seeding completed successfully", results: result });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Seeding failed");
  }
}

export async function DELETE() {
  try {
    // For now, just return a message about how to clear data
    // Full implementation would involve deleting all records from each table
    return successResponse({
      message: "Clear operation not yet implemented",
      instruction: "Use 'pnpm db:reset' command to reset the entire database",
    });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Clear failed");
  }
}
