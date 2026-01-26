"use server";

import appConfig, { checkRateLimit } from "@/appConfig";
import * as mutations from "@/database/mutations";
import { error } from "@/lib/actions/utils";
import type { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";
import z from "zod";

const commentSchema = z
  .object({
    content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment too long"),
    chapterId: z.coerce.number().int().positive(),
  })
  .strict();

const updateCommentSchema = z
  .object({
    content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment too long"),
  })
  .strict();

export async function createComment(
  userId: string,
  formData: FormData
): Promise<ActionResponse<{ id: number }>> {
  try {
    // Rate limiting - be defensive in case tests mock `appConfig` without
    // providing a default export. Use safe defaults so unit tests can mock
    // the `checkRateLimit` named export independently.
    const defaultLimit = (appConfig && (appConfig.rateLimit as any)?.default) ?? {
      requests: 10,
      window: 10,
    };
    const rateLimit = await checkRateLimit(`comment:${userId}`, {
      limit: defaultLimit,
    });
    if (!rateLimit.allowed) {
      return error("Too many comments. Please try again later.");
    }

    const data = commentSchema.parse({
      content: formData.get("content"),
      chapterId: formData.get("chapterId"),
    });

    const comment = await mutations.createComment({
      ...data,
      userId,
    });
    if (!comment) {
      return error("Failed to create comment");
    }

    revalidatePath(`/comics/[id]/chapters/[chapterId]`);
    return { success: true, data: { id: comment.id } };
  } catch (error_) {
    if (error_ instanceof z.ZodError) {
      return error(error_.issues[0]?.message ?? "Validation error");
    }
    console.error("Create comment error:", error_);
    return error("Failed to create comment");
  }
}

export async function updateComment(
  commentId: number,
  formData: FormData
): Promise<ActionResponse> {
  try {
    const data = updateCommentSchema.parse({
      content: formData.get("content"),
    });

    await mutations.updateComment(commentId, data);
    revalidatePath(`/comics/[id]/chapters/[chapterId]`);

    return { success: true };
  } catch (error_) {
    if (error_ instanceof z.ZodError) {
      return error(error_.issues[0]?.message ?? "Validation error");
    }
    console.error("Update comment error:", error_);
    return error("Failed to update comment");
  }
}

export async function deleteComment(commentId: number): Promise<ActionResponse> {
  try {
    await mutations.deleteComment(commentId);
    revalidatePath(`/comics/[id]/chapters/[chapterId]`);

    return { success: true };
  } catch (error_) {
    console.error("Delete comment error:", error_);
    return error("Failed to delete comment");
  }
}
