// ═══════════════════════════════════════════════════
// IMAGE UPLOAD API - ImageKit Integration
// ═══════════════════════════════════════════════════

import appConfig from "@/appConfig";
import {
  fileToBuffer,
  generateUniqueFileName,
  uploadAvatar,
  uploadChapterImage,
  uploadComicCover,
  uploadImage,
  validateImageFile,
} from "@/lib/imagekit";
import { auth } from "auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

// ═══════════════════════════════════════════════════
// UPLOAD VALIDATION SCHEMA
// ═══════════════════════════════════════════════════

const uploadSchema = z
  .object({
    file: z.instanceof(File),
    type: z
      .enum(["comic-cover", "chapter-image", "avatar", "general"])
      .optional()
      .default("general"),
    entityId: z.string().optional(),
    sequence: z.number().optional(),
  })
  .strict();

// ═══════════════════════════════════════════════════
// UPLOAD IMAGE API ROUTE
// ═══════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if ImageKit is enabled
    if (!(appConfig.upload.imageKit as any)?.enabled) {
      return NextResponse.json(
        { error: "Image upload is not configured. Please set ImageKit credentials." },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;
    const entityId = formData.get("entityId") as string | null;
    const sequenceString = formData.get("sequence") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file
    const fileValidation = validateImageFile(file);
    if (!fileValidation.valid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 });
    }

    const validation = uploadSchema.safeParse({
      file,
      type: type || "general",
      entityId: entityId || undefined,
      sequence: sequenceString ? Number.parseInt(sequenceString, 10) : undefined,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid upload parameters", details: validation.error.issues },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await fileToBuffer(file);
    const fileName = generateUniqueFileName(file.name, validation.data.type);

    // Upload based on type
    let uploadResult;

    switch (validation.data.type) {
      case "comic-cover":
        if (!entityId) {
          return NextResponse.json(
            { error: "Comic ID is required for cover uploads" },
            { status: 400 }
          );
        }
        uploadResult = await uploadComicCover(buffer, entityId, fileName);
        break;

      case "chapter-image":
        if (!entityId) {
          return NextResponse.json(
            { error: "Chapter ID is required for chapter image uploads" },
            { status: 400 }
          );
        }
        uploadResult = await uploadChapterImage(
          buffer,
          entityId,
          fileName,
          validation.data.sequence
        );
        break;

      case "avatar":
        uploadResult = await uploadAvatar(buffer, session.user.id, fileName);
        break;

      case "general":
      default:
        uploadResult = await uploadImage({
          file: buffer,
          fileName,
          folder: "/comicwise/general",
          tags: ["general", session.user.id],
        });
        break;
    }

    if (!uploadResult.success) {
      return NextResponse.json(
        { error: "Upload failed", details: uploadResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      fileId: uploadResult.fileId,
      name: uploadResult.name,
      size: uploadResult.size,
      thumbnailUrl: uploadResult.thumbnailUrl,
      type: validation.data.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// BATCH UPLOAD API ROUTE
// ═══════════════════════════════════════════════════

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const type = formData.get("type") as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Validate max files
    if (files.length > 50) {
      return NextResponse.json({ error: "Too many files. Maximum is 50" }, { status: 400 });
    }

    const uploadResults: Array<{
      index: number;
      originalName: string;
      url: string;
      filename: string;
      size: number;
      type: string;
    }> = [];
    const errors: Array<{
      index: number;
      filename: string;
      error: string;
    }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file) {
        errors.push({ index: i, filename: "unknown", error: "File is undefined" });
        continue;
      }

      // Validate each file
      const validation = uploadSchema.safeParse({ file, type: type || "other" });

      if (!validation.success) {
        errors.push({ index: i, filename: file.name, error: "Invalid file" });
        continue;
      }

      // Validate file size
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        errors.push({ index: i, filename: file.name, error: "File too large" });
        continue;
      }

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        errors.push({ index: i, filename: file.name, error: "Invalid file type" });
        continue;
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).slice(2, 15);
      const extension = file.name.split(".").pop();
      const filename = `${validation.data.type}-${timestamp}-${i}-${randomString}.${extension}`;

      // Mock upload response
      uploadResults.push({
        index: i,
        originalName: file.name,
        url: `/uploads/${filename}`,
        filename: filename,
        size: file.size,
        type: file.type,
      });
    }

    return NextResponse.json({
      success: true,
      uploaded: uploadResults.length,
      failed: errors.length,
      results: uploadResults,
      errors: errors,
    });
  } catch (error) {
    console.error("Batch upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload files",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
