import { z } from 'zod';

export const comicSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  coverImage: z.string().url().optional(),
  status: z.enum(['Ongoing', 'Completed', 'Hiatus', 'Cancelled']),
  authorId: z.number(),
  artistId: z.number(),
  typeId: z.number(),
  genreIds: z.array(z.number()),
  rating: z.number().min(0).max(10).optional(),
  views: z.number().optional(),
  releaseYear: z.number().optional(),
});

export const chapterSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  chapterNumber: z.number().min(1),
  comicId: z.number(),
  images: z.array(z.string().url()),
  publishedAt: z.date().optional(),
  views: z.number().optional(),
});

export const genreSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
});

export const authorSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  bio: z.string().optional(),
  photo: z.string().url().optional(),
});

export const artistSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  bio: z.string().optional(),
  photo: z.string().url().optional(),
});

export const typeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
});

export type ComicInput = z.infer<typeof comicSchema>;
export type ChapterInput = z.infer<typeof chapterSchema>;
export type GenreInput = z.infer<typeof genreSchema>;
export type AuthorInput = z.infer<typeof authorSchema>;
export type ArtistInput = z.infer<typeof artistSchema>;
export type TypeInput = z.infer<typeof typeSchema>;
