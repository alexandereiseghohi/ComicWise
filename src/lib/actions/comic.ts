"use server";

import {
  createComic as createComicMutation,
  deleteComic as deleteComicMutation,
  updateComic as updateComicMutation,
} from "@/database/mutations";
import { getAllComics, getComic as getComicQuery } from "@/database/queries";
import { createComicSchema, updateComicSchema } from "@/lib/validations";
import type { ComicFilters } from "@/types";
import { auth } from "auth";
import { revalidatePath } from "next/cache";

export async function getComics(filters?: ComicFilters) {
  return await getAllComics(filters);
}

export async function getComicById(id: number) {
  // Delegate to the central queries module (tests mock this module).
  return await getComicQuery(id as any);
}

export async function createComic(data: unknown) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "admin") {
    throw new Error("Unauthorized - Admin only");
  }

  const parsed = createComicSchema.parse(data);
  const dataToCreate = { ...parsed, publicationDate: parsed.publicationDate ?? new Date() } as any;
  const comic = await createComicMutation(dataToCreate);
  revalidatePath("/comics");
  revalidatePath("/admin/comics");

  return comic;
}

export async function updateComic(id: number, data: unknown) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "admin") {
    throw new Error("Unauthorized - Admin only");
  }

  const parsed = updateComicSchema.parse(data);
  const comic = await updateComicMutation(id, parsed as any);
  revalidatePath("/comics");
  revalidatePath(`/comics/${id}`);
  revalidatePath("/admin/comics");

  return comic;
}

export async function deleteComic(id: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "admin") {
    throw new Error("Unauthorized - Admin only");
  }

  await deleteComicMutation(id);
  revalidatePath("/comics");
  revalidatePath("/admin/comics");

  return { success: true };
}
