import { z } from "zod";

// helper to accept either a string or an object like { url, src, path, filename }
const stringFromPossibleObj = z.preprocess((val) => {
  if (typeof val === "string") return val;
  if (val && typeof val === "object") {
    // pick common properties that may hold the url/path or identifier
    const v: any = val as any;
    return v.url || v.src || v.path || v.filename || v.slug || v.id || v.title || undefined;
  }
  return val;
}, z.string());

export const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email(),
  image: z.string().optional(),
  role: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const comicSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  url: z.string().optional(),
  images: z.array(stringFromPossibleObj).optional(),
  cover: stringFromPossibleObj.optional(),
  author: z.string().optional(),
  artist: z.string().optional(),
  genres: z.array(z.string()).optional(),
});

export const chapterSchema = z.object({
  url: z.string().optional(),
  title: z.string().optional(),
  slug: z.string().optional(),
  // comic field in chapter data may be a string (slug/id) or an object; accept both
  comic: stringFromPossibleObj.optional(),
  images: z.array(stringFromPossibleObj).optional(),
  updatedAt: z.string().optional(),
});

export function normalizeImagePath(value?: string) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // ensure leading slash
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
