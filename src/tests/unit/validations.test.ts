import {
  createBookmarkSchema,
  createChapterSchema,
  createComicSchema,
  createCommentSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  updateChapterSchema,
  updateComicSchema,
  updateCommentSchema,
  verifyEmailSchema,
} from "@/lib/validations";
import { describe, expect, it } from "vitest";

describe("Authentication Validation Schemas", () => {
  describe("signUpSchema", () => {
    it("should validate correct signup data", () => {
      const validData = {
        name: "John Doe",
        email: "johnexample.com",
        password: "SecurePass123!",
      };

      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty name", () => {
      const invalidData = {
        name: "",
        email: "johnexample.com",
        password: "SecurePass123!",
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const invalidData = {
        name: "John Doe",
        email: "not-an-email",
        password: "SecurePass123!",
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const invalidData = {
        name: "John Doe",
        email: "johnexample.com",
        password: "123",
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject password without uppercase", () => {
      const invalidData = {
        name: "John Doe",
        email: "johnexample.com",
        password: "securepass123!",
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject password without lowercase", () => {
      const invalidData = {
        name: "John Doe",
        email: "johnexample.com",
        password: "SECUREPASS123!",
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject password without number", () => {
      const invalidData = {
        name: "John Doe",
        email: "johnexample.com",
        password: "SecurePass!",
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should trim whitespace from inputs", () => {
      const dataWithSpaces = {
        name: "  John Doe  ",
        email: "  johnexample.com  ",
        password: "SecurePass123!",
      };

      const result = signUpSchema.safeParse(dataWithSpaces);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("John Doe");
        expect(result.data.email).toBe("johnexample.com");
      }
    });
  });

  describe("signInSchema", () => {
    it("should validate correct signin data", () => {
      const validData = {
        email: "johnexample.com",
        password: "SecurePass123!",
      };

      const result = signInSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidData = {
        email: "invalid-email",
        password: "SecurePass123!",
      };

      const result = signInSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const invalidData = {
        email: "johnexample.com",
        password: "",
      };

      const result = signInSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("forgotPasswordSchema", () => {
    it("should validate correct email", () => {
      const validData = { email: "johnexample.com" };

      const result = forgotPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidData = { email: "not-an-email" };

      const result = forgotPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty email", () => {
      const invalidData = { email: "" };

      const result = forgotPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("resetPasswordSchema", () => {
    it("should validate correct reset password data", () => {
      const validData = {
        token: "valid-token-123",
        password: "NewSecurePass123!",
        confirmPassword: "NewSecurePass123!",
      };

      const result = resetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject mismatched passwords", () => {
      const invalidData = {
        token: "valid-token-123",
        password: "NewSecurePass123!",
        confirmPassword: "DifferentPass123!",
      };

      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject weak password", () => {
      const invalidData = {
        token: "valid-token-123",
        password: "weak",
        confirmPassword: "weak",
      };

      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty token", () => {
      const invalidData = {
        token: "",
        password: "NewSecurePass123!",
        confirmPassword: "NewSecurePass123!",
      };

      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("verifyEmailSchema", () => {
    it("should validate correct token", () => {
      const validData = { token: "valid-verification-token" };

      const result = verifyEmailSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty token", () => {
      const invalidData = { token: "" };

      const result = verifyEmailSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe("Comic Validation Schemas", () => {
  describe("createComicSchema", () => {
    it("should validate correct comic data", () => {
      const validData = {
        title: "Test Comic",
        description: "A test comic description",
        author: "Test Author",
        status: "ongoing",
        coverImage: "https://example.com/cover.jpg",
        genres: ["action", "adventure"],
      };

      const result = createComicSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty title", () => {
      const invalidData = {
        title: "",
        description: "A test comic description",
        author: "Test Author",
        status: "ongoing",
      };

      const result = createComicSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject title that's too long", () => {
      const invalidData = {
        title: "A".repeat(201),
        description: "A test comic description",
        author: "Test Author",
        status: "ongoing",
      };

      const result = createComicSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty description", () => {
      const invalidData = {
        title: "Test Comic",
        description: "",
        author: "Test Author",
        status: "ongoing",
      };

      const result = createComicSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid status", () => {
      const invalidData = {
        title: "Test Comic",
        description: "A test comic description",
        author: "Test Author",
        status: "invalid-status",
      };

      const result = createComicSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept valid status values", () => {
      const statuses = ["ongoing", "completed", "hiatus", "cancelled"];

      statuses.forEach((status) => {
        const data = {
          title: "Test Comic",
          description: "A test comic description",
          author: "Test Author",
          status,
          coverImage: "https://example.com/cover.jpg",
        };

        const result = createComicSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("updateComicSchema", () => {
    it("should validate partial comic updates", () => {
      const validData = {
        title: "Updated Title",
      };

      const result = updateComicSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should allow empty updates", () => {
      const validData = {};

      const result = updateComicSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid field values", () => {
      const invalidData = {
        status: "invalid-status",
      };

      const result = updateComicSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe("Chapter Validation Schemas", () => {
  describe("createChapterSchema", () => {
    it("should validate correct chapter data", () => {
      const validData = {
        title: "Chapter 1",
        chapterNumber: 1,
        content: "Chapter content here",
        comicId: "comic-123",
      };

      const result = createChapterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty title", () => {
      const invalidData = {
        title: "",
        chapterNumber: 1,
        content: "Chapter content here",
        comicId: "comic-123",
      };

      const result = createChapterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject negative chapter number", () => {
      const invalidData = {
        title: "Chapter 1",
        chapterNumber: -1,
        content: "Chapter content here",
        comicId: "comic-123",
      };

      const result = createChapterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject zero chapter number", () => {
      const invalidData = {
        title: "Chapter 1",
        chapterNumber: 0,
        content: "Chapter content here",
        comicId: "comic-123",
      };

      const result = createChapterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept decimal chapter numbers", () => {
      const validData = {
        title: "Chapter 1.5",
        chapterNumber: 1.5,
        content: "Chapter content here",
        comicId: "comic-123",
      };

      const result = createChapterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("updateChapterSchema", () => {
    it("should validate partial chapter updates", () => {
      const validData = {
        title: "Updated Chapter Title",
      };

      const result = updateChapterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should allow empty updates", () => {
      const validData = {};

      const result = updateChapterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});

describe("Comment Validation Schemas", () => {
  describe("createCommentSchema", () => {
    it("should validate correct comment data", () => {
      const validData = {
        content: "This is a test comment",
        comicId: "comic-123",
      };

      const result = createCommentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty content", () => {
      const invalidData = {
        content: "",
        comicId: "comic-123",
      };

      const result = createCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject content that's too long", () => {
      const invalidData = {
        content: "A".repeat(2001),
        comicId: "comic-123",
      };

      const result = createCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept comment with chapter reference", () => {
      const validData = {
        content: "Great chapter!",
        comicId: "comic-123",
        chapterId: "chapter-456",
      };

      const result = createCommentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe("updateCommentSchema", () => {
    it("should validate comment content update", () => {
      const validData = {
        content: "Updated comment text",
      };

      const result = updateCommentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty content", () => {
      const invalidData = {
        content: "",
      };

      const result = updateCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe("Bookmark Validation Schemas", () => {
  describe("createBookmarkSchema", () => {
    it("should validate correct bookmark data", () => {
      const validData = {
        comicId: "comic-123",
      };

      const result = createBookmarkSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty comicId", () => {
      const invalidData = {
        comicId: "",
      };

      const result = createBookmarkSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept bookmark with current chapter", () => {
      const validData = {
        comicId: "comic-123",
        currentChapterId: "chapter-456",
      };

      const result = createBookmarkSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
