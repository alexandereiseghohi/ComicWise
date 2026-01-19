"use server";

import appConfig from "@/appConfig";
import { db as database } from "@/database/db";
import { bookmark, comment } from "@/database/schema";
import type { ActionResult } from "@/dto";
import type {
  CreateBookmarkInput,
  CreateCommentInput,
  PaginationInput,
  UpdateBookmarkInput,
  UpdateCommentInput,
} from "@/lib/validations";
import {
  createBookmarkSchema,
  createCommentSchema,
  paginationSchema,
  updateBookmarkSchema,
  updateCommentSchema,
} from "@/lib/validations";
import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ═══════════════════════════════════════════════════
// BOOKMARKS
// ═══════════════════════════════════════════════════

export async function createBookmark(
  input: CreateBookmarkInput
): Promise<ActionResult<typeof bookmark.$inferSelect>> {
  try {
    const validated = createBookmarkSchema.parse(input);

    // Check if bookmark already exists
    const existing = await database.query.bookmark.findFirst({
      where: and(eq(bookmark.userId, validated.userId), eq(bookmark.comicId, validated.comicId)),
    });

    if (existing) {
      return { success: false, error: "Comic already bookmarked" };
    }

    const [newBookmark] = await database.insert(bookmark).values(validated).returning();

    if (!newBookmark) {
      return { success: false, error: "Failed to create bookmark" };
    }

    revalidatePath(`/comics/${validated.comicId}`);
    revalidatePath("/bookmarks");

    return {
      success: true,
      data: newBookmark,
      message: "Bookmark added successfully",
    };
  } catch (error) {
    console.error("Create bookmark error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create bookmark",
    };
  }
}

export async function updateBookmark(
  userId: string,
  comicId: number,
  input: UpdateBookmarkInput
): Promise<ActionResult<typeof bookmark.$inferSelect>> {
  try {
    const validated = updateBookmarkSchema.parse(input);

    const [updatedBookmark] = await database
      .update(bookmark)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(and(eq(bookmark.userId, userId), eq(bookmark.comicId, comicId)))
      .returning();

    if (!updatedBookmark) {
      return { success: false, error: "Bookmark not found" };
    }

    revalidatePath(`/comics/${comicId}`);
    revalidatePath("/bookmarks");

    return {
      success: true,
      data: updatedBookmark,
      message: "Bookmark updated successfully",
    };
  } catch (error) {
    console.error("Update bookmark error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update bookmark",
    };
  }
}

export async function deleteBookmark(userId: string, comicId: number): Promise<ActionResult<void>> {
  try {
    const existing = await database.query.bookmark.findFirst({
      where: and(eq(bookmark.userId, userId), eq(bookmark.comicId, comicId)),
    });

    if (!existing) {
      return { success: false, error: "Bookmark not found" };
    }

    await database
      .delete(bookmark)
      .where(and(eq(bookmark.userId, userId), eq(bookmark.comicId, comicId)));

    revalidatePath(`/comics/${comicId}`);
    revalidatePath("/bookmarks");

    return {
      success: true,
      data: undefined,
      message: "Bookmark removed successfully",
    };
  } catch (error) {
    console.error("Delete bookmark error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete bookmark",
    };
  }
}

