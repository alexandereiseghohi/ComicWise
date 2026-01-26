"use server";

import {
  createChapter as createChapterMutation,
  updateChapter as updateChapterMutation,
} from "@/database/mutations";
import { getChapterImages as getChapterImagesMutation } from "@/database/queries";
import type { createChapterSchema, updateChapterSchema } from "@/lib/validations";
import { auth } from "auth";
import { revalidatePath } from "next/cache";

import type { z } from "zod";

export async function getChapterImages(chapterId: number) {
  return await getChapterImagesMutation(chapterId);
}

export async function createChapter(data: z.infer<typeof createChapterSchema>) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "admin") {
    throw new Error("Unauthorized - Admin only");
  }

  const comicIdNum =
    typeof data.comicId === "string" ? Number.parseInt(data.comicId, 10) : data.comicId;
  const createData = {
    ...data,
    comicId: comicIdNum,
    releaseDate: data.releaseDate ?? new Date(),
  } as any;

  const chapter = await createChapterMutation(createData);
  revalidatePath(`/comics/${createData.comicId}`);
  revalidatePath("/admin/chapters");

  return chapter;
}

export async function updateChapter(id: number, data: z.infer<typeof updateChapterSchema>) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "admin") {
    throw new Error("Unauthorized - Admin only");
  }

  const chapter = await updateChapterMutation(id, data);
  revalidatePath(`/comics/${data.comicId}`);
  revalidatePath(`/comics/${data.comicId}/read/${id}`);
  revalidatePath("/admin/chapters");

  return chapter;
}
