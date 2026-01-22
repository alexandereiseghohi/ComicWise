import { sql } from "drizzle-orm";
import { db } from "../src/database/db.js";

async function migrateGenreSlug() {
  try {
    console.log("🔄 Adding slug column to genre table...");

    // Add slug column if it doesn't exist
    await db.execute(sql`ALTER TABLE genre ADD COLUMN IF NOT EXISTS slug text`);

    // Generate slugs for existing genres
    await db.execute(sql`
      UPDATE genre
      SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
      WHERE slug IS NULL
    `);

    // Make slug NOT NULL
    await db.execute(sql`ALTER TABLE genre ALTER COLUMN slug SET NOT NULL`);

    // Add unique constraint
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'genre_slug_unique'
        ) THEN
          ALTER TABLE genre ADD CONSTRAINT genre_slug_unique UNIQUE (slug);
        END IF;
      END
      $$
    `);

    console.log("✅ Genre table successfully updated with slug column");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

migrateGenreSlug();
