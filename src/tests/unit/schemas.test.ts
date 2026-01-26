// ═══════════════════════════════════════════════════
// VALIDATION SCHEMA TESTS - Comprehensive Zod Schema Testing
// ═══════════════════════════════════════════════════

import {
  createChapterSchema,
  createComicSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  updateChapterSchema,
  updateComicSchema,
  updateProfileSchema,
  verifyEmailSchema,
} from "@/lib/validations";
import { describe, expect, it } from "vitest";

// ═══════════════════════════════════════════════════
// AUTHENTICATION SCHEMAS
// ═══════════════════════════════════════════════════

describe("Authentication Schemas", () => {
  describe("signInSchema", () => {
    it("should validate correct sign in data", () => {
      const validData = {
        email: "testexample.com",
        password: "Password123",
      };

      const result = signInSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidData = {
        email: "invalid-email",
        password: "Password123",
      };

      const result = signInSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject short password", () => {
      const invalidData = {
        email: "testexample.com",
        password: "short",
      };

      const result = signInSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should trim and lowercase email", () => {
      const data = {
        email: "  TESTEXAMPLE.COM  ",
        password: "Password123",
      };

      const result = signInSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("testexample.com");
      }
    });
  });

  describe("signUpSchema", () => {
    it("should validate correct sign up data", () => {
      const validData = {
        name: "John Doe",
        email: "johnexample.com",
        password: "Password123",
        confirmPassword: "Password123",
      };

      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject passwords that don't match", () => {
      const invalidData = {
        name: "John Doe",
        email: "johnexample.com",
        password: "Password123",
        confirmPassword: "DifferentPassword123",
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject weak password", () => {
      const invalidData = {
        name: "John Doe",
        email: "johnexample.com",
        password: "onlylowercase",
        confirmPassword: "onlylowercase",
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject short name", () => {
      const invalidData = {
        name: "J",
        email: "johnexample.com",
        password: "Password123",
        confirmPassword: "Password123",
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("forgotPasswordSchema", () => {
    it("should validate correct email", () => {
      const validData = { email: "testexample.com" };

      const result = forgotPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const invalidData = { email: "not-an-email" };

      const result = forgotPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("resetPasswordSchema", () => {
    it("should validate correct reset data", () => {
      const validData = {
        token: "valid-token-string",
        password: "NewPassword123",
        confirmPassword: "NewPassword123",
      };

      const result = resetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject mismatched passwords", () => {
      const invalidData = {
        token: "valid-token-string",
        password: "NewPassword123",
        confirmPassword: "DifferentPassword123",
      };

      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("verifyEmailSchema", () => {
    it("should validate token", () => {
      const validData = { token: "verification-token" };

      const result = verifyEmailSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject missing token", () => {
      const invalidData = {};

      const result = verifyEmailSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe("updateProfileSchema", () => {
    it("should validate profile update", () => {
      const validData = {
        name: "Updated Name",
        image: "https://example.com/image.jpg",
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept partial updates", () => {
      const validData = { name: "Updated Name" };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid image URL", () => {
      const invalidData = {
        name: "Updated Name",
        image: "not-a-url",
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

// ═══════════════════════════════════════════════════
// COMIC SCHEMAS
// ═══════════════════════════════════════════════════

describe("Comic Schemas", () => {
  describe("createComicSchema", () => {
    it("should validate correct comic data", () => {
      const validData = {
        title: "Test Comic",
        description: "This is a test comic description that is long enough",
        coverImage: "https://example.com/cover.jpg",
        status: "Ongoing",
        publicationDate: new Date("2024-01-01"),
        rating: 8.5,
        views: 1000,
        authorId: 1,
        artistId: 1,
        typeId: 1,
      };

      const result = createComicSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject short description", () => {
      const invalidData = {
        title: "Test Comic",
        description: "Short",
        coverImage: "https://example.com/cover.jpg",
        status: "Ongoing",
        publicationDate: new Date("2024-01-01"),
      };

      const result = createComicSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject invalid status", () => {
      const invalidData = {
        title: "Test Comic",
        description: "This is a test comic description that is long enough",
        coverImage: "https://example.com/cover.jpg",
        status: "InvalidStatus",
        publicationDate: new Date("2024-01-01"),
      };

      const result = createComicSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject rating out of range", () => {
      const invalidData = {
        title: "Test Comic",
        description: "This is a test comic description that is long enough",
        coverImage: "https://example.com/cover.jpg",
        status: "Ongoing",
        publicationDate: new Date("2024-01-01"),
        rating: 15,
      };

      const result = createComicSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should default views to 0", () => {
      const data = {
        title: "Test Comic",
        description: "This is a test comic description that is long enough",
        coverImage: "https://example.com/cover.jpg",
        status: "Ongoing",
        publicationDate: new Date("2024-01-01"),
      };

      const result = createComicSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.views).toBe(0);
      }
    });
  });

  describe("updateComicSchema", () => {
    it("should validate partial comic updates", () => {
      const validData = {
        title: "Updated Title",
        rating: 9.0,
      };

      const result = updateComicSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should accept empty updates", () => {
      const validData = {};

      const result = updateComicSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════
// CHAPTER SCHEMAS
// ═══════════════════════════════════════════════════

describe("Chapter Schemas", () => {
  describe("createChapterSchema", () => {
    it("should validate correct chapter data", () => {
      const validData = {
        title: "Chapter 1",
        chapterNumber: 1,
        releaseDate: new Date("2024-01-01"),
        comicId: 1,
        views: 500,
      };

      const result = createChapterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject negative chapter number", () => {
      const invalidData = {
        title: "Chapter -1",
        chapterNumber: -1,
        releaseDate: new Date("2024-01-01"),
        comicId: 1,
      };

      const result = createChapterSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept decimal chapter number", () => {
      const data = {
        title: "Chapter 1.5",
        chapterNumber: 1.5,
        releaseDate: new Date("2024-01-01"),
        comicId: 1,
      };

      const result = createChapterSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it("should default views to 0", () => {
      const data = {
        title: "Chapter 1",
        chapterNumber: 1,
        releaseDate: new Date("2024-01-01"),
        comicId: 1,
      };

      const result = createChapterSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.views).toBe(0);
      }
    });

    it("should coerce string numbers to integers", () => {
      const data = {
        title: "Chapter 1",
        chapterNumber: "1" as unknown as number,
        releaseDate: new Date("2024-01-01"),
        comicId: "1" as unknown as number,
      };

      const result = createChapterSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.chapterNumber).toBe("number");
        expect(typeof result.data.comicId).toBe("number");
      }
    });
  });

  describe("updateChapterSchema", () => {
    it("should validate partial chapter updates", () => {
      const validData = {
        title: "Updated Chapter Title",
        views: 1000,
      };

      const result = updateChapterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should allow comicId to be optional on update", () => {
      const validData = {
        title: "Updated Chapter Title",
      };

      const result = updateChapterSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════
// EDGE CASES & SECURITY
// ═══════════════════════════════════════════════════

describe("Security & Edge Cases", () => {
  it("should trim whitespace from strings", () => {
    const data = {
      email: "  testexample.com  ",
      password: "Password123",
    };

    const result = signInSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("testexample.com");
    }
  });

  it("should handle XSS in comic title", () => {
    const data = {
      title: '<script>alert("xss")</script>',
      description: "This is a test comic description that is long enough",
      coverImage: "https://example.com/cover.jpg",
      status: "Ongoing",
      publicationDate: new Date("2024-01-01"),
    };

    const result = createComicSchema.safeParse(data);
    // Schema allows it - sanitization should be done server-side
    expect(result.success).toBe(true);
  });

  it("should reject SQL injection patterns as invalid URLs", () => {
    const data = {
      name: "Test User",
      image: "'; DROP TABLE users; --",
    };

    const result = updateProfileSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("should handle maximum length strings", () => {
    const data = {
      title: "A".repeat(255),
      description: "This is a test comic description that is long enough",
      coverImage: "https://example.com/cover.jpg",
      status: "Ongoing",
      publicationDate: new Date("2024-01-01"),
    };

    const result = createComicSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("should reject strings exceeding maximum length", () => {
    const data = {
      title: "A".repeat(256),
      description: "This is a test comic description that is long enough",
      coverImage: "https://example.com/cover.jpg",
      status: "Ongoing",
      publicationDate: new Date("2024-01-01"),
    };

    const result = createComicSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
