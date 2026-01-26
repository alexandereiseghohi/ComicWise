// ═══════════════════════════════════════════════════
// COMIC ACTIONS - UNIT TESTS
// ═══════════════════════════════════════════════════

import * as mutations from "@/database/mutations";
import * as queries from "@/database/queries";
import {
  createComic,
  deleteComic,
  getComicById,
  getComics,
  updateComic,
} from "@/lib/actions/comic";
import * as authLib from "auth";
import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ComicFilters } from "@/types";

// Removed unused import
// Mock dependencies
vi.mock("auth");
vi.mock("mutations");
vi.mock("queries");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("Comic Actions", () => {
  const mockUserId = "user-123";
  const mockAdminId = "admin-123";
  const mockComicId = 1;

  const mockComic = {
    id: mockComicId,
    title: "Test Comic",
    description: "Test description",
    coverImage: "test-cover.jpg",
    status: "ongoing" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    publicationDate: new Date(),
    views: 0,
    rating: null,
    authorName: null,
    artistName: null,
    typeName: null,
    genres: [],
  };

  const mockComics = [mockComic];

  beforeEach(() => {
    // Reset mocks and implementations between tests to avoid cross-test pollution
    vi.resetAllMocks();
  });

  // ═══════════════════════════════════════════════════
  // GET COMICS TESTS
  // ═══════════════════════════════════════════════════

  describe("getComics", () => {
    it("should successfully retrieve all comics without filters", async () => {
      (queries.getAllComics as Mock).mockResolvedValue(mockComics);

      const result = await getComics();

      expect(queries.getAllComics).toHaveBeenCalledWith(undefined);
      expect(result).toEqual(mockComics);
    });

    it("should successfully retrieve comics with filters", async () => {
      const filters: ComicFilters = {
        status: "Ongoing" as const,
        search: "test",
      };
      (queries.getAllComics as Mock).mockResolvedValue(mockComics);

      const result = await getComics(filters);

      expect(queries.getAllComics).toHaveBeenCalledWith(filters);
      expect(result).toEqual(mockComics);
    });

    it("should return empty array when no comics exist", async () => {
      (queries.getAllComics as Mock).mockResolvedValue([]);

      const result = await getComics();

      expect(result).toEqual([]);
    });

    it("should handle database errors gracefully", async () => {
      (queries.getAllComics as Mock).mockRejectedValue(new Error("Database error"));

      await expect(getComics()).rejects.toThrow("Database error");
    });
  });

  // ═══════════════════════════════════════════════════
  // GET COMIC BY ID TESTS
  // ═══════════════════════════════════════════════════

  describe("getComicById", () => {
    it("should successfully retrieve a comic by ID", async () => {
      (queries.getComic as Mock).mockResolvedValue(mockComic);

      const result = await getComicById(mockComicId);

      expect(queries.getComic).toHaveBeenCalledWith(mockComicId);
      expect(result).toEqual(mockComic);
    });

    it("should return null when comic does not exist", async () => {
      (queries.getComic as Mock).mockResolvedValue(null);

      const result = await getComicById(999);

      expect(result).toBeNull();
    });

    it("should handle database errors gracefully", async () => {
      (queries.getComic as Mock).mockRejectedValue(new Error("Database error"));

      await expect(getComicById(mockComicId)).rejects.toThrow("Database error");
    });
  });

  // ═══════════════════════════════════════════════════
  // CREATE COMIC TESTS
  // ═══════════════════════════════════════════════════

  describe("createComic", () => {
    const comicData = {
      title: "New Comic",
      description: "New description",
      coverImage: "new-cover.jpg",
      status: "Ongoing" as const,
      publicationDate: new Date(),
      views: 0,
    };

    it("should successfully create a comic as admin", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockAdminId, role: "admin" },
      });
      (mutations.createComic as Mock).mockResolvedValue(mockComic);

      const result = await createComic(comicData);

      expect(authLib.auth).toHaveBeenCalledOnce();
      expect(mutations.createComic).toHaveBeenCalledWith(comicData);
      expect(result).toEqual(mockComic);
    });

    it("should throw error when user is not authenticated", async () => {
      (authLib.auth as Mock).mockResolvedValue(null);

      await expect(createComic(comicData)).rejects.toThrow("Unauthorized");
      expect(mutations.createComic).not.toHaveBeenCalled();
    });

    it("should throw error when user is not admin", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockUserId, role: "user" },
      });

      await expect(createComic(comicData)).rejects.toThrow("Unauthorized - Admin only");
      expect(mutations.createComic).not.toHaveBeenCalled();
    });

    it("should throw error when user has no role", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockUserId },
      });

      await expect(createComic(comicData)).rejects.toThrow("Unauthorized - Admin only");
      expect(mutations.createComic).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockAdminId, role: "admin" },
      });
      (mutations.createComic as Mock).mockRejectedValue(new Error("Database error"));

      await expect(createComic(comicData)).rejects.toThrow("Database error");
    });

    it("should handle validation errors", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockAdminId, role: "admin" },
      });
      (mutations.createComic as Mock).mockRejectedValue(
        new Error("Validation error: Title is required")
      );

      // Provide required fields but with invalid data to trigger validation error
      const invalidComicData = {
        title: "",
        description: "",
        coverImage: "",
        status: "Ongoing" as const,
        publicationDate: new Date(),
        views: 0,
      };
      await expect(createComic(invalidComicData)).rejects.toThrow("Validation error");
    });
  });

  // ═══════════════════════════════════════════════════
  // UPDATE COMIC TESTS
  // ═══════════════════════════════════════════════════

  describe("updateComic", () => {
    const updateData = {
      title: "Updated Comic",
      description: "Updated description",
      publicationDate: new Date(),
      views: 0,
    };

    it("should successfully update a comic as admin", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockAdminId, role: "admin" },
      });
      (mutations.updateComic as Mock).mockResolvedValue({
        ...mockComic,
        ...updateData,
      });

      const result = await updateComic(mockComicId, updateData);

      expect(authLib.auth).toHaveBeenCalledOnce();
      expect(mutations.updateComic).toHaveBeenCalledWith(mockComicId, updateData);
      expect(result?.title).toBe(updateData.title);
      expect(result?.description).toBe(updateData.description);
    });

    it("should throw error when user is not authenticated", async () => {
      (authLib.auth as Mock).mockResolvedValue(null);

      await expect(updateComic(mockComicId, updateData)).rejects.toThrow("Unauthorized");
      expect(mutations.updateComic).not.toHaveBeenCalled();
    });

    it("should throw error when user is not admin", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockUserId, role: "user" },
      });

      await expect(updateComic(mockComicId, updateData)).rejects.toThrow(
        "Unauthorized - Admin only"
      );
      expect(mutations.updateComic).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockAdminId, role: "admin" },
      });
      (mutations.updateComic as Mock).mockRejectedValue(new Error("Database error"));

      await expect(updateComic(mockComicId, updateData)).rejects.toThrow("Database error");
    });

    it("should handle non-existent comic updates", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockAdminId, role: "admin" },
      });
      (mutations.updateComic as Mock).mockRejectedValue(new Error("Comic not found"));

      await expect(updateComic(999, updateData)).rejects.toThrow("Comic not found");
    });
  });

  // ═══════════════════════════════════════════════════
  // DELETE COMIC TESTS
  // ═══════════════════════════════════════════════════

  describe("deleteComic", () => {
    it("should successfully delete a comic as admin", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockAdminId, role: "admin" },
      });
      (mutations.deleteComic as Mock).mockResolvedValue(undefined);

      const result = await deleteComic(mockComicId);

      expect(authLib.auth).toHaveBeenCalledOnce();
      expect(result).toEqual({ success: true });
    });

    it("should throw error when user is not authenticated", async () => {
      await expect(deleteComic(mockComicId)).rejects.toThrow("Unauthorized");
      expect(mutations.deleteComic).not.toHaveBeenCalled();
    });

    it("should throw error when user is not admin", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockUserId, role: "user" },
      });

      await expect(deleteComic(mockComicId)).rejects.toThrow("Unauthorized - Admin only");
      expect(mutations.deleteComic).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockAdminId, role: "admin" },
      });
      (mutations.deleteComic as Mock).mockRejectedValue(new Error("Database error"));

      await expect(deleteComic(mockComicId)).rejects.toThrow("Database error");
    });

    it("should handle non-existent comic deletions", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockAdminId, role: "admin" },
      });
      (mutations.deleteComic as Mock).mockRejectedValue(new Error("Comic not found"));

      await expect(deleteComic(999)).rejects.toThrow("Comic not found");
    });

    it("should handle cascade deletion conflicts", async () => {
      (authLib.auth as Mock).mockResolvedValue({
        user: { id: mockAdminId, role: "admin" },
      });
      (mutations.deleteComic as Mock).mockRejectedValue(
        new Error("Cannot delete comic with existing chapters")
      );

      await expect(deleteComic(mockComicId)).rejects.toThrow(
        "Cannot delete comic with existing chapters"
      );
    });
  });
});
