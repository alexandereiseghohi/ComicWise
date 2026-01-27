#!/usr/bin/env tsx
import { readFileSync, writeFileSync } from "fs";
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
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
  return t || undefined;
}

function stripStopwords(s: string) {
  if (!s) return s;
  const stop = new Set([
    "the",
    "a",
    "an",
    "of",
    "and",
    "to",
    "in",
    "on",
    "for",
    "with",
    "by",
    "from",
    "chapter",
    "chap",
    "ch",
    "vol",
    "volume",
    "part",
    "pt",
  ]);
  return s
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((t) => t.toLowerCase())
    .filter((t) => !stop.has(t))
    .join(" ");
}

function romanToNumber(r: string) {
  if (!r) return NaN;
  const map: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let s = r.toUpperCase().trim();
  if (!/^[IVXLCDM]+$/.test(s)) return NaN;
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const val = map[s[i]];
    const next = map[s[i + 1]] || 0;
    if (next > val) total -= val;
    else total += val;
  }
  return total;
}

function replaceRomanNumerals(s: string) {
  return s.replace(/\b(IV|V?I{0,3}|IX|X|XL|L|XC|C|CD|D|CM|M{1,4})\b/gi, (m) => {
    const n = romanToNumber(m);
    return isNaN(n) ? m : String(n);
  });
}

function levenshtein(a: string, b: string) {
  if (a === b) return 0;
  const al = a.length,
    bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;
  const v0 = new Array(bl + 1).fill(0);
  const v1 = new Array(bl + 1).fill(0);
  for (let j = 0; j <= bl; j++) v0[j] = j;
  for (let i = 0; i < al; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < bl; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= bl; j++) v0[j] = v1[j];
  }
  return v1[bl];
}

function extractSlugFromUrl(url?: string) {
  if (!url || typeof url !== "string") return undefined;
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("series");
    if (idx >= 0 && parts.length > idx + 1) return parts[idx + 1];
  } catch (e) {
    // ignore
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
    for (const k of keys)
      if (Array.isArray((parsed as any)[k])) return (parsed as any)[k].map(transformItem);
    let largest: any[] = [];
    for (const v of Object.values(parsed))
      if (Array.isArray(v) && v.length > largest.length) largest = v as any[];
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
          if (Array.isArray((parsed as any)[k]))
            out = out.concat((parsed as any)[k].map(transformItem));
        if (out.length === 0) {
          let largest: any[] = [];
          for (const v of Object.values(parsed))
            if (Array.isArray(v) && v.length > largest.length) largest = v as any[];
          if (largest.length) out = out.concat(largest.map(transformItem));
          else out.push(transformItem(parsed));
        }
      }
    } catch (e) {
      console.warn(`Failed to load ${f}: ${e}`);
    }
  }
  return out;
}

const comicsA = loadJson("./comics.json");
const comicsB = loadPattern("./comicsdata*.json");
const comics = comicsA.concat(comicsB);
const chaptersA = loadJson("./chapters.json");
const chaptersB = loadPattern("./chaptersdata*.json");
const chapters = chaptersA.concat(chaptersB);

const slugMap = new Map<string, any>();
const titleMap = new Map<string, any>();
for (const c of comics) {
  if (c.slug) {
    slugMap.set(String(c.slug), c);
    const ns = normalizeToSlug(c.slug);
    if (ns) slugMap.set(ns, c);
  }
  if (c.title) {
    titleMap.set(String(c.title).toLowerCase().trim(), c);
    const tnorm = String(c.title)
      .replace(/[^a-z0-9]+/gi, "")
      .toLowerCase()
      .trim();
    if (tnorm) titleMap.set(tnorm, c);
  }
}

