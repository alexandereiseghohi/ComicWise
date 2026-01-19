import { db as database } from "@/database/db";
import { comment } from "@/database/schema";
import { asc, desc, eq } from "drizzle-orm";

export async function getCommentById(commentId: number) {
  return await database.query.comment.findFirst({
    where: eq(comment.id, commentId),
    with: {
      user: true,
    },
  });
}

export async function getCommentsByChapter(
  chapterId: number,
  params?: {
    limit?: number;
    offset?: number;
    sortOrder?: "asc" | "desc";
  }
) {
  const { limit = 20, offset = 0, sortOrder = "desc" } = params || {};

  return await database.query.comment.findMany({
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
    orderBy: sortOrder === "asc" ? asc(comment.createdAt) : desc(comment.createdAt),
    limit,
    offset,
  });
}

export async function getCommentsByUser(
  userId: string,
  params?: {
    limit?: number;
    offset?: number;
  }
) {
  const { limit = 20, offset = 0 } = params || {};

  return await database.query.comment.findMany({
    where: eq(comment.userId, userId),
    orderBy: desc(comment.createdAt),
    limit,
    offset,
  });
}

export async function getCommentCount(chapterId: number) {
  const comments = await database.select().from(comment).where(eq(comment.chapterId, chapterId));
  return comments.length;
}
