/**
 * Seed API Route - Database Seeding Operations
 *
 * POST: Seed specified entities
 * DELETE: Clear all seed data
 */

import { seedChaptersFromFiles } from "@/database/seed/seeders/chapterSeeder";
import { seedComicsFromFiles } from "@/database/seed/seeders/comicSeeder";
import { seedUsersFromFiles } from "@/database/seed/seeders/userSeeder";
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
      message: "Seed API ready",
      endpoints: {
        POST: "Seed entities (POST /api/seed with { entities: 'all|users|comics|chapters', options: {...} })",
        DELETE: "Clear all data (DELETE /api/seed)",
      },
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
      comics: { total: 0, created: 0, updated: 0, skipped: 0, errors: 0 },
      chapters: { total: 0, created: 0, updated: 0, skipped: 0, errors: 0 },
    };

    if (options.dryRun) {
      return successResponse({
        message: "Dry run mode - no changes made",
        result,
      });
    }

    switch (entities) {
      case "all":
        result.users = await seedUsersFromFiles(["users.json"]);
        result.comics = await seedComicsFromFiles("comics*.json");
        result.chapters = await seedChaptersFromFiles([
          "chapters.json",
          "chaptersdata1.json",
          "chaptersdata2.json",
        ]);
        break;

      case "users":
        result.users = await seedUsersFromFiles(["users.json"]);
        break;

      case "comics":
        result.comics = await seedComicsFromFiles("comics*.json");
        break;

      case "chapters":
        result.chapters = await seedChaptersFromFiles([
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
