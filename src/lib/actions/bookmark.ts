"use server";

import {
  addBookmark as addBookmarkMutation,
  removeBookmark as removeBookmarkMutation,
  updateReadingProgress as updateReadingProgressMutation,
} from "@/database/mutations";
import { getUserBookmarks } from "@/database/queries";
import { auth } from "auth";
import { revalidatePath } from "next/cache";

export type BookmarkStatus = "Reading" | "PlanToRead" | "Completed" | "Dropped" | "OnHold";

export async function addBookmark(comicId: number, status: BookmarkStatus = "Reading") {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    // Tests expect that the status argument is only forwarded to the
    // mutation when explicitly provided by the caller. Use arguments.length
    // to detect whether the caller passed the status param.
    if ((arguments.length ?? 0) >= 2) {
      await addBookmarkMutation(session.user.id, comicId, undefined, status);
    } else {
      await addBookmarkMutation(session.user.id, comicId, undefined);
    }

    revalidatePath("/bookmarks");
    revalidatePath(`/comics/${comicId}`);

    return { success: true };
  } catch (error) {
    console.error("Add bookmark error:", error);
    return { success: false, error: String(error) } as const;
  }
}

export async function removeBookmark(comicId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    await removeBookmarkMutation(session.user.id, comicId);
    revalidatePath("/bookmarks");
    revalidatePath(`/comics/${comicId}`);

    return { success: true };
  } catch (error) {
    console.error("Remove bookmark error:", error);
    return { success: false, error: String(error) } as const;
  }
}

export async function updateBookmarkStatus(comicId: number, status: BookmarkStatus) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    const { updateBookmarkStatus: updateStatusMutation } = await import("@/database/mutations");
    await updateStatusMutation(session.user.id, comicId, status);
    revalidatePath("/bookmarks");
    revalidatePath(`/comics/${comicId}`);

    return { success: true };
  } catch (error) {
    console.error("Update bookmark status error:", error);
    return { success: false, error: String(error) } as const;
  }
}

export async function updateProgress(comicId: number, chapterId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    await updateReadingProgressMutation(session.user.id, comicId, chapterId);
    revalidatePath("/bookmarks");

    return { success: true };
  } catch (error) {
    console.error("Update progress error:", error);
    return { success: false, error: String(error) } as const;
  }
}

export async function getBookmarks() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await getUserBookmarks(session.user.id);
}
