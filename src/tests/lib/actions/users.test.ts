/**
 * Server Action Tests - User Profile Operations
 */

import { deleteUserAccount, updateUserProfile, updateUserSettings } from "@/lib/actions/users";
import { auth, signOut } from "@/lib/auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  signOut: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/database/db", () => ({
  db: {
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([{ id: "user-1" }])),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => Promise.resolve()),
    })),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("updateUserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully updates user profile", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", name: "John", email: "john@example.com" },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    } as any);

    const result = await updateUserProfile({
      name: "Jane Doe",
      email: "jane@example.com",
      bio: "I love comics",
      image: null,
    });

    expect(result.success).toBe(true);
  });

  it("rejects unauthenticated requests", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const result = await updateUserProfile({
      name: "Jane Doe",
      email: "jane@example.com",
      bio: undefined,
      image: undefined,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Unauthorized");
  });

  it("validates email format", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", name: "John", email: "john@example.com" },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    } as any);

    const result = await updateUserProfile({
      name: "Jane Doe",
      email: "invalid-email",
      bio: undefined,
      image: undefined,
    });

    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });

  it("revalidates profile path after update", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", name: "John", email: "john@example.com" },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    } as any);

    const { revalidatePath } = await import("next/cache");

    await updateUserProfile({
      name: "Jane Doe",
      email: "jane@example.com",
      bio: undefined,
      image: undefined,
    });

    expect(revalidatePath).toHaveBeenCalledWith("/profile");
  });
});

describe("updateUserSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully updates user settings", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", name: "John", email: "john@example.com" },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    } as any);

    const result = await updateUserSettings({
      emailNotifications: true,
    });

    expect(result.success).toBe(true);
  });

  it("rejects unauthenticated requests", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const result = await updateUserSettings({
      emailNotifications: true,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Unauthorized");
  });
});

describe("deleteUserAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully deletes user account", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", name: "John", email: "john@example.com" },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    } as any);

    const result = await deleteUserAccount();

    expect(result.success).toBe(true);
  });

  it("rejects unauthenticated requests", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const result = await deleteUserAccount();

    expect(result.success).toBe(false);
    expect(result.error).toContain("Unauthorized");
  });

  it("signs out user after deletion", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", name: "John", email: "john@example.com" },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    } as any);

    await deleteUserAccount();

    expect(vi.mocked(signOut)).toHaveBeenCalled();
  });
});
