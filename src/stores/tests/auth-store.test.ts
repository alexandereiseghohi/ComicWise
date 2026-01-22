import type { User } from "@/types";
import { act, renderHook } from "@testing-library/react";
import { useAuthStore } from "../auth-store";

describe("authStore", () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useAuthStore());
    act(() => {
      result.current.logout();
    });
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useAuthStore());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("should set user and authentication status", () => {
    const { result } = renderHook(() => useAuthStore());

    const mockUser: Partial<User> = {
      id: "1",
      email: "test@example.com",
      name: "Test User",
      role: "user" as const,
      password: null,
      emailVerified: null,
      image: null,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    act(() => {
      result.current.setUser(mockUser as any);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should set loading state", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.setLoading(true);
    });

    expect(result.current.isLoading).toBe(true);

    act(() => {
      result.current.setLoading(false);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("should update user information", () => {
    const { result } = renderHook(() => useAuthStore());

    const initialUser: Partial<User> = {
      id: "1",
      email: "test@example.com",
      name: "Test User",
      role: "user" as const,
      password: null,
      emailVerified: null,
      image: null,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    act(() => {
      result.current.setUser(initialUser as any);
    });

    act(() => {
      result.current.updateUser({ name: "Updated Name" });
    });

    expect(result.current.user?.name).toBe("Updated Name");
    expect(result.current.user?.email).toBe("test@example.com");
  });

  it("should logout and clear user data", () => {
    const { result } = renderHook(() => useAuthStore());

    const mockUser: Partial<User> = {
      id: "1",
      email: "test@example.com",
      name: "Test User",
      role: "user" as const,
      password: null,
      emailVerified: null,
      image: null,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    act(() => {
      result.current.setUser(mockUser as any);
    });

    expect(result.current.isAuthenticated).toBe(true);

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should not update user when logged out", () => {
    const { result } = renderHook(() => useAuthStore());

    act(() => {
      result.current.updateUser({ name: "Should Not Update" });
    });

    expect(result.current.user).toBeNull();
  });

  it("should persist user data in localStorage", () => {
    const { result } = renderHook(() => useAuthStore());

    const mockUser: Partial<User> = {
      id: "1",
      email: "test@example.com",
      name: "Test User",
      role: "user" as const,
      password: null,
      emailVerified: null,
      image: null,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    act(() => {
      result.current.setUser(mockUser as any);
    });

    // Check localStorage
    const stored = localStorage.getItem("comicwise-auth");
    expect(stored).toBeTruthy();

    if (stored) {
      const parsed = JSON.parse(stored);
      expect(parsed.state.user.email).toEqual(mockUser.email);
    }
  });
});
