// ═══════════════════════════════════════════════════
// CHAPTER ACTIONS - UNIT TESTS
// ═══════════════════════════════════════════════════

import * as mutations from "@/database/mutations";
import * as queries from "@/database/queries";
import { createChapter, getChapterImages, updateChapter } from "@/lib/actions/chapter";
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

describe("Chapter Actions", () => {
  const mockUserId = "user-123";
  const mockAdminId = "admin-123";
  const mockComicId = 1;
  const mockChapterId = 10;

  const mockChapter = {
    id: mockChapterId,
    comicId: mockComicId,
    chapterNumber: 1,
    title: "Test Chapter",
    releaseDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockChapterImages = [
    { id: 1, chapterId: mockChapterId, imageUrl: "image1.jpg", sequence: 1 },
    { id: 2, chapterId: mockChapterId, imageUrl: "image2.jpg", sequence: 2 },
    { id: 3, chapterId: mockChapterId, imageUrl: "image3.jpg", sequence: 3 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════
  // GET CHAPTER IMAGES TESTS
  // ═══════════════════════════════════════════════════

  describe("getChapterImages", () => {
    it("should successfully retrieve chapter images", async () => {
      (queries.getChapterImages as Mock).mockResolvedValue(mockChapterImages);

      const result = await getChapterImages(mockChapterId);

      expect(queries.getChapterImages).toHaveBeenCalledWith(mockChapterId);
      expect(result).toEqual(mockChapterImages);
      expect(result).toHaveLength(3);
    });

    it("should return empty array when chapter has no images", async () => {
      (queries.getChapterImages as Mock).mockResolvedValue([]);

      const result = await getChapterImages(mockChapterId);

      expect(result).toEqual([]);
    });

    it("should handle database errors gracefully", async () => {
      (queries.getChapterImages as Mock).mockRejectedValue(new Error("Database error"));

      await expect(getChapterImages(mockChapterId)).rejects.toThrow("Database error");
    });

    it("should handle non-existent chapter", async () => {
      (queries.getChapterImages as Mock).mockResolvedValue([]);

      const result = await getChapterImages(999999);

      expect(result).toEqual([]);
    });
  });

  // ═══════════════════════════════════════════════════
  // CREATE CHAPTER TESTS
  // ═══════════════════════════════════════════════════

  describe("createChapter", () => {
    const chapterData = {
      comicId: mockComicId,
      chapterNumber: 2,
      title: "New Chapter",
      releaseDate: new Date(),
      views: 0,
    };

    it("should successfully create a chapter as admin", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockAdminId, role: "admin" },
      });
      (mutations.createChapter as Mock).mockResolvedValue({
        ...mockChapter,
        ...chapterData,
      });

      const result = await createChapter(chapterData);

      expect(authLib.auth).toHaveBeenCalledOnce();
      expect(mutations.createChapter).toHaveBeenCalledWith(chapterData);
      expect(result?.comicId).toBe(mockComicId);
      expect(result?.title).toBe("New Chapter");
    });

    it("should throw error when user is not authenticated", async () => {
      (authLib.auth as Mock).mockResolvedValue(null);

      await expect(createChapter(chapterData)).rejects.toThrow("Unauthorized");
      expect(mutations.createChapter).not.toHaveBeenCalled();
    });

    it("should throw error when user is not admin", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockUserId, role: "user" },
      });

      await expect(createChapter(chapterData)).rejects.toThrow("Unauthorized - Admin only");
      expect(mutations.createChapter).not.toHaveBeenCalled();
    });

    it("should throw error when user has no role", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockUserId },
      });

      await expect(createChapter(chapterData)).rejects.toThrow("Unauthorized - Admin only");
      expect(mutations.createChapter).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockAdminId, role: "admin" },
      });
      (mutations.createChapter as Mock).mockRejectedValue(new Error("Database error"));

      await expect(createChapter(chapterData)).rejects.toThrow("Database error");
    });

    it("should handle duplicate chapter number errors", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockAdminId, role: "admin" },
      });
      (mutations.createChapter as Mock).mockRejectedValue(
        new Error("Chapter number already exists")
      );

      await expect(createChapter(chapterData)).rejects.toThrow("Chapter number already exists");
    });

    it("should handle invalid comic ID errors", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockAdminId, role: "admin" },
      });
      (mutations.createChapter as Mock).mockRejectedValue(new Error("Comic not found"));

      await expect(createChapter({ ...chapterData, comicId: 999 })).rejects.toThrow(
        "Comic not found"
      );
    });
  });

  // ═══════════════════════════════════════════════════
  // UPDATE CHAPTER TESTS
  // ═══════════════════════════════════════════════════

  describe("updateChapter", () => {
    const updateData = {
      comicId: mockComicId,
      title: "Updated Chapter",
      chapterNumber: 1.5,
      views: 0,
    };

    it("should successfully update a chapter as admin", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockAdminId, role: "admin" },
      });
      (mutations.updateChapter as Mock).mockResolvedValue({
        ...mockChapter,
        ...updateData,
      });

      const result = await updateChapter(mockChapterId, updateData);

      expect(authLib.auth).toHaveBeenCalledOnce();
      expect(mutations.updateChapter).toHaveBeenCalledWith(mockChapterId, updateData);
      expect(result?.title).toBe("Updated Chapter");
      expect(result?.chapterNumber).toBe(1.5);
    });

    it("should throw error when user is not authenticated", async () => {
      (authLib.auth as Mock).mockResolvedValue(null);

      await expect(updateChapter(mockChapterId, updateData)).rejects.toThrow("Unauthorized");
      expect(mutations.updateChapter).not.toHaveBeenCalled();
    });

    it("should throw error when user is not admin", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockUserId, role: "user" },
      });

      await expect(updateChapter(mockChapterId, updateData)).rejects.toThrow(
        "Unauthorized - Admin only"
      );
      expect(mutations.updateChapter).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockAdminId, role: "admin" },
      });
      (mutations.updateChapter as Mock).mockRejectedValue(new Error("Database error"));

      await expect(updateChapter(mockChapterId, updateData)).rejects.toThrow("Database error");
    });

    it("should handle non-existent chapter updates", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockAdminId, role: "admin" },
      });
      (mutations.updateChapter as Mock).mockRejectedValue(new Error("Chapter not found"));

      await expect(updateChapter(999999, updateData)).rejects.toThrow("Chapter not found");
    });

    it("should handle duplicate chapter number conflicts", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockAdminId, role: "admin" },
      });
      (mutations.updateChapter as Mock).mockRejectedValue(
        new Error("Chapter number already exists for this comic")
      );

      await expect(updateChapter(mockChapterId, updateData)).rejects.toThrow(
        "Chapter number already exists"
      );
    });

    it("should allow updating without changing chapter number", async () => {
      const partialUpdate = {
        comicId: mockComicId,
        title: "Updated Title Only",
      };

      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockAdminId, role: "admin" },
      });
      (mutations.updateChapter as Mock).mockResolvedValue({
        ...mockChapter,
        title: "Updated Title Only",
      });

      const result = await updateChapter(mockChapterId, partialUpdate);

      expect(result?.title).toBe("Updated Title Only");
      expect(result?.chapterNumber).toBe(mockChapter.chapterNumber);
    });
  });
});
