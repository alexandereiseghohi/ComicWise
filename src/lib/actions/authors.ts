"use server";

import appConfig, { checkRateLimit } from "@/appConfig";
import * as mutations from "@/database/mutations";
import type { ActionResult } from "@/dto";
import { error } from "@/lib/actions/utils";
import { createAuthorSchema, updateAuthorSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import z from "zod";

export async function createAuthor(formData: FormData): Promise<ActionResult<{ id: number }>> {
  try {
    // Rate limiting
    const rateLimit = await checkRateLimit("create:author", {
      limit: appConfig.rateLimit.default ?? 10,
    });
    if (!rateLimit.allowed) {
      return error("Too many requests. Please try again later.");
    }

    const data = createAuthorSchema.parse({
      name: formData.get("name"),
      bio: formData.get("bio") || undefined,
      image: formData.get("image") || undefined,
    });

    const cleanData = {
      name: data.name,
      bio: data.bio ?? undefined,
      image: data.image ?? undefined,
    };

    const author = await mutations.createAuthor(cleanData);
    if (!author) {
      return error("Failed to create author");
    }

    revalidatePath("/admin/authors");
    return { success: true, data: { id: author.id } };
  } catch (error_) {
    if (error_ instanceof z.ZodError) {
      return error(error_.issues[0]?.message || "Validation error");
    }
    console.error("Create author error:", error_);
    return error("Failed to create author");
  }
}

export async function updateAuthor(
  authorId: number,
  formData: FormData
): Promise<ActionResult<unknown>> {
  try {
    const data = updateAuthorSchema.parse({
      name: formData.get("name") || undefined,
      bio: formData.get("bio") || undefined,
      image: formData.get("image") || undefined,
    });

    await mutations.updateAuthor(authorId, data);
    revalidatePath("/admin/authors");
    revalidatePath(`/admin/authors/${authorId}`);

    return { success: true };
  } catch (error_) {
    if (error_ instanceof z.ZodError) {
      return error(error_.issues[0]?.message || "Validation error");
    }
    console.error("Update author error:", error_);
    return error("Failed to update author");
  }
}

export async function deleteAuthor(authorId: number): Promise<ActionResult<unknown>> {
  try {
    await mutations.deleteAuthor(authorId);
    revalidatePath("/admin/authors");

    return { success: true };
  } catch (error_) {
    console.error("Delete author error:", error_);
    return error("Failed to delete author");
  }
}
