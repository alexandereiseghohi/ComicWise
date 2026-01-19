"use server";

import { comicDal, comicToGenreDal } from "@/dal";
import type { ComicFormData } from "@/lib/validations";
import { comicFormSchema } from "@/lib/validations";
import { redirect } from "next/navigation";
import { slugify } from "utils";

export async function createComicAction(data: ComicFormData) {
  try {
    const validated = comicFormSchema.parse(data);

    const slug = validated.slug || slugify(validated.title);

    // Check if slug already exists
    const existingBySlug = await comicDal.findBySlug(slug);
    if (existingBySlug) {
      return { success: false, error: "A comic with this slug already exists" };
    }

    const newComic = await comicDal.create({
      title: validated.title,
      slug,
      description: validated.description,
      coverImage: validated.coverImage,
      status: validated.status,
      publicationDate: validated.publicationDate,
      authorId: validated.authorId ? Number.parseInt(validated.authorId) : null,
      artistId: validated.artistId ? Number.parseInt(validated.artistId) : null,
      typeId: validated.typeId ? Number.parseInt(validated.typeId) : null,
      views: 0,
      rating: "0",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!newComic) {
      return { success: false, error: "Failed to create comic" };
    }

    // Handle genres if provided
    if (validated.genreIds && validated.genreIds.length > 0) {
      for (const genreId of validated.genreIds) {
        await comicToGenreDal.create({
          comicId: newComic.id,
          genreId: Number.parseInt(genreId),
        });
      }
    }

    redirect(`/admin/comics/${newComic.id}`);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create comic",
    };
  }
}

export async function updateComicAction(comicId: number, data: ComicFormData) {
  try {
    const validated = comicFormSchema.parse(data);

    const slug = validated.slug || slugify(validated.title);

    // Check if slug already exists (but exclude current comic)
    const existingBySlug = await comicDal.findBySlug(slug);
    if (existingBySlug && existingBySlug.id !== comicId) {
      return { success: false, error: "A comic with this slug already exists" };
    }

    const updated = await comicDal.update(comicId, {
      title: validated.title,
      slug,
      description: validated.description,
      coverImage: validated.coverImage,
      status: validated.status,
      publicationDate: validated.publicationDate,
      authorId: validated.authorId ? Number.parseInt(validated.authorId) : null,
      artistId: validated.artistId ? Number.parseInt(validated.artistId) : null,
      typeId: validated.typeId ? Number.parseInt(validated.typeId) : null,
      updatedAt: new Date(),
    });

    if (!updated) {
      return { success: false, error: "Comic not found" };
    }

    // Update genres if provided
    if (validated.genreIds !== undefined) {
      // Delete existing genres
      await comicToGenreDal.deleteByComicId(comicId);

      // Add new genres
      if (validated.genreIds.length > 0) {
        for (const genreId of validated.genreIds) {
          await comicToGenreDal.create({
            comicId,
            genreId: Number.parseInt(genreId),
          });
        }
      }
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update comic",
    };
  }
}

export async function deleteComicAction(comicId: number) {
  try {
    const deleted = await comicDal.delete(comicId);

    if (!deleted) {
      return { success: false, error: "Comic not found" };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete comic",
    };
  }
}

export async function deleteComicsAction(comicIds: number[]) {
  try {
    if (comicIds.length === 0) {
      return { success: false, error: "No IDs provided" };
    }

    let deletedCount = 0;
    for (const comicId of comicIds) {
      const result = await comicDal.delete(comicId);
      if (result) {
        deletedCount++;
      }
    }

    if (deletedCount === 0) {
      return { success: false, error: "No comics deleted" };
    }

    return { success: true, deletedCount };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete comics",
    };
  }
}
