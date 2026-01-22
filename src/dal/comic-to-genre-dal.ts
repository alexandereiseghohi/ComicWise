/**
 * Comic To Genre Data Access Layer
 * Handles all database operations for comic-genre relationships
 */

import { db } from "@/database/db";
import { comicToGenre } from "@/database/schema";
import { and, eq } from "drizzle-orm";

export interface ComicToGenreRecord {
  comicId: number;
  genreId: number;
}

class ComicToGenreDal {
  private static instance: ComicToGenreDal;

  private constructor() {}

  static getInstance(): ComicToGenreDal {
    if (!ComicToGenreDal.instance) {
      ComicToGenreDal.instance = new ComicToGenreDal();
    }
    return ComicToGenreDal.instance;
  }

  async create(data: ComicToGenreRecord): Promise<ComicToGenreRecord | undefined> {
    try {
      const result = await db.insert(comicToGenre).values(data).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating comic-genre relationship:", error);
      return undefined;
    }
  }

  async findByComicId(comicId: number): Promise<ComicToGenreRecord[]> {
    try {
      return await db.select().from(comicToGenre).where(eq(comicToGenre.comicId, comicId));
    } catch (error) {
      console.error("Error finding comic-genre relationships by comic ID:", error);
      return [];
    }
  }

  async findByGenreId(genreId: number): Promise<ComicToGenreRecord[]> {
    try {
      return await db.select().from(comicToGenre).where(eq(comicToGenre.genreId, genreId));
    } catch (error) {
      console.error("Error finding comic-genre relationships by genre ID:", error);
      return [];
    }
  }

  async delete(comicId: number, genreId: number): Promise<boolean> {
    try {
      const result = await db
        .delete(comicToGenre)
        .where(and(eq(comicToGenre.comicId, comicId), eq(comicToGenre.genreId, genreId)))
        .returning();
      return result.length > 0;
    } catch (error) {
      console.error("Error deleting comic-genre relationship:", error);
      return false;
    }
  }

  async deleteByComicId(comicId: number): Promise<number> {
    try {
      const result = await db
        .delete(comicToGenre)
        .where(eq(comicToGenre.comicId, comicId))
        .returning();
      return result.length;
    } catch (error) {
      console.error("Error deleting comic-genre relationships by comic ID:", error);
      return 0;
    }
  }

  async deleteByGenreId(genreId: number): Promise<number> {
    try {
      const result = await db
        .delete(comicToGenre)
        .where(eq(comicToGenre.genreId, genreId))
        .returning();
      return result.length;
    } catch (error) {
      console.error("Error deleting comic-genre relationships by genre ID:", error);
      return 0;
    }
  }
}

export const comicToGenreDal = ComicToGenreDal.getInstance();
