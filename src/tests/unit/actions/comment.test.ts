// ═══════════════════════════════════════════════════
// COMMENT ACTIONS - UNIT TESTS
// ═══════════════════════════════════════════════════

import * as mutations from "@/database/mutations";
import { createComment, deleteComment, updateComment } from "@/lib/actions/comments";
import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { checkRateLimit } from "@/appConfig";

// Mock dependencies
vi.mock("mutations");
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
vi.mock("appConfig", () => ({
  appConfig: {
    rateLimit: {
      default: {
        maxRequests: 10,
        windowMs: 60 * 1000,
      },
    },
  },
  checkRateLimit: vi.fn(),
}));

describe("Comment Actions", () => {
  const mockUserId = "user-123";
  const mockCommentId = 1;
  const mockChapterId = 10;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════
  // CREATE COMMENT TESTS
  // ═══════════════════════════════════════════════════

  describe("createComment", () => {
    it("should successfully create a comment with valid data", async () => {
      const formData = new FormData();
      formData.append("content", "This is a test comment");
      formData.append("chapterId", mockChapterId.toString());
      (checkRateLimit as Mock).mockReturnValue({
        allowed: true,
        remaining: 9,
      });
      (mutations.createComment as Mock).mockResolvedValue({
        id: mockCommentId,
        content: "This is a test comment",
        chapterId: mockChapterId,
        userId: mockUserId,
      });

      const result = await createComment(mockUserId, formData);

      expect(checkRateLimit).toHaveBeenCalledWith(`comment:${mockUserId}`, expect.any(Object));
      expect(mutations.createComment).toHaveBeenCalledWith({
        content: "This is a test comment",
        chapterId: mockChapterId,
        userId: mockUserId,
      });
      expect(result).toEqual({
        success: true,
        data: { id: mockCommentId },
      });
    });

    it("should return error when rate limit is exceeded", async () => {
      const formData = new FormData();
      formData.append("content", "Test comment");
      formData.append("chapterId", mockChapterId.toString());
      (checkRateLimit as Mock).mockReturnValue({
        allowed: false,
        remaining: 0,
      });

      const result = await createComment(mockUserId, formData);

      expect(result).toEqual({
        success: false,
        error: "Too many comments. Please try again later.",
      });
      expect(mutations.createComment).not.toHaveBeenCalled();
    });

    it("should return error when content is empty", async () => {
      const formData = new FormData();
      formData.append("content", "");
      formData.append("chapterId", mockChapterId.toString());
      (checkRateLimit as Mock).mockReturnValue({
        allowed: true,
        remaining: 9,
      });

      const result = await createComment(mockUserId, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(mutations.createComment).not.toHaveBeenCalled();
    });

    it("should return error when content is too long", async () => {
      const longContent = "a".repeat(1001);
      const formData = new FormData();
      formData.append("content", longContent);
      formData.append("chapterId", mockChapterId.toString());
      (checkRateLimit as Mock).mockReturnValue({
        allowed: true,
        remaining: 9,
      });

      const result = await createComment(mockUserId, formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("too long");
      expect(mutations.createComment).not.toHaveBeenCalled();
    });

    it("should return error when chapterId is missing", async () => {
      const formData = new FormData();
      formData.append("content", "Test comment");
      (checkRateLimit as Mock).mockReturnValue({
        allowed: true,
        remaining: 9,
      });

      const result = await createComment(mockUserId, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(mutations.createComment).not.toHaveBeenCalled();
    });

    it("should return error when chapterId is invalid", async () => {
      const formData = new FormData();
      formData.append("content", "Test comment");
      formData.append("chapterId", "invalid");
      (checkRateLimit as Mock).mockReturnValue({
        allowed: true,
        remaining: 9,
      });

      const result = await createComment(mockUserId, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(mutations.createComment).not.toHaveBeenCalled();
    });

    it("should return error when chapterId is negative", async () => {
      const formData = new FormData();
      formData.append("content", "Test comment");
      formData.append("chapterId", "-1");
      (checkRateLimit as Mock).mockReturnValue({
        allowed: true,
        remaining: 9,
      });

      const result = await createComment(mockUserId, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(mutations.createComment).not.toHaveBeenCalled();
    });

    it("should return error when comment creation fails", async () => {
      const formData = new FormData();
      formData.append("content", "Test comment");
      formData.append("chapterId", mockChapterId.toString());
      (checkRateLimit as Mock).mockReturnValue({
        allowed: true,
        remaining: 9,
      });
      (mutations.createComment as Mock).mockResolvedValue(null);

      const result = await createComment(mockUserId, formData);

      expect(result).toEqual({
        success: false,
        error: "Failed to create comment",
      });
    });

    it("should handle database errors gracefully", async () => {
      const formData = new FormData();
      formData.append("content", "Test comment");
      formData.append("chapterId", mockChapterId.toString());
      (checkRateLimit as Mock).mockReturnValue({
        allowed: true,
        remaining: 9,
      });
      (mutations.createComment as Mock).mockRejectedValue(new Error("Database error"));

      const result = await createComment(mockUserId, formData);

      expect(result).toEqual({
        success: false,
        error: "Failed to create comment",
      });
    });
  });

  // ═══════════════════════════════════════════════════
  // UPDATE COMMENT TESTS
  // ═══════════════════════════════════════════════════

  describe("updateComment", () => {
    it("should successfully update a comment with valid data", async () => {
      const formData = new FormData();
      formData.append("content", "Updated comment content");
      (mutations.updateComment as Mock).mockResolvedValue(undefined);

      const result = await updateComment(mockCommentId, formData);

      expect(mutations.updateComment).toHaveBeenCalledWith(mockCommentId, {
        content: "Updated comment content",
      });
      expect(result).toEqual({ success: true });
    });

    it("should return error when content is empty", async () => {
      const formData = new FormData();
      formData.append("content", "");

      const result = await updateComment(mockCommentId, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(mutations.updateComment).not.toHaveBeenCalled();
    });

    it("should return error when content is too long", async () => {
      const longContent = "a".repeat(1001);
      const formData = new FormData();
      formData.append("content", longContent);

      const result = await updateComment(mockCommentId, formData);

      expect(result.success).toBe(false);
      expect(result.error).toContain("too long");
      expect(mutations.updateComment).not.toHaveBeenCalled();
    });

    it("should return error when content is missing", async () => {
      const formData = new FormData();

      const result = await updateComment(mockCommentId, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
      expect(mutations.updateComment).not.toHaveBeenCalled();
    });

    it("should handle database errors gracefully", async () => {
      const formData = new FormData();
      formData.append("content", "Updated content");
      (mutations.updateComment as Mock).mockRejectedValue(new Error("Database error"));

      const result = await updateComment(mockCommentId, formData);

      expect(result).toEqual({
        success: false,
        error: "Failed to update comment",
      });
    });

    it("should handle non-existent comment updates", async () => {
      const formData = new FormData();
      formData.append("content", "Updated content");
      (mutations.updateComment as Mock).mockRejectedValue(new Error("Comment not found"));

      const result = await updateComment(999999, formData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to update comment");
    });
  });

  // ═══════════════════════════════════════════════════
  // DELETE COMMENT TESTS
  // ═══════════════════════════════════════════════════

  describe("deleteComment", () => {
    it("should successfully delete a comment", async () => {
      (mutations.deleteComment as Mock).mockResolvedValue(undefined);

      const result = await deleteComment(mockCommentId);

      expect(mutations.deleteComment).toHaveBeenCalledWith(mockCommentId);
      expect(result).toEqual({ success: true });
    });

    it("should handle database errors gracefully", async () => {
      (mutations.deleteComment as Mock).mockRejectedValue(new Error("Database error"));

      const result = await deleteComment(mockCommentId);

      expect(result).toEqual({
        success: false,
        error: "Failed to delete comment",
      });
    });

    it("should handle non-existent comment deletions", async () => {
      (mutations.deleteComment as Mock).mockRejectedValue(new Error("Comment not found"));

      const result = await deleteComment(999999);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to delete comment");
    });

    it("should handle permission errors", async () => {
      (mutations.deleteComment as Mock).mockRejectedValue(new Error("Permission denied"));

      const result = await deleteComment(mockCommentId);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Failed to delete comment");
    });
  });
});
