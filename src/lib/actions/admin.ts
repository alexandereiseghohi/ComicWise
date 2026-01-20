"use server";

import * as mutations from "@/database/mutations";
import { ActionResult } from "@/dto";
import { error, success } from "@/lib/actions/utils";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Admin-only action: Delete a user
 * Requires admin role
 */
export async function deleteUserAsAdmin(userId: string): Promise<ActionResult<void>> {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return error("Unauthorized: Admin access required");
    }

    // Prevent self-deletion
    if (session.user.id === userId) {
      return error("Cannot delete your own account");
    }

    // Delete user
    await mutations.deleteUser(userId);
    revalidatePath("/admin/users");

    return success(void 0, "User deleted successfully");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete user";
    return error(message);
  }
}

/**
 * Admin-only action: Update a user's role
 */
export async function updateUserRoleAsAdmin(
  userId: string,
  role: "user" | "admin" | "moderator"
): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return error("Unauthorized: Admin access required");
    }

    // Prevent self-demotion
    if (session.user.id === userId && role !== "admin") {
      return error("Cannot remove admin role from yourself");
    }

    // Update user role
    await mutations.updateUserRole(userId, role);
    revalidatePath("/admin/users");

    return success(void 0, `User role updated to ${role}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update user role";
    return error(message);
  }
}

/**
 * Admin-only action: Delete a comic
 */
export async function deleteComicAsAdmin(comicId: number): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return error("Unauthorized: Admin access required");
    }

    await mutations.deleteComic(comicId);
    revalidatePath("/admin/comics");

    return success(void 0, "Comic deleted successfully");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete comic";
    return error(message);
  }
}

/**
 * Admin-only action: Delete a chapter
 */
export async function deleteChapterAsAdmin(chapterId: number): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return error("Unauthorized: Admin access required");
    }

    await mutations.deleteChapter(chapterId);
    revalidatePath("/admin/chapters");

    return success(void 0, "Chapter deleted successfully");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete chapter";
    return error(message);
  }
}

/**
 * Admin-only action: Delete a genre
 */
export async function deleteGenreAsAdmin(genreId: number): Promise<ActionResult<void>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return error("Unauthorized: Admin access required");
    }

    await mutations.deleteGenre(genreId);
    revalidatePath("/admin/genres");

    return success(void 0, "Genre deleted successfully");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete genre";
    return error(message);
  }
}

/**
 * Admin-only action: Bulk delete users
 */
export async function bulkDeleteUsers(
  userIds: string[]
): Promise<ActionResult<{ deletedCount: number }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return error("Unauthorized: Admin access required");
    }

    if (userIds.length === 0) {
      return error("No users selected for deletion");
    }

    // Prevent deleting self
    const filteredIds = userIds.filter((id) => id !== session.user?.id);
    if (filteredIds.length === 0) {
      return error("Cannot delete yourself");
    }

    // Delete users
    for (const userId of filteredIds) {
      await mutations.deleteUser(userId);
    }

    revalidatePath("/admin/users");

    return success(
      { deletedCount: filteredIds.length },
      `${filteredIds.length} user(s) deleted successfully`
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete users";
    return error(message);
  }
}

/**
 * Admin-only action: Bulk delete comics
 */
export async function bulkDeleteComics(
  comicIds: number[]
): Promise<ActionResult<{ deletedCount: number }>> {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return error("Unauthorized: Admin access required");
    }

    if (comicIds.length === 0) {
      return error("No comics selected for deletion");
    }

    for (const comicId of comicIds) {
      await mutations.deleteComic(comicId);
    }

    revalidatePath("/admin/comics");

    return success(
      { deletedCount: comicIds.length },
      `${comicIds.length} comic(s) deleted successfully`
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete comics";
    return error(message);
  }
}
