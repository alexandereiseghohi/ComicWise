/**
 * Server Action Tests - Avatar Upload
 */

import type { ActionResult } from "@/dto/actionResponseDto";
import { uploadAvatar } from "@/lib/actions/avatar";
import { auth } from "@/lib/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Type guard helper
function isSuccess<T>(result: ActionResult<T>): result is { success: true; data?: T } {
  return result.success === true;
}

// Mock dependencies
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/rateLimit", () => ({
  rateLimitAction: vi.fn(),
  rateLimitConfigs: { user: { upload: {} } },
  createRateLimitError: vi.fn((result) => ({
    message: "Rate limit exceeded",
  })),
}));

vi.mock("@/database/db", () => ({
  db: {
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() =>
            Promise.resolve([{ id: "user-1", image: "https://cdn.example.com/avatar.jpg" }])
          ),
        })),
      })),
    })),
  },
}));

vi.mock("@/lib/uploadImage", () => ({
  uploadImageToProvider: vi.fn((file) =>
    Promise.resolve({
      success: true,
      url: "https://cdn.example.com/avatar.jpg",
      provider: "imagekit",
    })
  ),
}));

describe("uploadAvatar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully uploads avatar", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", name: "John", email: "john@example.com" },
    } as any);

    const { rateLimitAction } = await import("@/lib/rateLimit");
    vi.mocked(rateLimitAction).mockResolvedValue({ success: true } as any);

    const formData = new FormData();
    const file = new File(["test"], "avatar.jpg", { type: "image/jpeg" });
    formData.append("avatar", file);

    const result = await uploadAvatar(formData);

    expect(result.success).toBe(true);
    if (isSuccess(result)) {
      expect(result.data).toHaveProperty("url");
    }
  });

  it("rejects unauthenticated requests", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const formData = new FormData();
    const file = new File(["test"], "avatar.jpg", { type: "image/jpeg" });
    formData.append("avatar", file);

    const result = await uploadAvatar(formData);

    expect(result.success).toBe(false);
    if (!isSuccess(result)) {
      expect(result.error).toContain("Unauthorized");
    }
  });

  it("enforces rate limiting", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", name: "John", email: "john@example.com" },
    } as any);

    const { rateLimitAction } = await import("@/lib/rateLimit");
    vi.mocked(rateLimitAction).mockResolvedValue({ success: false } as any);

    const formData = new FormData();
    const file = new File(["test"], "avatar.jpg", { type: "image/jpeg" });
    formData.append("avatar", file);

    const result = await uploadAvatar(formData);

    expect(result.success).toBe(false);
    if (!isSuccess(result)) {
      expect(result.error).toContain("Rate limit");
    }
  });

  it("validates file presence", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", name: "John", email: "john@example.com" },
    } as any);

    const { rateLimitAction } = await import("@/lib/rateLimit");
    vi.mocked(rateLimitAction).mockResolvedValue({ success: true } as any);

    const formData = new FormData();

    const result = await uploadAvatar(formData);

    expect(result.success).toBe(false);
    if (!isSuccess(result)) {
      expect(result.error).toContain("No file");
    }
  });

  it("validates file type", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", name: "John", email: "john@example.com" },
    } as any);

    const { rateLimitAction } = await import("@/lib/rateLimit");
    vi.mocked(rateLimitAction).mockResolvedValue({ success: true } as any);

    const formData = new FormData();
    const file = new File(["test"], "document.pdf", { type: "application/pdf" });
    formData.append("avatar", file);

    const result = await uploadAvatar(formData);

    expect(result.success).toBe(false);
    if (!isSuccess(result)) {
      expect(result.error).toContain("Invalid file type");
    }
  });

  it("validates file size", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", name: "John", email: "john@example.com" },
    } as any);

    const { rateLimitAction } = await import("@/lib/rateLimit");
    vi.mocked(rateLimitAction).mockResolvedValue({ success: true } as any);

    const formData = new FormData();
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], "large.jpg", {
      type: "image/jpeg",
    });
    formData.append("avatar", largeFile);

    const result = await uploadAvatar(formData);

    expect(result.success).toBe(false);
    if (!isSuccess(result)) {
      expect(result.error).toContain("File size");
    }
  });
});
