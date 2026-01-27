#!/usr/bin/env tsx
import { readFileSync } from "fs";
import { join } from "path";
import { z } from "zod";
import { chapterSchema, comicSchema } from "../src/lib/validations/seed";

function extractStringFromPossible(val: any): string | undefined {
  if (val === null || val === undefined) return undefined;
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (val && typeof val === "object") {
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
  const imgKeys = ["images", "image_urls", "image_urls_list", "image_list", "image"];
  for (const k of imgKeys) {
    if (Array.isArray(out[k])) {
      out[k] = out[k].map((v: any) => extractStringFromPossible(v)).filter(Boolean);
      out["images"] = out[k];
    }
  }

  if (out.cover && typeof out.cover === "object") out.cover = extractStringFromPossible(out.cover);
  if (out.image && typeof out.image === "object") out.image = extractStringFromPossible(out.image);

  if (Array.isArray(out.author)) {
    const a = out.author.map((x: any) => extractStringFromPossible(x)).filter(Boolean);
    out.author = a.length ? a[0] : undefined;
  } else if (out.author && typeof out.author === "object")
    out.author = extractStringFromPossible(out.author);

  if (Array.isArray(out.artist)) {
    const a = out.artist.map((x: any) => extractStringFromPossible(x)).filter(Boolean);
    out.artist = a.length ? a[0] : undefined;
  } else if (out.artist && typeof out.artist === "object")
    out.artist = extractStringFromPossible(out.artist);

  if (Array.isArray(out.genres)) {
    out.genres = out.genres
      .map((g: any) => extractStringFromPossible(g))
      .filter(Boolean)
      .map((s: any) => String(s).trim());
  } else if (typeof out.genres === "string") {
    out.genres = out.genres
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
  }

  if (out.comic && typeof out.comic === "object") out.comic = extractStringFromPossible(out.comic);
  if (!out.comic && out.comicslug) out.comic = out.comicslug;
  if (!out.comic && out.comicSlug) out.comic = out.comicSlug;

  return out;
}

function loadAndCheck(filePath: string, schema: z.ZodSchema<any>, limit = 10) {
  const full = join(process.cwd(), filePath);
  const raw = readFileSync(full, "utf-8");
  const parsed = JSON.parse(raw);

  let candidates: any[] = [];
  if (Array.isArray(parsed)) candidates = parsed;
  else if (parsed && typeof parsed === "object") {
    const keys = ["data", "items", "comics", "chapters", "users", "results"];
    for (const k of keys) if (Array.isArray((parsed as any)[k])) candidates = (parsed as any)[k];
    if (candidates.length === 0) {
      let largest: any[] = [];
      for (const v of Object.values(parsed))
        if (Array.isArray(v) && v.length > largest.length) largest = v as any[];
      if (largest.length) candidates = largest;
    }
  }
  if (candidates.length === 0 && parsed && typeof parsed === "object") candidates = [parsed];

  const transformed = candidates.map(transformItem);
  const invalids: any[] = [];
  for (let i = 0; i < transformed.length; i++) {
    const it = transformed[i];
    const res = schema.safeParse(it);
    if (!res.success) {
      invalids.push({ index: i, item: it, errors: res.error.issues });
      if (invalids.length >= limit) break;
    }
  }

  return { total: transformed.length, invalids };
}

function prettyPrintSamples(file: string, schema: z.ZodSchema<any>) {
  console.log(`\nChecking ${file}`);
  const { total, invalids } = loadAndCheck(file, schema, 10);
  console.log(`Total items checked: ${total}`);
  console.log(`Invalid samples found: ${invalids.length}`);
  for (const inv of invalids) {
    console.log("---");
    console.log(`index: ${inv.index}`);
    console.log(JSON.stringify(inv.item, null, 2));
    console.log("errors:", JSON.stringify(inv.errors, null, 2));
  }
}

function collectComicSlugs(files: string[]) {
  const slugs = new Set<string>();
  for (const f of files) {
    const full = join(process.cwd(), f);
    const raw = readFileSync(full, "utf-8");
    const parsed = JSON.parse(raw);
    let candidates: any[] = [];
    if (Array.isArray(parsed)) candidates = parsed;
    else if (parsed && typeof parsed === "object") {
      const keys = ["data", "items", "comics", "chapters", "users", "results"];
      for (const k of keys) if (Array.isArray((parsed as any)[k])) candidates = (parsed as any)[k];
      if (candidates.length === 0) {
        let largest: any[] = [];
        for (const v of Object.values(parsed))
          if (Array.isArray(v) && v.length > largest.length) largest = v as any[];
        if (largest.length) candidates = largest;
      }
    }
    if (candidates.length === 0 && parsed && typeof parsed === "object") candidates = [parsed];
    for (const it of candidates) {
      const t = transformItem(it);
      if (t.slug) slugs.add(String(t.slug));
    }
  }
  return slugs;
}

function findUnmatchedChapters(chaptersFile: string, comicSlugFiles: string[], limit = 10) {
  const slugs = collectComicSlugs(comicSlugFiles);
  const full = join(process.cwd(), chaptersFile);
  const raw = readFileSync(full, "utf-8");
  const parsed = JSON.parse(raw);
  let candidates: any[] = [];
  if (Array.isArray(parsed)) candidates = parsed;
  else if (parsed && typeof parsed === "object") {
    const keys = ["data", "items", "comics", "chapters", "users", "results"];
    for (const k of keys) if (Array.isArray((parsed as any)[k])) candidates = (parsed as any)[k];
    if (candidates.length === 0) {
      let largest: any[] = [];
      for (const v of Object.values(parsed))
        if (Array.isArray(v) && v.length > largest.length) largest = v as any[];
      if (largest.length) candidates = largest;
    }
  }
  if (candidates.length === 0 && parsed && typeof parsed === "object") candidates = [parsed];
  const unmatched: any[] = [];
  for (let i = 0; i < candidates.length; i++) {
    const ch = transformItem(candidates[i]);
    const rawComic = (ch as any).comicslug || (ch as any).comic || undefined;
    const comicSlug = typeof rawComic === "object" ? extractStringFromPossible(rawComic) : rawComic;
    if (!comicSlug || !slugs.has(String(comicSlug))) {
      unmatched.push({ index: i, chapter: ch, resolvedComicSlug: comicSlug });
      if (unmatched.length >= limit) break;
    }
  }
  return { totalChapters: candidates.length, unmatched };
}

async function main() {
  prettyPrintSamples("./comics.json", comicSchema);
  prettyPrintSamples("./comicsdata1.json", comicSchema);
  prettyPrintSamples("./comicsdata2.json", comicSchema);
  prettyPrintSamples("./chapters.json", chapterSchema);

  console.log("\nChecking for chapters with no matching comic slug...");
  const { totalChapters, unmatched } = findUnmatchedChapters(
    "./chapters.json",
    ["./comics.json", "./comicsdata1.json", "./comicsdata2.json"],
    10
  );
  console.log(`Total chapters: ${totalChapters}`);
  console.log(`Unmatched chapter samples: ${unmatched.length}`);
  for (const u of unmatched) {
    console.log("---");
    console.log(`index: ${u.index}`);
    console.log(JSON.stringify(u.chapter, null, 2));
    console.log(`resolvedComicSlug: ${JSON.stringify(u.resolvedComicSlug)}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
