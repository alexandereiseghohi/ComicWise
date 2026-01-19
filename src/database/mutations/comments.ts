import { eq } from "drizzle-orm";

import { db as database } from "@/database/db";
import { comment } from "@/database/schema";

/**
 *
 * param data
 * param data.content
 * param data.userId
 * param data.chapterId
 * @param data
 * @param data.content
 * @param data.userId
 * @param data.chapterId
 */
export async function createComment(data: {
  content: string;
  userId: string;
  chapterId: number;
}): Promise<typeof comment.$inferSelect | undefined> {
  const [newComment] = await database
    .insert(comment)
    .values({
      content: data.content,
      userId: data.userId,
      chapterId: data.chapterId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  return newComment;
}

/**
 *
 * param commentId
 * param data
 * param data.content
 * @param commentId
 * @param data
 * @param data.content
 */
export async function updateComment(
  commentId: number,
  data: {
    content?: string;
  }
): Promise<typeof comment.$inferSelect | undefined> {
  const [updatedComment] = await database
    .update(comment)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(comment.id, commentId))
    .returning();
  return updatedComment;
}

/**
 *
 * param commentId
 * @param commentId
 */
export async function deleteComment(
  commentId: number
): Promise<typeof comment.$inferSelect | undefined> {
  const [deletedComment] = await database
    .delete(comment)
    .where(eq(comment.id, commentId))
    .returning();
  return deletedComment;
}
