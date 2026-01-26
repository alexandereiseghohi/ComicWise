/**
 * Avatar Upload Server Action
 * Handles profile image uploads with validation and CDN integration
 */

"use server";

import type { ActionResult } from "@/dto";
import { auth } from "auth";
import { revalidatePath } from "next/cache";

/**
 * Upload avatar image
 * @param formData - FormData containing the image file
 */
export async function uploadAvatar(formData: FormData): Promise<ActionResult<{ url: string }>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Please sign in to upload an avatar",
      };
    }

    const file = formData.get("avatar") as File | null;

    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Please upload JPG, PNG, WebP, or GIF.",
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File too large. Maximum size is 5MB.",
      };
    }

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get upload provider
    const { getUploadProvider } = await import("@/services/upload/factory");
    const provider = await getUploadProvider();

    // Generate filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() ?? "jpg";
    const filename = `avatar-${session.user.id}-${timestamp}.${extension}`;

    // Upload to CDN
    const uploadResult = await provider.upload(buffer, {
      folder: "avatars",
      filename,
      tags: ["avatar", "profile"],
    });

    if (!uploadResult.success) {
      return {
        success: false,
        error: uploadResult.error ?? "Failed to upload image",
      };
    }

    // Update user profile with new image URL
    const { updateUser } = await import("@/database/mutations");
    await updateUser(session.user.id, {
      image: uploadResult.url,
    });

    // Revalidate profile pages
    revalidatePath("/profile");
    revalidatePath("/profile/edit");

    return {
      success: true,
      data: { url: uploadResult.url },
      message: "Avatar updated successfully!",
    };
  } catch (error) {
    console.error("Avatar upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to upload avatar",
    };
  }
}

/**
 * Remove avatar image
 */
export async function removeAvatar(): Promise<ActionResult<unknown>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Please sign in to remove your avatar",
      };
    }

    // Update user profile to remove image
    const { updateUser } = await import("@/database/mutations");
    await updateUser(session.user.id, {
      image: null,
    });

    // Revalidate profile pages
    revalidatePath("/profile");
    revalidatePath("/profile/edit");

    return {
      success: true,
      message: "Avatar removed successfully!",
    };
  } catch (error) {
    console.error("Remove avatar error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove avatar",
    };
  }
}
