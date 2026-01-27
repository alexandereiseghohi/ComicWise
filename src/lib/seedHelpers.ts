import { db } from "@/database";
import { seedLogger } from "@/lib/logger";
import { readFileSync } from "fs";
import fs from "fs-extra";
import { sync as globSync } from "glob";
import { join } from "path";
import { z } from "zod";

function extractStringFromPossible(val: any): string | undefined {
  if (val === null || val === undefined) return undefined;
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (val && typeof val === "object") {
    // common name/title fields
    const candidates = [
      "name",
      "fullName",
      "title",
      "url",
      "src",
      "path",
      "filename",
      "slug",
      "id",
    ];
    for (const k of candidates) if (val[k]) return String(val[k]);
    // sometimes author/artist is nested: { person: { name: 'X' } }
    if (val.person && typeof val.person === "object") {
      if (val.person.name) return String(val.person.name);
    }
    if (val.attributes && typeof val.attributes === "object") {
      if (val.attributes.name) return String(val.attributes.name);
    }
    return undefined;
  }
  return undefined;
}

function transformItem(item: any) {
  const out = { ...item };
  // normalize images arrays from various possible keys
  const imgKeys = ["images", "image_urls", "image_urls_list", "image_list", "image"];
  for (const k of imgKeys) {
    if (Array.isArray(out[k])) {
      out[k] = out[k].map((v: any) => extractStringFromPossible(v)).filter(Boolean);
      out["images"] = out[k];
    }
  }

  // single cover/image
  if (out.cover && typeof out.cover === "object") out.cover = extractStringFromPossible(out.cover);
  if (out.image && typeof out.image === "object") out.image = extractStringFromPossible(out.image);

  // authors / artists may be objects
  if (Array.isArray(out.author)) {
    // pick first meaningful entry
    const a = out.author.map((x: any) => extractStringFromPossible(x)).filter(Boolean);
    out.author = a.length ? a[0] : undefined;
  } else if (out.author && typeof out.author === "object")
    out.author = extractStringFromPossible(out.author);

  if (Array.isArray(out.artist)) {
    const a = out.artist.map((x: any) => extractStringFromPossible(x)).filter(Boolean);
    out.artist = a.length ? a[0] : undefined;
  } else if (out.artist && typeof out.artist === "object")
    out.artist = extractStringFromPossible(out.artist);

  // genres array may contain objects
  if (Array.isArray(out.genres)) {
    out.genres = out.genres
      .map((g: any) => extractStringFromPossible(g))
      .filter(Boolean)
      .map((s: any) => String(s).trim());
  } else if (typeof out.genres === "string") {
    // comma separated string
    out.genres = out.genres
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
  }

  // comic references
  if (out.comic && typeof out.comic === "object") out.comic = extractStringFromPossible(out.comic);
  if (!out.comic && out.comicslug) out.comic = out.comicslug;
  if (!out.comic && out.comicSlug) out.comic = out.comicSlug;

  return out;
}

export async function loadJsonData<T>(filePath: string, validator: z.ZodSchema<T>) {
  const fullPath = join(process.cwd(), filePath);
  const raw = readFileSync(fullPath, "utf-8");
  const parsed = JSON.parse(raw);

  let candidates: any[] = [];
  if (Array.isArray(parsed)) candidates = parsed;
  else if (parsed && typeof parsed === "object") {
    const keys = ["data", "items", "comics", "chapters", "users", "results"];
    for (const k of keys) if (Array.isArray((parsed as any)[k])) candidates = (parsed as any)[k];
    if (candidates.length === 0) {
      // pick largest array property
      let largest: any[] = [];
      for (const v of Object.values(parsed))
        if (Array.isArray(v) && v.length > largest.length) largest = v as any[];
      if (largest.length) candidates = largest;
    }
  }

  if (candidates.length === 0 && parsed && typeof parsed === "object") candidates = [parsed];

  const transformed = candidates.map(transformItem);
  const arraySchema = z.array(validator);
  try {
    return arraySchema.parse(transformed) as T[];
  } catch (err) {
    seedLogger.warn({
      msg: `Validation failed for ${filePath}, attempting to salvage valid items`,
      err,
    });
    const out: T[] = [];
    for (let i = 0; i < transformed.length; i++) {
      const it = transformed[i];
      const res = validator.safeParse(it);
      if (res.success) out.push(res.data as T);
      else
        seedLogger.debug({
          msg: `Skipping invalid item at index ${i} in ${filePath}`,
          issue: (res.error as any).errors,
        });
    }
    return out;
  }
}

