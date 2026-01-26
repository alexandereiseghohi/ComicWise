"use server";

import appConfig, { checkRateLimit } from "@/appConfig";
import * as mutations from "@/database/mutations";
import type { ActionResult } from "@/dto";
import { error } from "@/lib/actions/utils";
import { createTypeSchema, updateTypeSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import z from "zod";

export async function createType(formData: FormData): Promise<ActionResult<{ id: number }>> {
  try {
    // Rate limiting
    const rateLimit = await checkRateLimit("create:type", {
      limit: appConfig.rateLimit.default ?? 10,
    });
    if (!rateLimit.allowed) {
      return error("Too many requests. Please try again later.");
    }

    const data = createTypeSchema.parse({
      name: formData.get("name"),
      description: formData.get("description") || undefined,
    });

    const type = await mutations.createType(data);
    if (!type) {
      return error("Failed to create type");
    }

    revalidatePath("/admin/types");
    return { success: true, data: { id: type.id } };
  } catch (error_) {
    if (error_ instanceof z.ZodError) {
      return error(error_.issues[0]?.message ?? "Validation error");
    }
    console.error("Create type error:", error_);
    return error("Failed to create type");
  }
}

export async function updateType(
  typeId: number,
  formData: FormData
): Promise<ActionResult<unknown>> {
  try {
    const data = updateTypeSchema.parse({
      name: formData.get("name") || undefined,
      description: formData.get("description") || undefined,
    });

    await mutations.updateType(typeId, data);
    revalidatePath("/admin/types");
    revalidatePath(`/admin/types/${typeId}`);

    return { success: true };
  } catch (error_) {
    if (error_ instanceof z.ZodError) {
      return error(error_.issues[0]?.message ?? "Validation error");
    }
    console.error("Update type error:", error_);
    return error("Failed to update type");
  }
}

export async function deleteType(typeId: number): Promise<ActionResult<unknown>> {
  try {
    await mutations.deleteType(typeId);
    revalidatePath("/admin/types");

    return { success: true };
  } catch (error_) {
    console.error("Delete type error:", error_);
    return error("Failed to delete type");
  }
}
