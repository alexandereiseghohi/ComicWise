/**
 * Comment Data Access Layer
 * Handles all database operations for comments
 */

import type { ListOptions } from "@/dal/baseDal";
import { BaseDal } from "@/dal/baseDal";
import { db } from "@/database/db";
import { comment } from "@/database/schema";
import type { Comment } from "@/types/database";
import { desc, eq } from "drizzle-orm";

// @ts-expect-error - TypeScript limitation: static methods cannot properly override generic static methods
export class CommentDal extends BaseDal<Comment, typeof comment.$inferInsert> {
  private static instance: CommentDal;

  private constructor() {
    super("CommentDal");
  }

  static override getInstance(): CommentDal {
    return BaseDal.getInstance("commentDal", () => new CommentDal());
  }

  override async create(data: typeof comment.$inferInsert): Promise<Comment | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.insert(comment).values(data).returning()),
      "Creating comment",
      { data }
    );
  }

  override async findById(id: number): Promise<Comment | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.select().from(comment).where(eq(comment.id, id))),
      "Finding comment by ID",
      { id }
    );
  }

  override async update(
    id: number,
    data: Partial<typeof comment.$inferInsert>
  ): Promise<Comment | undefined> {
    return this.executeWithLogging(
      async () =>
        this.extractFirst(await db.update(comment).set(data).where(eq(comment.id, id)).returning()),
      "Updating comment",
      { id, data }
    );
  }

  override async delete(id: number): Promise<Comment | undefined> {
    return this.executeWithLogging(
      async () => this.extractFirst(await db.delete(comment).where(eq(comment.id, id)).returning()),
      "Deleting comment",
      { id }
    );
  }

  override async list(options?: ListOptions): Promise<Comment[]> {
    const { limit = 20, offset = 0 } = options ?? {};
    return this.executeWithLogging(
      async () =>
        await db
          .select()
          .from(comment)
          .orderBy(desc(comment.createdAt))
          .limit(limit)
          .offset(offset),
      "Listing comments",
      { limit, offset }
    );
  }

  async findByChapterId(chapterId: number): Promise<Comment[]> {
    return this.executeWithLogging(
      async () =>
        await db
          .select()
          .from(comment)
          .where(eq(comment.chapterId, chapterId))
          .orderBy(desc(comment.createdAt)),
      "Finding comments by chapter ID",
      { chapterId }
    );
  }

  async findReplies(parentId: number): Promise<Comment[]> {
    // Note: Comment schema doesn't have parentId - this functionality may need to be implemented differently
    return this.executeWithLogging(async () => [], "Finding comment replies", { parentId });
  }
}

export const commentDal = CommentDal.getInstance();