const mapped: any[] = [];
const unmatched: any[] = [];
for (let i = 0; i < chapters.length; i++) {
  const ch = chapters[i];
  const rawIdentifier = ch.comicslug || ch.comic || ch.comictitle || undefined;
  const rawIdentifierStr = rawIdentifier != null ? String(rawIdentifier) : undefined;
  let comicRow: any = null;

  if (rawIdentifier) {
    if (rawIdentifierStr && slugMap.has(rawIdentifierStr)) comicRow = slugMap.get(rawIdentifierStr);
    if (!comicRow) {
      const cand = normalizeToSlug(rawIdentifierStr);
      if (cand && slugMap.has(cand)) comicRow = slugMap.get(cand);
      else if (cand) {
        for (const k of slugMap.keys()) {
          if (k && k.startsWith && (k.startsWith(cand) || cand.startsWith(k) || k.includes(cand))) {
            comicRow = slugMap.get(k);
            break;
          }
        }
      }
    }
    if (!comicRow) {
      const titleKey = String(rawIdentifierStr || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "")
        .trim();
      if (titleMap.has(titleKey)) comicRow = titleMap.get(titleKey);
      else {
        const tkey2 = String(rawIdentifierStr || "")
          .toLowerCase()
          .trim();
        if (titleMap.has(tkey2)) comicRow = titleMap.get(tkey2);
      }
    }
  }

  if (!comicRow) {
    const extracted = extractSlugFromUrl(ch.url as any);
    if (extracted) {
      if (slugMap.has(extracted)) comicRow = slugMap.get(extracted);
      else {
        const cand = normalizeToSlug(extracted);
        if (cand && slugMap.has(cand)) comicRow = slugMap.get(cand);
      }
    }
  }

  if (!comicRow) {
    // aggressive search
    const cand = normalizeToSlug(rawIdentifierStr);
    if (cand) {
      for (const c of comics) {
        const s = c.slug ? normalizeToSlug(c.slug) : undefined;
        if (s && (s === cand || s.startsWith(cand) || cand.startsWith(s) || s.includes(cand))) {
          comicRow = c;
          break;
        }
        const t = c.title
          ? String(c.title)
              .replace(/[^a-z0-9]+/gi, "")
              .toLowerCase()
          : undefined;
        if (t && (t === cand || t.includes(cand) || cand.includes(t))) {
          comicRow = c;
          break;
        }
      }
    }
  }

  // try relaxed normalizers + fuzzy matching
  if (!comicRow && rawIdentifier) {
    const rawStr = String(rawIdentifier || "");
    const romanReplaced = replaceRomanNumerals(rawStr);
    const stripped = stripStopwords(romanReplaced);
    const candNorm = normalizeToSlug(stripped || romanReplaced || rawStr);
    if (candNorm) {
      let best: { dist: number; row: any } | null = null;
      for (const c of comics) {
        const s = c.slug ? normalizeToSlug(c.slug) : undefined;
        const t = c.title
          ? String(c.title)
              .toLowerCase()
              .replace(/[^a-z0-9]+/gi, "")
          : undefined;
        const scomp = s || (t ? normalizeToSlug(t) : undefined) || "";
        const dist = levenshtein(candNorm, scomp);
        const threshold = Math.max(2, Math.floor(Math.min(candNorm.length, scomp.length) * 0.2));
        if (best === null || dist < best.dist) best = { dist, row: c };
        if (dist <= threshold) {
          comicRow = c;
          break;
        }
      }
      if (!comicRow && best && best.dist < Math.max(3, Math.floor(candNorm.length * 0.25))) {
        comicRow = best.row;
      }
    }
  }

  if (!comicRow) {
    unmatched.push({ index: i, chapter: ch, resolvedComicSlug: rawIdentifier });
    continue;
  }

  const chapterNumber = parseInt(ch.chapterNumber || ch.chaptername || "0", 10) || 0;
  mapped.push({
    slug: ch.chapterslug || ch.slug || `c-${Date.now()}`,
    title: ch.title || ch.chaptername || ch.name || "",
    chapterNumber,
    releaseDate: ch.updated_at
      ? new Date(ch.updated_at)
      : ch.updatedAt
        ? new Date(ch.updatedAt)
        : new Date(),
    comicSlug: comicRow.slug || comicRow.title,
    url: ch.url || null,
  });
}

console.log(`Total chapters: ${chapters.length}`);
console.log(`Mapped chapters: ${mapped.length}`);
console.log(`Unmatched chapters: ${unmatched.length}`);
console.log(`Writing .cache/dry-seed-chapters.json with mapped entries (first 100)`);
try {
  writeFileSync(
    join(process.cwd(), ".cache", "dry-seed-chapters.json"),
    JSON.stringify({ mapped: mapped.slice(0, 100), unmatched: unmatched.slice(0, 100) }, null, 2),
    "utf-8"
  );
  console.log("Wrote .cache/dry-seed-chapters.json");
} catch (e) {
  console.warn(`Failed to write dry-seed output: ${e}`);
}

console.log("Sample mapped entries:");
console.log(JSON.stringify(mapped.slice(0, 5), null, 2));

process.exit(0);
