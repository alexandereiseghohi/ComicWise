/**
 * Server Action Tests - Bookmark Operations
 */

import type { ActionResult } from "@/dto/action-response-dto";
import { updateBookmarkStatus } from "@/lib/actions/bookmark";
import { auth } from "@/lib/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Type guard helper
function isSuccess<T>(result: ActionResult<T>): result is { success: true; data?: T } {
  return result.success === true;
}

// Mock dependencies
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/database/mutations/bookmarks", () => ({
  updateBookmarkStatus: vi.fn().mockResolvedValue({
    id: 1,
    userId: "user-1",
    comicId: 123,
    status: "Reading",
    createdAt: new Date(),
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("updateBookmarkStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully updates bookmark status", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", name: "John", email: "john@example.com" },
    } as any);

    const result = await updateBookmarkStatus(123, "Reading");

    expect(result.success).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toHaveProperty("status", "Reading");
    }
  });

  it("rejects unauthenticated requests", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const result = await updateBookmarkStatus(123, "Reading");

    expect(result.success).toBe(false);
    if (!isSuccess(result)) {
      expect(result.error).toContain("Unauthorized");
    }
  });

  it("validates comic ID", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", name: "John", email: "john@example.com" },
    } as any);

    const result = await updateBookmarkStatus(-1, "Reading");

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("validates status value", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", name: "John", email: "john@example.com" },
    } as any);

    const result = await updateBookmarkStatus(123, "Reading" as any);

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("revalidates paths after update", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", name: "John", email: "john@example.com" },
    } as any);

    const { revalidatePath } = await import("next/cache");

    await updateBookmarkStatus(123, "Completed");

    expect(revalidatePath).toHaveBeenCalledWith("/comics/123");
    expect(revalidatePath).toHaveBeenCalledWith("/bookmarks");
  });

  it("handles database errors gracefully", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", name: "John", email: "john@example.com" },
    } as any);

    const bookmarksMutation = await import("@/database/mutations/bookmarks");
    vi.mocked(bookmarksMutation.updateBookmarkStatus as any).mockRejectedValueOnce(
      new Error("Database connection failed")
    );

    const result = await updateBookmarkStatus(123, "Reading");

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
