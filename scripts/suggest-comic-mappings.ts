#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from "fs";
import { sync as globSync } from "glob";
import { join } from "path";

function normalizeToSlug(s: any) {
  if (!s && s !== 0) return undefined;
  let t = String(s || "")
    .toLowerCase()
    .trim();
  t = t
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
  return t || undefined;
}

const cachePath = join(process.cwd(), ".cache", "dry-seed-chapters.json");
const raw = JSON.parse(readFileSync(cachePath, "utf-8"));
const unmatched = raw.unmatched || [];

// load comics (comics.json + comicsdata*.json)
const comicsFiles = [join(process.cwd(), "comics.json")].concat(
  globSync("./comicsdata*.json", { cwd: process.cwd(), absolute: true })
);
let comics: any[] = [];
for (const f of comicsFiles) {
  try {
    const rawc = JSON.parse(readFileSync(f, "utf-8"));
    if (Array.isArray(rawc)) comics = comics.concat(rawc);
    else if (rawc && typeof rawc === "object") {
      const keys = ["data", "items", "comics", "results"];
      for (const k of keys)
        if (Array.isArray((rawc as any)[k])) comics = comics.concat((rawc as any)[k]);
      if (comics.length === 0) {
        let largest: any[] = [];
        for (const v of Object.values(rawc))
          if (Array.isArray(v) && v.length > largest.length) largest = v as any[];
        if (largest.length) comics = comics.concat(largest);
      }
    }
  } catch (e) {
    // ignore
  }
}

const suggestions: Record<string, string[]> = {};
for (const u of unmatched) {
  const rawId =
    u.resolvedComicSlug ||
    (u.chapter && (u.chapter.comicslug || u.chapter.comictitle || u.chapter.comic));
  if (!rawId) continue;
  const key = String(rawId).toLowerCase();
  if (!suggestions[key]) suggestions[key] = [];
  const cand = normalizeToSlug(rawId);
  for (const c of comics) {
    const s = c.slug ? normalizeToSlug(c.slug) : undefined;
    const t = c.title ? String(c.title).toLowerCase() : undefined;
    if (s && cand && (s === cand || s.includes(cand) || cand.includes(s)))
      suggestions[key].push(c.slug || c.title);
    else if (t && key && t.includes(key)) suggestions[key].push(c.slug || c.title);
  }
  // unique
  suggestions[key] = Array.from(new Set(suggestions[key]));
}

const outPath = join(process.cwd(), ".cache", "suggested-comic-mappings.json");
writeFileSync(outPath, JSON.stringify(suggestions, null, 2), "utf-8");
console.log(`Wrote suggestions to ${outPath}`);
console.log(JSON.stringify(suggestions, null, 2));

process.exit(0);
