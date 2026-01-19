"use server";

import appConfig, { checkRateLimit } from "@/appConfig";
import * as mutations from "@/database/mutations";
import type { ActionResult } from "@/dto";
import { error } from "@/lib/actions/utils";
import { createArtistSchema, updateArtistSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import z from "zod";

export async function createArtist(formData: FormData): Promise<ActionResult<{ id: number }>> {
  try {
    // Rate limiting
    const rateLimit = await checkRateLimit("create:artist", {
      limit: appConfig.rateLimit.default ?? 10,
    });
    if (!rateLimit.allowed) {
      return error("Too many requests. Please try again later.");
    }

    const data = createArtistSchema.parse({
      name: formData.get("name"),
      bio: formData.get("bio") || undefined,
      image: formData.get("image") || undefined,
    });

    const cleanData = {
      name: data.name,
      bio: data.bio ?? undefined,
      image: data.image ?? undefined,
    };

    const artist = await mutations.createArtist(cleanData);
    if (!artist) {
      return error("Failed to create artist");
    }

    revalidatePath("/admin/artists");
    return { success: true, data: { id: artist.id } };
  } catch (error_) {
    if (error_ instanceof z.ZodError) {
      return error(error_.issues[0]?.message || "Validation error");
    }
    console.error("Create artist error:", error_);
    return error("Failed to create artist");
  }
}

export async function updateArtist(
  artistId: number,
  formData: FormData
): Promise<ActionResult<unknown>> {
  try {
    const data = updateArtistSchema.parse({
      name: formData.get("name") || undefined,
      bio: formData.get("bio") || undefined,
      image: formData.get("image") || undefined,
    });

    await mutations.updateArtist(artistId, data);
    revalidatePath("/admin/artists");
    revalidatePath(`/admin/artists/${artistId}`);

    return { success: true };
  } catch (error_) {
    if (error_ instanceof z.ZodError) {
      return error(error_.issues[0]?.message || "Validation error");
    }
    console.error("Update artist error:", error_);
    return error("Failed to update artist");
  }
}

export async function deleteArtist(artistId: number): Promise<ActionResult<unknown>> {
  try {
    await mutations.deleteArtist(artistId);
    revalidatePath("/admin/artists");

    return { success: true };
  } catch (error_) {
    console.error("Delete artist error:", error_);
    return error("Failed to delete artist");
  }
}