export async function loadJsonPattern<T>(pattern: string, validator: z.ZodSchema<T>) {
  const files = globSync(pattern, { cwd: process.cwd(), absolute: true });
  let out: T[] = [];
  for (const f of files) {
    try {
      const raw = readFileSync(f, "utf-8");
      const parsed = JSON.parse(raw);

      let candidates: any[] = [];
      if (Array.isArray(parsed)) candidates = parsed;
      else if (parsed && typeof parsed === "object") {
        const keys = ["data", "items", "comics", "chapters", "users", "results"];
        for (const k of keys)
          if (Array.isArray((parsed as any)[k])) candidates = (parsed as any)[k];
        if (candidates.length === 0) {
          let largest: any[] = [];
          for (const v of Object.values(parsed))
            if (Array.isArray(v) && v.length > largest.length) largest = v as any[];
          if (largest.length) candidates = largest;
        }
      }

      if (candidates.length === 0 && parsed && typeof parsed === "object") candidates = [parsed];
      const transformed = candidates.map(transformItem);
      const arraySchema = z.array(validator);
      try {
        const items = arraySchema.parse(transformed) as T[];
        out = out.concat(items);
      } catch (err) {
        seedLogger.warn({ msg: `Validation failed for ${f}, salvaging valid items`, err });
        for (let i = 0; i < transformed.length; i++) {
          const it = transformed[i];
          const res = validator.safeParse(it);
          if (res.success) out.push(res.data as T);
        }
      }
    } catch (err) {
      seedLogger.warn({ msg: `Failed to load ${f}`, err });
    }
  }
  return out;
}

type SeedOptions = {
  truncate?: boolean;
  batchSize?: number;
  conflictKeys?: string[]; // column names for onConflict
  dryRun?: boolean;
};

function inferConflictKeys(table: any): string[] {
  const name = table?.name?.toLowerCase?.() ?? "";
  if (name === "user") return ["email"];
  if (name === "comic") return ["slug"];
  if (name === "chapter") return ["comicId", "chapterNumber"];
  if (table?.columns?.id) return ["id"];
  return [];
}

export async function seedTable(table: any, data: any[], options: SeedOptions = {}) {
  const { truncate = false, batchSize = 200, conflictKeys, dryRun = false } = options;

  if (!Array.isArray(data) || data.length === 0) {
    console.log(`No data provided for table ${table?.name ?? "unknown"}`);
    return { inserted: 0 };
  }

  if (truncate) {
    try {
      if (!dryRun) await db.delete(table).run();
      seedLogger.info({ msg: `Truncated table ${table.name}` });
    } catch (err) {
      seedLogger.warn({ msg: `Failed to truncate ${table.name}`, err });
    }
  }

  let inserted = 0;
  const effectiveConflict =
    conflictKeys && conflictKeys.length ? conflictKeys : inferConflictKeys(table);
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    try {
      if (dryRun) {
        seedLogger.info({ msg: `Dry-run: would insert ${batch.length} into ${table.name}` });
        inserted += batch.length;
      } else {
        const insertQuery = db.insert(table).values(batch as any[]);
        const finalQuery =
          effectiveConflict && effectiveConflict.length > 0
            ? // @ts-ignore - dynamic onConflict build
              (insertQuery as any).onConflictDoUpdate({
                target: effectiveConflict,
                set: Object.keys(batch[0]).reduce(
                  (acc, k) => ({ ...acc, [k]: (insertQuery as any).excluded[k] }),
                  {}
                ),
              })
            : insertQuery;

        await (finalQuery as any).run();
        inserted += batch.length;
        seedLogger.info({
          msg: `Inserted ${Math.min(i + batchSize, data.length)}/${data.length} into ${table.name}`,
        });
      }
    } catch (err) {
      seedLogger.error({ msg: `Failed inserting batch into ${table.name}`, err });
    }
  }

  return { inserted };
}

export function ensureDir(path: string) {
  fs.ensureDirSync(path);
}
