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
    return { success: false, error: "Please sign in to add bookmarks" };
  }

  try {
    await addBookmarkMutation(session.user.id, comicId, undefined, status);
    revalidatePath("/bookmarks");
    revalidatePath(`/comics/${comicId}`);

    return { success: true };
  } catch (error) {
    console.error("Add bookmark error:", error);
    return { success: false, error: "Failed to add bookmark" };
  }
}

export async function removeBookmark(comicId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Please sign in to remove bookmarks" };
  }

  try {
    await removeBookmarkMutation(session.user.id, comicId);
    revalidatePath("/bookmarks");
    revalidatePath(`/comics/${comicId}`);

    return { success: true };
  } catch (error) {
    console.error("Remove bookmark error:", error);
    return { success: false, error: "Failed to remove bookmark" };
  }
}

export async function updateBookmarkStatus(comicId: number, status: BookmarkStatus) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Please sign in to update bookmark" };
  }

  try {
    // TODO: Implement updateBookmarkStatus mutation in database/mutations
    // For now, we'll use addBookmark which should handle upsert
    await addBookmarkMutation(session.user.id, comicId, undefined, status);
    revalidatePath("/bookmarks");
    revalidatePath(`/comics/${comicId}`);

    return { success: true };
  } catch (error) {
    console.error("Update bookmark status error:", error);
    return { success: false, error: "Failed to update bookmark status" };
  }
}

export async function updateProgress(comicId: number, chapterId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Please sign in to update progress" };
  }

  try {
    await updateReadingProgressMutation(session.user.id, comicId, chapterId);
    revalidatePath("/bookmarks");

    return { success: true };
  } catch (error) {
    console.error("Update progress error:", error);
    return { success: false, error: "Failed to update reading progress" };
  }
}

export async function getBookmarks() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await getUserBookmarks(session.user.id);
}
