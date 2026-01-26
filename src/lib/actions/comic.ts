"use server";

import {
  createComic as createComicMutation,
  deleteComic as deleteComicMutation,
  updateComic as updateComicMutation,
} from "@/database/mutations";
import { getAllComics } from "@/database/queries";
import { getComicById as getComicByIdQuery } from "@/database/queries/admin-comics";
import type { createComicSchema, updateComicSchema } from "@/lib/validations";
import type { ComicFilters } from "@/types";
import { auth } from "auth";
import { revalidatePath } from "next/cache";
import type z from "zod";

export async function getComics(filters?: ComicFilters) {
  return await getAllComics(filters);
}

export async function getComicById(id: number) {
  return await getComicByIdQuery(id);
}

export async function createComic(data: z.infer<typeof createComicSchema>) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "admin") {
    throw new Error("Unauthorized - Admin only");
  }

  const dataToCreate = { ...data, publicationDate: data.publicationDate ?? new Date() } as any;
  const comic = await createComicMutation(dataToCreate);
  revalidatePath("/comics");
  revalidatePath("/admin/comics");

  return comic;
}

export async function updateComic(id: number, data: z.infer<typeof updateComicSchema>) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (session.user.role !== "admin") {
    throw new Error("Unauthorized - Admin only");
  }

  const comic = await updateComicMutation(id, data);
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
