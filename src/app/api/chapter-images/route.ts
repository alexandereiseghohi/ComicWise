// ═══════════════════════════════════════════════════
// CHAPTER IMAGES API - Manage Chapter Page Images
// ═══════════════════════════════════════════════════

import {
  createChapterImage,
  createChapterImages,
  deleteChapterImage,
  updateChapterImage,
} from "@/database/mutations/chapter-images";
import { getChapterImages } from "@/database/queries/chapter-images";
import {
  batchCreateChapterImagesSchema,
  batchDeleteSchema,
  batchUpdateChapterImagesSchema,
  createChapterImageSchema,
} from "@/lib/validations";
import { auth } from "auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ═══════════════════════════════════════════════════
// GET - List Chapter Images
// ═══════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const chapterId = searchParams.get("chapterId");

    if (!chapterId) {
      return NextResponse.json({ error: "Chapter ID is required" }, { status: 400 });
    }

    const images = await getChapterImages(Number.parseInt(chapterId));

    return NextResponse.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error("Get chapter images error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch chapter images",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// POST - Create Single Chapter Image or Batch Create
// ═══════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Check if batch operation
    if (body.images && Array.isArray(body.images)) {
      const validation = batchCreateChapterImagesSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { error: "Invalid input", details: validation.error.issues },
          { status: 400 }
        );
      }

      const images = await createChapterImages(
        validation.data.images.map((img) => ({
          ...img,
          chapterId: validation.data.chapterId,
        }))
      );

      return NextResponse.json(
        {
          success: true,
          data: images,
          message: `${images.length} chapter images created successfully`,
        },
        { status: 201 }
      );
    } else {
      // Single image creation
      const validation = createChapterImageSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { error: "Invalid input", details: validation.error.issues },
          { status: 400 }
        );
      }

      const image = await createChapterImage(validation.data);

      return NextResponse.json(
        {
          success: true,
          data: image,
          message: "Chapter image created successfully",
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Create chapter image error:", error);
    return NextResponse.json(
      {
        error: "Failed to create chapter image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// PATCH - Update Chapter Images (Reorder or Update)
// ═══════════════════════════════════════════════════

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Batch update image order
    if (body.images && Array.isArray(body.images)) {
      const validation = batchUpdateChapterImagesSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { error: "Invalid input", details: validation.error.issues },
          { status: 400 }
        );
      }

      const updatedImages = await Promise.all(
        validation.data.images.map((img: { id: number; pageNumber: number }) =>
          updateChapterImage(img.id, { pageNumber: img.pageNumber })
        )
      );

      return NextResponse.json({
        success: true,
        data: updatedImages,
        message: "Chapter images reordered successfully",
      });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Update chapter images error:", error);
    return NextResponse.json(
      {
        error: "Failed to update chapter images",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// DELETE - Delete Chapter Images (Single or Batch)
// ═══════════════════════════════════════════════════

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (session?.user?.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const validation = batchDeleteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const deletedImages = await Promise.all(
      validation.data.ids.map((id: number) => deleteChapterImage(id))
    );

    return NextResponse.json({
      success: true,
      message: `${deletedImages.length} chapter images deleted successfully`,
    });
  } catch (error) {
    console.error("Delete chapter images error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete chapter images",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