export async function getUserBookmarks(userId: string, input?: PaginationInput) {
  try {
    const validated = paginationSchema.parse(input || {});
    const { page = 1, limit = appConfig.pagination?.defaultLimit ?? 12 } = validated;

    const offset = (page - 1) * limit;

    const [countResult] = await database
      .select({ count: sql<number>`count(*)` })
      .from(bookmark)
      .where(eq(bookmark.userId, userId));

    const total = countResult?.count || 0;

    const results = await database.query.bookmark.findMany({
      where: eq(bookmark.userId, userId),
      with: {
        comic: {
          with: {
            author: true,
            type: true,
          },
        },
      },
      limit,
      offset,
      orderBy: [desc(bookmark.updatedAt)],
    });

    return {
      success: true,
      data: {
        bookmarks: results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get user bookmarks error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get bookmarks",
    };
  }
}

export async function checkBookmarkExists(userId: string, comicId: number) {
  try {
    const exists = await database.query.bookmark.findFirst({
      where: and(eq(bookmark.userId, userId), eq(bookmark.comicId, comicId)),
    });

    return { success: true, data: !!exists };
  } catch (error) {
    console.error("Check bookmark error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to check bookmark",
    };
  }
}

// ═══════════════════════════════════════════════════
// COMMENTS
// ═══════════════════════════════════════════════════

export async function createComment(
  input: CreateCommentInput
): Promise<ActionResult<typeof comment.$inferSelect>> {
  try {
    const validated = createCommentSchema.parse(input);

    // Rate limiting
    // TODO: Implement actual rate limiting check

    const [newComment] = await database.insert(comment).values(validated).returning();

    if (!newComment) {
      return { success: false, error: "Failed to create comment" };
    }

    // Get chapter and comic info for notifications
    // TODO: Implement comment notification emails

    revalidatePath(`/read/${validated.chapterId}`);

    return {
      success: true,
      data: newComment,
      message: "Comment posted successfully",
    };
  } catch (error) {
    console.error("Create comment error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create comment",
    };
  }
}

export async function updateComment(
  id: number,
  userId: string,
  input: UpdateCommentInput
): Promise<ActionResult<typeof comment.$inferSelect>> {
  try {
    const validated = updateCommentSchema.parse(input);

    // Verify ownership
    const existing = await database.query.comment.findFirst({
      where: eq(comment.id, id),
    });

    if (!existing) {
      return { success: false, error: "Comment not found" };
    }

    if (existing.userId !== userId) {
      return { success: false, error: "Unauthorized to edit this comment" };
    }

    const [updatedComment] = await database
      .update(comment)
      .set({
        ...validated,
        updatedAt: new Date(),
      })
      .where(eq(comment.id, id))
      .returning();

    if (!updatedComment) {
      return { success: false, error: "Failed to update comment" };
    }

    revalidatePath(`/read/${existing.chapterId}`);

    return {
      success: true,
      data: updatedComment,
      message: "Comment updated successfully",
    };
  } catch (error) {
    console.error("Update comment error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update comment",
    };
  }
}

export async function deleteComment(id: number, userId: string): Promise<ActionResult<void>> {
  try {
    const existing = await database.query.comment.findFirst({
      where: eq(comment.id, id),
    });

    if (!existing) {
      return { success: false, error: "Comment not found" };
    }

    // Check ownership or admin
    // TODO: Add admin check
    if (existing.userId !== userId) {
      return { success: false, error: "Unauthorized to delete this comment" };
    }

    await database.delete(comment).where(eq(comment.id, id));

    revalidatePath(`/read/${existing.chapterId}`);

    return {
      success: true,
      data: undefined,
      message: "Comment deleted successfully",
    };
  } catch (error) {
    console.error("Delete comment error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete comment",
    };
  }
}

export async function getCommentsByChapter(chapterId: number, input?: PaginationInput) {
  try {
    const validated = paginationSchema.parse(input || {});
    const { page = 1, limit = appConfig.pagination?.defaultLimit ?? 12 } = validated;

    const offset = (page - 1) * limit;

    const [countResult] = await database
      .select({ count: sql<number>`count(*)` })
      .from(comment)
      .where(eq(comment.chapterId, chapterId));

    const total = countResult?.count || 0;

    const results = await database.query.comment.findMany({
      where: eq(comment.chapterId, chapterId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
      limit,
      offset,
      orderBy: [desc(comment.createdAt)],
    });

    return {
      success: true,
      data: {
        comments: results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get comments error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get comments",
    };
  }
}

export async function getUserComments(userId: string, input?: PaginationInput) {
  try {
    const validated = paginationSchema.parse(input || {});
    const { page = 1, limit = appConfig.pagination?.defaultLimit ?? 12 } = validated;

    const offset = (page - 1) * limit;

    const [countResult] = await database
      .select({ count: sql<number>`count(*)` })
      .from(comment)
      .where(eq(comment.userId, userId));

    const total = countResult?.count || 0;

    const results = await database.query.comment.findMany({
      where: eq(comment.userId, userId),
      with: {
        chapter: {
          with: {
            comic: true,
          },
        },
      },
      limit,
      offset,
      orderBy: [desc(comment.createdAt)],
    });

    return {
      success: true,
      data: {
        comments: results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("Get user comments error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get comments",
    };
  }
}

// ═══════════════════════════════════════════════════
// ADMIN: Delete Any Comment
// ═══════════════════════════════════════════════════

export async function deleteCommentAdmin(id: number): Promise<ActionResult<void>> {
  try {
    const existing = await database.query.comment.findFirst({
      where: eq(comment.id, id),
    });

    if (!existing) {
      return { success: false, error: "Comment not found" };
    }

    await database.delete(comment).where(eq(comment.id, id));

    revalidatePath(`/read/${existing.chapterId}`);
    revalidatePath("/admin/comments");

    return {
      success: true,
      data: undefined,
      message: "Comment deleted successfully",
    };
  } catch (error) {
    console.error("Delete comment error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete comment",
    };
  }
}

export async function listAllComments(input?: PaginationInput) {
  try {
    const validated = paginationSchema.parse(input || {});
    const { page = 1, limit = appConfig.pagination?.defaultLimit ?? 12 } = validated;

    const offset = (page - 1) * limit;

    const [countResult] = await database.select({ count: sql<number>`count(*)` }).from(comment);

    const total = countResult?.count || 0;

    const results = await database.query.comment.findMany({
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        chapter: {
          with: {
            comic: true,
          },
        },
      },
      limit,
      offset,
      orderBy: [desc(comment.createdAt)],
    });

    return {
      success: true,
      data: {
        comments: results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error) {
    console.error("List comments error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list comments",
    };
  }
}
