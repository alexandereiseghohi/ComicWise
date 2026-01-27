#!/usr/bin/env tsx
import { readFileSync } from "fs";
import { sync as globSync } from "glob";
import { join } from "path";

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
  // direct maps
  if (cand && slugMap.has(cand)) return slugMap.get(cand);
  if (slugMap.has(rawIdentifier)) return slugMap.get(rawIdentifier);
  // try substring/startsWith across all comics
  if (cand) {
    for (const c of comics) {
      const s = c.slug ? normalizeToSlug(c.slug) : undefined;
      if (s && (s === cand || s.startsWith(cand) || cand.startsWith(s) || s.includes(cand)))
        return c;
      const t = c.title
        ? String(c.title)
            .replaceAll(/[^\da-z]+/gi, "")
            .toLowerCase()
        : undefined;
      if (t && (t === cand || t.includes(cand) || cand.includes(t))) return c;
    }
  }
  // try title match
  const titleKey = String(rawIdentifier)
    .toLowerCase()
    .replaceAll(/[^\da-z]+/g, "")
    .trim();
  if (titleMap.has(titleKey)) return titleMap.get(titleKey);
  const tkey2 = String(rawIdentifier).toLowerCase().trim();
  if (titleMap.has(tkey2)) return titleMap.get(tkey2);
  // last resort: fuzzy by inclusion
  for (const c of comics) {
    if (
      c.title &&
      String(c.title).toLowerCase().includes(String(rawIdentifier).toLowerCase().trim())
    )
      return c;
  }
  return undefined;
}

function loadJson(filePath: string) {
  const full = join(process.cwd(), filePath);
  const raw = readFileSync(full, "utf-8");
  const parsed = JSON.parse(raw);
  if (Array.isArray(parsed)) return parsed.map(transformItem);
  if (parsed && typeof parsed === "object") {
    const keys = ["data", "items", "comics", "chapters", "users", "results"];
    for (const k of keys) if (Array.isArray(parsed[k])) return parsed[k].map(transformItem);
    // pick largest array property
    let largest: any[] = [];
    for (const v of Object.values(parsed))
      if (Array.isArray(v) && v.length > largest.length) largest = v;
    if (largest.length) return largest.map(transformItem);
    return [transformItem(parsed)];
  }
  return [];
}

function loadPattern(pattern: string) {
  const files = globSync(pattern, { cwd: process.cwd(), absolute: true });
  let out: any[] = [];
  for (const f of files) {
    try {
      const raw = readFileSync(f, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) out = out.concat(parsed.map(transformItem));
      else if (parsed && typeof parsed === "object") {
        const keys = ["data", "items", "comics", "chapters", "users", "results"];
        for (const k of keys)
          if (Array.isArray(parsed[k])) out = out.concat(parsed[k].map(transformItem));
        if (out.length === 0) {
          let largest: any[] = [];
          for (const v of Object.values(parsed))
            if (Array.isArray(v) && v.length > largest.length) largest = v;
          if (largest.length) out = out.concat(largest.map(transformItem));
          else out.push(transformItem(parsed));
        }
      }
    } catch (error) {
      console.warn(`Failed to load ${f}: ${error}`);
    }
  }
  return out;
}

// Load comics and chapters
const comicsA = loadJson("./comics.json");
const comicsB = loadPattern("./comicsdata*.json");
const comics = comicsA.concat(comicsB);
const chaptersA = loadJson("./chapters.json");
const chaptersB = loadPattern("./chaptersdata*.json");
const chapters = chaptersA.concat(chaptersB);

const slugMap = new Map<string, any>();
const titleMap = new Map<string, any>();
for (const c of comics) {
  // store raw slug and normalized slug
  if (c.slug) {
    slugMap.set(String(c.slug), c);
    const ns = normalizeToSlug(c.slug);
    if (ns) slugMap.set(ns, c);
  }
  // title variations
  if (c.title) {
    titleMap.set(String(c.title).toLowerCase().trim(), c);
    const tnorm = String(c.title)
      .replaceAll(/[^\da-z]+/gi, "")
      .toLowerCase()
      .trim();
    if (tnorm) titleMap.set(tnorm, c);
  }
  // other possible name fields
  if (c.fullTitle) titleMap.set(String(c.fullTitle).toLowerCase().trim(), c);
  if (c.name) titleMap.set(String(c.name).toLowerCase().trim(), c);
}

console.log(`Comics loaded: ${comics.length}`);
console.log(`Chapters loaded: ${chapters.length}`);

const unmatched: any[] = [];
for (let i = 0; i < chapters.length; i++) {
  const ch = chapters[i];
  const rawIdentifier = ch.comicslug || ch.comic || ch.comictitle || undefined;
  let comicRow: any = null;

  if (rawIdentifier) {
    // direct match
    if (slugMap.has(rawIdentifier)) comicRow = slugMap.get(rawIdentifier);

    // normalized slug match
    if (!comicRow) {
      const cand = normalizeToSlug(rawIdentifier);
      if (cand && slugMap.has(cand)) comicRow = slugMap.get(cand);
      // try startsWith / contains heuristics
      if (!comicRow && cand) {
        for (const k of slugMap.keys()) {
          if (k && k.startsWith && (k.startsWith(cand) || cand.startsWith(k) || k.includes(cand))) {
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

  if (!comicRow) unmatched.push({ index: i, chapter: ch, resolvedComicSlug: rawIdentifier });
}

console.log(`Total unmatched chapters: ${unmatched.length}`);
console.log(`Unmatched chapter samples: ${Math.min(10, unmatched.length)}`);
for (let i = 0; i < Math.min(10, unmatched.length); i++) {
  const s = unmatched[i];
  console.log("---");
  console.log(`index: ${s.index}`);
  console.log(JSON.stringify(s.chapter, null, 2));
  console.log(`resolvedComicSlug: "${s.resolvedComicSlug}"`);
}

process.exit(0);
