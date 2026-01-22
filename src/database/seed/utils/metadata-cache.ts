/**
 * Metadata Cache
 * Caches metadata entities to reduce database queries
 * Uses database/queries for read operations and direct insert for creation
 */

import { db as database } from "@/database/db";
import * as queries from "@/database/queries";
import { artist, author, genre, type as typeTable } from "@/database/schema";

export class MetadataCache {
  private typeCache = new Map<string, number>();
  private authorCache = new Map<string, number>();
  private artistCache = new Map<string, number>();
  private genreCache = new Map<string, number>();

  async getOrCreateType(name: string): Promise<number> {
    if (this.typeCache.has(name)) {
      return this.typeCache.get(name)!;
    }

    const existing = await queries.getTypeByName(name);

    if (existing) {
      this.typeCache.set(name, existing.id);
      return existing.id;
    }

    const [created] = await database
      .insert(typeTable)
      .values({ name })
      .onConflictDoNothing()
      .returning();

    if (created) {
      this.typeCache.set(name, created.id);
      return created.id;
    }

    // Conflict occurred, refetch
    const refetch = await queries.getTypeByName(name);

    if (refetch) {
      this.typeCache.set(name, refetch.id);
      return refetch.id;
    }

    throw new Error(`Failed to create or fetch type: ${name}`);
  }

  async getOrCreateAuthor(name: string, bio?: string): Promise<number> {
    if (this.authorCache.has(name)) {
      return this.authorCache.get(name)!;
    }

    const existing = await queries.getAuthorByName(name);

    if (existing) {
      this.authorCache.set(name, existing.id);
      return existing.id;
    }

    const [created] = await database
      .insert(author)
      .values({ name, bio: bio || null })
      .onConflictDoNothing()
      .returning();

    if (created) {
      this.authorCache.set(name, created.id);
      return created.id;
    }

    const refetch = await queries.getAuthorByName(name);

    if (refetch) {
      this.authorCache.set(name, refetch.id);
      return refetch.id;
    }

    throw new Error(`Failed to create or fetch author: ${name}`);
  }

  async getOrCreateArtist(name: string, bio?: string): Promise<number> {
    if (this.artistCache.has(name)) {
      return this.artistCache.get(name)!;
    }

    const existing = await queries.getArtistByName(name);

    if (existing) {
      this.artistCache.set(name, existing.id);
      return existing.id;
    }

    const [created] = await database
      .insert(artist)
      .values({ name, bio: bio || null })
      .onConflictDoNothing()
      .returning();

    if (created) {
      this.artistCache.set(name, created.id);
      return created.id;
    }

    const refetch = await queries.getArtistByName(name);

    if (refetch) {
      this.artistCache.set(name, refetch.id);
      return refetch.id;
    }

    throw new Error(`Failed to create or fetch artist: ${name}`);
  }

  async getOrCreateGenre(name: string): Promise<number> {
    if (this.genreCache.has(name)) {
      return this.genreCache.get(name)!;
    }

    const existing = await queries.getGenreByName(name);

    if (existing) {
      this.genreCache.set(name, existing.id);
      return existing.id;
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replaceAll(/[^\s\w-]/g, "")
      .replaceAll(/\s+/g, "-")
      .replaceAll(/-+/g, "-")
      .trim();

    const [created] = await database
      .insert(genre)
      .values({ name, slug })
      .onConflictDoNothing()
      .returning();

    if (created) {
      this.genreCache.set(name, created.id);
      return created.id;
    }

    const refetch = await queries.getGenreByName(name);

    if (refetch) {
      this.genreCache.set(name, refetch.id);
      return refetch.id;
    }

    throw new Error(`Failed to create or fetch genre: ${name}`);
  }

  getStats() {
    return {
      types: this.typeCache.size,
      authors: this.authorCache.size,
      artists: this.artistCache.size,
      genres: this.genreCache.size,
    };
  }
}

export const metadataCache = new MetadataCache();
