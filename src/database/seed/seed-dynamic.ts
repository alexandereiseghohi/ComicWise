#!/usr/bin/env tsx
import { db } from "@/database";
import * as schema from "@/database/schema";
import { ensureSavedImageForUrl } from "@/lib/imageHelper";
import { seedLogger } from "@/lib/logger";
import { loadJsonData, loadJsonPattern, seedTable } from "@/lib/seedHelpers";
import { chapterSchema, comicSchema, normalizeImagePath, userSchema } from "@/lib/validations/seed";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { eq } from "drizzle-orm";
import fs from "fs-extra";
import path from "path";

const CUSTOM_PASSWORD = process.env["CUSTOM_PASSWORD"] || "password";
const SALT_ROUNDS = parseInt(process.env["SEED_BCRYPT_ROUNDS"] || "10", 10);
const PROGRESS_FILE = path.join(process.cwd(), ".cache", "seed-progress.json");
const isDryRun = process.argv.includes("--dry-run") || process.env["SEED_DRY_RUN"] === "1";

// CLI flags: allow selective runs
const flagUsers = process.argv.includes("--users");
const flagComics = process.argv.includes("--comics");
const flagChapters = process.argv.includes("--chapters");
const flagClear = process.argv.includes("--clear");
const flagCreateMissingComics =
  process.argv.includes("--create-missing-comics") ||
  process.env["SEED_CREATE_MISSING_COMICS"] === "1";

// If none of the selective flags provided, run everything by default
const runUsers = flagUsers || (!flagUsers && !flagComics && !flagChapters);
const runComics = flagComics || (!flagUsers && !flagComics && !flagChapters);
const runChapters = flagChapters || (!flagUsers && !flagComics && !flagChapters);

async function writeProgress(step: string, detail: Record<string, any> = {}) {
  try {
    await fs.ensureDir(path.dirname(PROGRESS_FILE));
    const payload = { step, detail, updatedAt: new Date().toISOString() };
    await fs.writeFile(PROGRESS_FILE, JSON.stringify(payload, null, 2), "utf-8");
  } catch (error) {
    seedLogger.warn({ msg: "Failed writing progress", err: error });
  }
}

async function seedUsers() {
  try {
    const users = await loadJsonData("./users.json", userSchema);
    const mapped = await Promise.all(
      users.map(async (u) => {
        const image = normalizeImagePath(u.image as any);
        const savedImage = await ensureSavedImageForUrl(
          image,
          path.join(process.cwd(), "public", "users"),
          "/shadcn.jpg"
        );
        const passwordHash = await bcrypt.hash(CUSTOM_PASSWORD, SALT_ROUNDS);
        return {
          id: u.id,
          name: u.name || null,
          email: u.email,
          image: savedImage,
          role: u.role || "user",
          password: passwordHash,
          createdAt: u.createdAt ? new Date(u.createdAt) : new Date(),
          updatedAt: new Date(),
        };
      })
    );

    await seedTable(schema.user, mapped, {
      batchSize: 200,
      conflictKeys: ["email"],
      dryRun: isDryRun,
    });
    seedLogger.info({ msg: `Seeded users: ${mapped.length}`, dryRun: isDryRun });
    await writeProgress("users", { seeded: mapped.length });
  } catch (error) {
    seedLogger.error({ msg: "Error seeding users", err: error });
  }
}

