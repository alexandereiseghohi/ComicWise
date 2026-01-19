// ═══════════════════════════════════════════════════
// COMIC IMAGES API - Manage Comic Gallery Images
// ═══════════════════════════════════════════════════

import {
  createComicImage,
  createComicImages,
  deleteComicImage,
  updateComicImage,
} from "@/database/mutations/comicImages";
import { getComicImages } from "@/database/queries/comicImages";
import {
  batchCreateComicImagesSchema,
  batchDeleteSchema,
  batchUpdateComicImagesSchema,
  createComicImageSchema,
} from "@/lib/validations";
import { auth } from "auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ═══════════════════════════════════════════════════
// GET - List Comic Images
// ═══════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const comicId = searchParams.get("comicId");

    if (!comicId) {
      return NextResponse.json({ error: "Comic ID is required" }, { status: 400 });
    }

    const images = await getComicImages(Number.parseInt(comicId));

    return NextResponse.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error("Get comic images error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch comic images",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// POST - Create Single Comic Image or Batch Create
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
      const validation = batchCreateComicImagesSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { error: "Invalid input", details: validation.error.issues },
          { status: 400 }
        );
      }

      const images = await createComicImages(
        validation.data.images.map((img) => ({
          ...img,
          comicId: validation.data.comicId,
        }))
      );

      return NextResponse.json(
        {
          success: true,
          data: images,
          message: `${images.length} comic images created successfully`,
        },
        { status: 201 }
      );
    } else {
      // Single image creation
      const validation = createComicImageSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { error: "Invalid input", details: validation.error.issues },
          { status: 400 }
        );
      }

      const image = await createComicImage(validation.data);

      return NextResponse.json(
        {
          success: true,
          data: image,
          message: "Comic image created successfully",
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Create comic image error:", error);
    return NextResponse.json(
      {
        error: "Failed to create comic image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// PATCH - Update Comic Images (Reorder or Update)
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
      const validation = batchUpdateComicImagesSchema.safeParse(body);

      if (!validation.success) {
        return NextResponse.json(
          { error: "Invalid input", details: validation.error.issues },
          { status: 400 }
        );
      }

      // Update images individually since no batch function exists
      const updatedImages = await Promise.all(
        validation.data.images.map((img: { id: number; imageOrder: number }) =>
          updateComicImage(img.id, { imageOrder: img.imageOrder })
        )
      );

      return NextResponse.json({
        success: true,
        data: updatedImages,
        message: "Comic images reordered successfully",
      });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Update comic images error:", error);
    return NextResponse.json(
      {
        error: "Failed to update comic images",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════════════════════════
// DELETE - Delete Comic Images (Single or Batch)
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

    // Delete images individually since batchDeleteComicImages doesn't accept ids array
    const deletedImages = await Promise.all(
      validation.data.ids.map((id: number) => deleteComicImage(id))
    );

    return NextResponse.json({
      success: true,
      message: `${deletedImages.length} comic images deleted successfully`,
    });
  } catch (error) {
    console.error("Delete comic images error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete comic images",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
