// ═══════════════════════════════════════════════════
// BOOKMARK ACTIONS - UNIT TESTS
// ═══════════════════════════════════════════════════

import * as mutations from "@/database/mutations";
import * as queries from "@/database/queries";
import { addBookmark, getBookmarks, removeBookmark, updateProgress } from "@/lib/actions/bookmark";
import * as authLib from "auth";
import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("auth");
vi.mock("mutations");
vi.mock("queries");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Bookmark Actions", () => {
  const mockUserId = "user-123";
  const mockComicId = 1;
  const mockChapterId = 10;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════
  // ADD BOOKMARK TESTS
  // ═══════════════════════════════════════════════════

  describe("addBookmark", () => {
    it("should successfully add a bookmark with comic only", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockUserId },
      });
      (mutations.addBookmark as Mock).mockResolvedValue(undefined);

      const result = await addBookmark(mockComicId);

      expect(authLib.auth).toHaveBeenCalledOnce();
      expect(mutations.addBookmark).toHaveBeenCalledWith(mockUserId, mockComicId, undefined);
      expect(result).toEqual({ success: true });
    });

    it("should successfully add a bookmark with comic and chapter", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockUserId },
      });
      (mutations.addBookmark as Mock).mockResolvedValue(undefined);

      const result = await addBookmark(mockComicId, "Reading");

      expect(mutations.addBookmark).toHaveBeenCalledWith(
        mockUserId,
        mockComicId,
        undefined,
        "Reading"
      );
      expect(result).toEqual({ success: true });
    });

    it("should throw error when user is not authenticated", async () => {
      (authLib.auth as Mock).mockResolvedValue(null);

      await expect(addBookmark(mockComicId)).rejects.toThrow("Unauthorized");
      expect(mutations.addBookmark).not.toHaveBeenCalled();
    });

    it("should throw error when user ID is missing", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: null },
      });

      await expect(addBookmark(mockComicId)).rejects.toThrow("Unauthorized");
      expect(mutations.addBookmark).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockUserId },
      });
      (mutations.addBookmark as Mock).mockRejectedValue(new Error("Database error"));

      await expect(addBookmark(mockComicId)).rejects.toThrow("Database error");
    });
  });

  // ═══════════════════════════════════════════════════
  // REMOVE BOOKMARK TESTS
  // ═══════════════════════════════════════════════════

  describe("removeBookmark", () => {
    it("should successfully remove a bookmark", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockUserId },
      });
      (mutations.removeBookmark as Mock).mockResolvedValue(undefined);

      const result = await removeBookmark(mockComicId);

      expect(authLib.auth).toHaveBeenCalledOnce();
      expect(mutations.removeBookmark).toHaveBeenCalledWith(mockUserId, mockComicId);
      expect(result).toEqual({ success: true });
    });

    it("should throw error when user is not authenticated", async () => {
      (authLib.auth as Mock).mockResolvedValue(null);

      await expect(removeBookmark(mockComicId)).rejects.toThrow("Unauthorized");
      expect(mutations.removeBookmark).not.toHaveBeenCalled();
    });

    it("should throw error when user ID is missing", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: {},
      });

      await expect(removeBookmark(mockComicId)).rejects.toThrow("Unauthorized");
      expect(mutations.removeBookmark).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockUserId },
      });
      (mutations.removeBookmark as Mock).mockRejectedValue(new Error("Database error"));

      await expect(removeBookmark(mockComicId)).rejects.toThrow("Database error");
    });

    it("should handle non-existent bookmarks", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockUserId },
      });
      (mutations.removeBookmark as Mock).mockResolvedValue(undefined);

      const result = await removeBookmark(999);

      expect(mutations.removeBookmark).toHaveBeenCalledWith(mockUserId, 999);
      expect(result).toEqual({ success: true });
    });
  });

  // ═══════════════════════════════════════════════════
  // UPDATE PROGRESS TESTS
  // ═══════════════════════════════════════════════════

  describe("updateProgress", () => {
    it("should successfully update reading progress", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockUserId },
      });
      (mutations.updateReadingProgress as Mock).mockResolvedValue(undefined);

      const result = await updateProgress(mockComicId, mockChapterId);

      expect(authLib.auth).toHaveBeenCalledOnce();
      expect(mutations.updateReadingProgress).toHaveBeenCalledWith(
        mockUserId,
        mockComicId,
        mockChapterId
      );
      expect(result).toEqual({ success: true });
    });

    it("should throw error when user is not authenticated", async () => {
      (authLib.auth as Mock).mockResolvedValue(null);

      await expect(updateProgress(mockComicId, mockChapterId)).rejects.toThrow("Unauthorized");
      expect(mutations.updateReadingProgress).not.toHaveBeenCalled();
    });

    it("should throw error when user ID is missing", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: undefined },
      });

      await expect(updateProgress(mockComicId, mockChapterId)).rejects.toThrow("Unauthorized");
      expect(mutations.updateReadingProgress).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockUserId },
      });
      (mutations.updateReadingProgress as Mock).mockRejectedValue(new Error("Database error"));

      await expect(updateProgress(mockComicId, mockChapterId)).rejects.toThrow("Database error");
    });

    it("should handle progress updates with invalid chapter IDs", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockUserId },
      });
      (mutations.updateReadingProgress as Mock).mockRejectedValue(new Error("Chapter not found"));

      await expect(updateProgress(mockComicId, 999999)).rejects.toThrow("Chapter not found");
    });
  });

  // ═══════════════════════════════════════════════════
  // GET BOOKMARKS TESTS
  // ═══════════════════════════════════════════════════

  describe("getBookmarks", () => {
    const mockBookmarks = [
      {
        id: 1,
        userId: mockUserId,
        comicId: 1,
        chapterId: 5,
        createdAt: new Date(),
      },
      {
        id: 2,
        userId: mockUserId,
        comicId: 2,
        chapterId: 3,
        createdAt: new Date(),
      },
    ];

    it("should successfully retrieve user bookmarks", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockUserId },
      });
      (queries.getUserBookmarks as Mock).mockResolvedValue(mockBookmarks);

      const result = await getBookmarks();

      expect(authLib.auth).toHaveBeenCalledOnce();
      expect(queries.getUserBookmarks).toHaveBeenCalledWith(mockUserId);
      expect(result).toEqual(mockBookmarks);
    });

    it("should return empty array when user has no bookmarks", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockUserId },
      });
      (queries.getUserBookmarks as Mock).mockResolvedValue([]);

      const result = await getBookmarks();

      expect(result).toEqual([]);
    });

    it("should throw error when user is not authenticated", async () => {
      (authLib.auth as Mock).mockResolvedValue(null);

      await expect(getBookmarks()).rejects.toThrow("Unauthorized");
      expect(queries.getUserBookmarks).not.toHaveBeenCalled();
    });

    it("should throw error when user ID is missing", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: {},
      });

      await expect(getBookmarks()).rejects.toThrow("Unauthorized");
      expect(queries.getUserBookmarks).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockUserId },
      });
      (queries.getUserBookmarks as Mock).mockRejectedValue(new Error("Database error"));

      await expect(getBookmarks()).rejects.toThrow("Database error");
    });
  });
});