async function seedComics() {
  try {
    const comicsA = (await loadJsonData("./comics.json", comicSchema)) as any[];
    const comicsB = await loadJsonPattern("./comicsdata*.json", comicSchema as any);
    const comics = comicsA.concat(comicsB);
    const mapped = await Promise.all(
      comics.map(async (c) => {
        const image = normalizeImagePath(c.cover || (c.images && c.images[0]) || undefined);
        const saved = await ensureSavedImageForUrl(
          image,
          path.join(process.cwd(), "public", "comics", "covers", c.slug),
          "/placeholder-comic.jpg"
        );
        return {
          title: c.title,
          slug: c.slug,
          description: c.description || null,
          coverImage: saved,
          url: c.url || null,
          serialization: c.serialization || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      })
    );

    await seedTable(schema.comic, mapped, {
      batchSize: 100,
      conflictKeys: ["slug"],
      dryRun: isDryRun,
    });
    seedLogger.info({ msg: `Seeded comics: ${mapped.length}`, dryRun: isDryRun });

    // Insert comic images metadata into comicImage table
    // For dry-run we avoid DB queries (db may be a placeholder). Instead just log intended actions.
    for (const c of comics) {
      try {
        const images = Array.isArray(c.images) ? c.images : c.image_urls || [];
        for (let i = 0; i < images.length; i++) {
          const img = normalizeImagePath(images[i]);
          const saved = await ensureSavedImageForUrl(
            img,
            path.join(process.cwd(), "public", "comics", "covers", c.slug),
            "/placeholder-comic.jpg",
            { dryRun: isDryRun }
          );
          if (isDryRun) {
            seedLogger.info({
              msg: `Dry-run: would add comicImage`,
              comicSlug: c.slug,
              image: saved,
              order: i,
            });
            continue;
          }

          // runtime DB path
          const comicRows = await db
            .select()
            .from(schema.comic)
            .where(eq(schema.comic.slug, c.slug))
            .limit(1);
          const comicRow = comicRows && comicRows.length > 0 ? comicRows[0] : null;
          if (!comicRow) {
            seedLogger.warn({ msg: `Comic not found after insert`, slug: c.slug });
            continue;
          }

          const existsRows = await db
            .select()
            .from(schema.comicImage)
            .where(
              eq(schema.comicImage.comicId, comicRow.id),
              eq(schema.comicImage.imageUrl, saved)
            )
            .limit(1);
          const exists = existsRows && existsRows.length > 0 ? existsRows[0] : null;
          if (!exists) {
            await db
              .insert(schema.comicImage)
              .values({ comicId: comicRow.id, imageUrl: saved, imageOrder: i })
              .run();
            seedLogger.info({ msg: `Inserted comicImage`, comicId: comicRow.id, image: saved });
          } else {
            seedLogger.debug({
              msg: `comicImage already exists`,
              comicId: comicRow.id,
              image: saved,
            });
          }
        }
      } catch (error) {
        seedLogger.error({ msg: `Failed handling comic images for ${c.slug}`, err: error });
      }
    }
    await writeProgress("comics", { seeded: mapped.length });
  } catch (error) {
    seedLogger.error({ msg: "Error seeding comics", err: error });
  }
}

async function seedChapters() {
  try {
    const chaptersA = (await loadJsonData("./chapters.json", chapterSchema)) as any[];
    const chaptersB = await loadJsonPattern("./chaptersdata*.json", chapterSchema as any);
    const chapters = chaptersA.concat(chaptersB);
    // Preload comics into maps to support fuzzy matching (slug, title)
    let allComics: any[] = [];
    if (isDryRun) {
      // load comics from JSON files for offline/dry-run mapping
      try {
        const comicsA = await loadJsonData("./comics.json", comicSchema as any);
        const comicsB = await loadJsonPattern("./comicsdata*.json", comicSchema as any);
        allComics = comicsA.concat(comicsB);
      } catch (error) {
        seedLogger.warn({ msg: "Failed loading comics for dry-run mapping", err: error });
        allComics = [];
      }
    } else {
      allComics = await db.select().from(schema.comic);
    }
    const slugMap = new Map<string, any>();
    const titleMap = new Map<string, any>();
    for (const r of allComics) {
      if (r.slug) {
        slugMap.set(String(r.slug), r);
        const ns = normalizeToSlug(r.slug);
        if (ns) slugMap.set(ns, r);
      }
      if (r.title) {
        titleMap.set(String(r.title).toLowerCase().trim(), r);
        const tnorm = String(r.title)
          .replaceAll(/[^\da-z]+/gi, "")
          .toLowerCase()
          .trim();
        if (tnorm) titleMap.set(tnorm, r);
      }
      if (r.name) titleMap.set(String(r.name).toLowerCase().trim(), r);
      if (r.fullTitle) titleMap.set(String(r.fullTitle).toLowerCase().trim(), r);
    }

    function normalizeToSlug(s: any) {
      if (!s && s !== 0) return undefined;
      let t = String(s || "")
        .toLowerCase()
        .trim();
      t = t
        .replaceAll(/[^\da-z]+/g, "-")
        .replaceAll(/^-+|-+$/g, "")
        .replaceAll(/-+/g, "-");
      return t || undefined;
    }

    function extractSlugFromUrl(url?: string) {
      if (!url || typeof url !== "string") return undefined;
      try {
        const u = new URL(url);
        const parts = u.pathname.split("/").filter(Boolean);
        const idx = parts.indexOf("series");
        if (idx >= 0 && parts.length > idx + 1) return parts[idx + 1];
      } catch {
        // ignore
      }
      return undefined;
    }

    function findComicByHeuristics(rawIdentifier: any) {
      if (!rawIdentifier) return undefined;
      const cand = normalizeToSlug(rawIdentifier);
      if (cand && slugMap.has(cand)) return slugMap.get(cand);
      if (slugMap.has(rawIdentifier)) return slugMap.get(rawIdentifier);
      if (cand) {
        for (const r of allComics) {
          const s = r.slug ? normalizeToSlug(r.slug) : undefined;
          if (s && (s === cand || s.startsWith(cand) || cand.startsWith(s) || s.includes(cand)))
            return r;
          const t = r.title
            ? String(r.title)
                .replaceAll(/[^\da-z]+/gi, "")
                .toLowerCase()
            : undefined;
          if (t && (t === cand || t.includes(cand) || cand.includes(t))) return r;
        }
      }
      const titleKey = String(rawIdentifier)
        .toLowerCase()
        .replaceAll(/[^\da-z]+/g, "")
        .trim();
      if (titleMap.has(titleKey)) return titleMap.get(titleKey);
      const tkey2 = String(rawIdentifier).toLowerCase().trim();
      if (titleMap.has(tkey2)) return titleMap.get(tkey2);
      for (const r of allComics) {
        if (
          r.title &&
          String(r.title).toLowerCase().includes(String(rawIdentifier).toLowerCase().trim())
        )
          return r;
      }
      return undefined;
    }

    // Map chapters to DB structure: need comicId — attempt to find by slug/title/url
    const mapped = [] as any[];
    for (const ch of chapters) {
      const rawIdentifier = ch.comicslug || ch.comic || undefined;
      let comicRow: any = null;

      if (rawIdentifier) {
        // direct slug
        if (slugMap.has(rawIdentifier)) comicRow = slugMap.get(rawIdentifier);

        // normalized slug and fuzzy slug checks
        if (!comicRow) {
          const cand = normalizeToSlug(rawIdentifier);
          if (cand && slugMap.has(cand)) comicRow = slugMap.get(cand);
          if (!comicRow && cand) {
            for (const k of slugMap.keys()) {
              if (
                k &&
                k.startsWith &&
                (k.startsWith(cand) || cand.startsWith(k) || k.includes(cand))
              ) {
                comicRow = slugMap.get(k);
                break;
              }
            }
          }
        }

        // title-based match (normalized)
        if (!comicRow) {
          const titleKey = String(rawIdentifier)
            .toLowerCase()
            .replaceAll(/[^\da-z]+/g, "")
            .trim();
          if (titleMap.has(titleKey)) comicRow = titleMap.get(titleKey);
          else {
            const tkey2 = String(rawIdentifier).toLowerCase().trim();
            if (titleMap.has(tkey2)) comicRow = titleMap.get(tkey2);
          }
        }
      }

      // fallback: try to extract from chapter URL
      if (!comicRow) {
        const extracted = extractSlugFromUrl(ch.url);
        if (extracted) {
          if (slugMap.has(extracted)) comicRow = slugMap.get(extracted);
          else {
            const cand = normalizeToSlug(extracted);
            if (cand && slugMap.has(cand)) comicRow = slugMap.get(cand);
          }
        }
      }

      // aggressive heuristics
      if (!comicRow) comicRow = findComicByHeuristics(rawIdentifier);

      if (!comicRow) {
        // If configured, create a minimal comic stub to allow chapters to map.
        if (flagCreateMissingComics) {
          try {
            const inferredSlug =
              normalizeToSlug(rawIdentifier || ch.title) || `missing-${Date.now()}`;
            const inferredTitle = String(rawIdentifier || ch.title || inferredSlug).slice(0, 200);
            if (isDryRun) {
              // Create an in-memory stub with a temporary negative id so mapping can proceed
              const tempId = -1 * (Date.now() % 1000000);
              const stub = { id: tempId, slug: inferredSlug, title: inferredTitle };
              allComics.push(stub);
              slugMap.set(inferredSlug, stub);
              titleMap.set(String(inferredTitle).toLowerCase().trim(), stub);
              comicRow = stub;
              seedLogger.info({
                msg: `Dry-run: created comic stub`,
                slug: inferredSlug,
                title: inferredTitle,
              });
            } else {
              // Persist stub to DB and reload the row
              const now = new Date();
              await db
                .insert(schema.comic)
                .values({
                  title: inferredTitle,
                  slug: inferredSlug,
                  description: null,
                  coverImage: null,
                  url: null,
                  serialization: null,
                  createdAt: now,
                  updatedAt: now,
                })
                .run();
              const rows = await db
                .select()
                .from(schema.comic)
                .where(eq(schema.comic.slug, inferredSlug))
                .limit(1);
              if (rows && rows.length > 0) comicRow = rows[0];
              if (!comicRow)
                seedLogger.warn({ msg: `Failed to create comic stub`, slug: inferredSlug });
              else {
                allComics.push(comicRow);
                slugMap.set(String(comicRow.slug), comicRow);
                titleMap.set(String(comicRow.title).toLowerCase().trim(), comicRow);
                seedLogger.info({
                  msg: `Created comic stub`,
                  slug: inferredSlug,
                  title: inferredTitle,
                });
              }
            }
          } catch (error) {
            seedLogger.error({ msg: `Failed creating comic stub`, err: error });
            continue;
          }
        } else {
          console.warn(`Could not find comic for chapter slug/title: ${rawIdentifier || ch.title}`);
          continue;
        }
      }

      const images = Array.isArray(ch.images) ? ch.images : ch.image_urls || [];

      mapped.push({
        slug: ch.slug || ch.chapterslug || `c-${Date.now()}`,
        title: ch.title || ch.name || "",
        chapterNumber: parseInt(ch.chapterNumber || ch.chaptername || "0", 10) || 0,
        releaseDate: ch.updatedAt ? new Date(ch.updatedAt) : new Date(),
        comicId: comicRow.id,
        url: ch.url || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (mapped.length > 0) {
      await seedTable(schema.chapter, mapped, {
        batchSize: 100,
        conflictKeys: ["comicId", "chapterNumber"],
        dryRun: isDryRun,
      });
    }

    // Insert chapter images metadata into chapterImage table
    for (const ch of chapters) {
      try {
        const comicSlug = ch.comicslug || ch.comic || undefined;
        if (!comicSlug) continue;

        const images = Array.isArray(ch.images) ? ch.images : ch.image_urls || [];

        if (isDryRun) {
          // In dry-run we don't query DB; just ensure images would be saved and log the action
          for (let i = 0; i < images.length; i++) {
            const img = normalizeImagePath(images[i]);
            const saved = await ensureSavedImageForUrl(
              img,
              path.join(
                process.cwd(),
                "public",
                "comics",
                "chapters",
                comicSlug,
                ch.slug || ch.chapterslug || ""
              ),
              "/placeholder-comic.jpg",
              { dryRun: true }
            );
            seedLogger.info({
              msg: `Dry-run: would add chapterImage`,
              chapterSlug: ch.slug || ch.chapterslug,
              image: saved,
              page: i,
            });
          }
          continue;
        }

        // runtime DB path: find comic and chapter rows
        const comicRows = await db
          .select()
          .from(schema.comic)
          .where(eq(schema.comic.slug, comicSlug))
          .limit(1);
        const comicRow = comicRows && comicRows.length > 0 ? comicRows[0] : null;
        if (!comicRow) continue;
        // find chapter row by comicId and chapterNumber
        const chapterNumber = parseInt(ch.chapterNumber || ch.chaptername || "0", 10) || 0;
        const chapterRows = await db
          .select()
          .from(schema.chapter)
          .where(
            eq(schema.chapter.comicId, comicRow.id),
            eq(schema.chapter.chapterNumber, chapterNumber)
          )
          .limit(1);
        const chapterRow = chapterRows && chapterRows.length > 0 ? chapterRows[0] : null;
        if (!chapterRow) continue;

        for (let i = 0; i < images.length; i++) {
          const img = normalizeImagePath(images[i]);
          const saved = await ensureSavedImageForUrl(
            img,
            path.join(
              process.cwd(),
              "public",
              "comics",
              "chapters",
              comicSlug,
              ch.slug || ch.chapterslug || ""
            ),
            "/placeholder-comic.jpg",
            { dryRun: isDryRun }
          );

          const existsRows = await db
            .select()
            .from(schema.chapterImage)
            .where(
              eq(schema.chapterImage.chapterId, chapterRow.id),
              eq(schema.chapterImage.imageUrl, saved)
            )
            .limit(1);
          const exists = existsRows && existsRows.length > 0 ? existsRows[0] : null;
          if (!exists) {
            await db
              .insert(schema.chapterImage)
              .values({ chapterId: chapterRow.id, imageUrl: saved, pageNumber: i })
              .run();
            seedLogger.info({
              msg: `Inserted chapterImage`,
              chapterId: chapterRow.id,
              image: saved,
            });
          } else {
            seedLogger.debug({
              msg: `chapterImage already exists`,
              chapterId: chapterRow.id,
              image: saved,
            });
          }
        }
      } catch (error) {
        seedLogger.error({ msg: `Failed handling chapter images`, err: error });
      }
    }

    seedLogger.info({ msg: `Seeded chapters: ${mapped.length}`, dryRun: isDryRun });
    await writeProgress("chapters", { seeded: mapped.length });
  } catch (error) {
    seedLogger.error({ msg: "Error seeding chapters", err: error });
  }
}

export async function main() {
  seedLogger.info({ msg: `Starting dynamic seed`, dryRun: isDryRun });
  await writeProgress("start", { dryRun: isDryRun });
  if (flagClear) {
    seedLogger.warn({
      msg: "--clear requested. This will truncate selected tables if SEED_ALLOW_CLEAR=1 and not a dry-run",
    });
    if (isDryRun) {
      seedLogger.info({ msg: "Dry-run: would clear tables (no action taken)" });
    } else if (process.env["SEED_ALLOW_CLEAR"] !== "1") {
      seedLogger.warn({
        msg: "Clearing is disabled. Set SEED_ALLOW_CLEAR=1 to allow destructive clears.",
      });
    } else {
      try {
        if (runChapters) {
          await db.delete(schema.chapterImage).run();
          await db.delete(schema.chapter).run();
          seedLogger.info({ msg: "Cleared chapters and chapter images" });
        }
        if (runComics) {
          await db.delete(schema.comicImage).run();
          await db.delete(schema.comic).run();
          seedLogger.info({ msg: "Cleared comics and comic images" });
        }
        if (runUsers) {
          await db.delete(schema.user).run();
          seedLogger.info({ msg: "Cleared users" });
        }
      } catch (error) {
        seedLogger.error({ msg: "Error during clearing tables", err: error });
      }
    }
  }

  if (runUsers) await seedUsers();
  if (runComics) await seedComics();
  if (runChapters) await seedChapters();
  seedLogger.info({ msg: "Seeding complete" });
  await writeProgress("done", {});
  // if executed directly via tsx CLI, exit when finished
  if (process.argv[1] && process.argv[1].includes("seed-dynamic")) process.exit(0);
}

const isMain = process.argv[1] && process.argv[1].includes("seed-dynamic");
if (isMain) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
