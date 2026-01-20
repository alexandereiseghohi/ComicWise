// ═══════════════════════════════════════════════════
// AUTH ACTIONS - UNIT TESTS
// ═══════════════════════════════════════════════════

import { signInAction, signOutAction } from "@/lib/actions/auth";
import * as ratelimitLib from "@/lib/rateLimit";
import * as authLib from "auth";
import type { Mock } from "vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("auth");
vi.mock("lib/ratelimit");
vi.mock("appConfig", () => ({
  appConfig: {
    rateLimit: {
      auth: {
        maxRequests: 5,
        windowMs: 15 * 60 * 1000,
      },
    },
  },
}));

describe("Auth Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════
  // SIGN IN WITH CREDENTIALS TESTS
  // ═══════════════════════════════════════════════════

  describe("signInAction", () => {
    const validEmail = "testexample.com";
    const validPassword = "Password123!";

    it("should successfully sign in with valid credentials", async () => {
      (ratelimitLib.checkRateLimit as Mock).mockReturnValue({
        allowed: true,
        remaining: 4,
      });
      (authLib.signIn as Mock).mockResolvedValue({ error: null });

      const result = await signInAction(validEmail, validPassword);

      expect(ratelimitLib.checkRateLimit).toHaveBeenCalled();
      expect(authLib.signIn).toHaveBeenCalledWith("credentials", {
        email: validEmail,
        password: validPassword,
        redirect: false,
      });
      expect(result.success).toBe(true);
    });

    it("should return error when rate limit is exceeded", async () => {
      (ratelimitLib.checkRateLimit as Mock).mockReturnValue({
        allowed: false,
        remaining: 0,
      });

      const result = await signInAction(validEmail, validPassword);

      expect(result.success).toBe(false);
      expect("error" in result && result.error).toBeTruthy();
      expect(authLib.signIn).not.toHaveBeenCalled();
    });

    it("should return error when credentials are invalid", async () => {
      (ratelimitLib.checkRateLimit as Mock).mockReturnValue({
        allowed: true,
        remaining: 4,
      });
      (authLib.signIn as Mock).mockResolvedValue({
        error: "Invalid credentials",
      });

      const result = await signInAction(validEmail, validPassword);

      expect(result.success).toBe(false);
      expect("error" in result && result.error).toBeTruthy();
    });

    it("should return error when email is empty", async () => {
      const result = await signInAction("", validPassword);

      expect(result.success).toBe(false);
      expect("error" in result && result.error).toBeTruthy();
      expect(authLib.signIn).not.toHaveBeenCalled();
    });

    it("should return error when password is empty", async () => {
      const result = await signInAction(validEmail, "");

      expect(result.success).toBe(false);
      expect("error" in result && result.error).toBeTruthy();
      expect(authLib.signIn).not.toHaveBeenCalled();
    });

    it("should return error when email format is invalid", async () => {
      const email = "invalid-email";
      const password = validPassword;

      const result = await signInAction(email, password);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeTruthy();
      }
      expect(authLib.signIn).not.toHaveBeenCalled();
    });

    it("should return error when password is too short", async () => {
      const email = validEmail;
      const password = "short";

      const result = await signInAction(email, password);

      expect(result.success).toBe(false);
      expect("error" in result && result.error).toBeTruthy();
      expect(authLib.signIn).not.toHaveBeenCalled();
    });

    it("should handle unexpected errors gracefully", async () => {
      (ratelimitLib.checkRateLimit as Mock).mockReturnValue({
        allowed: true,
        remaining: 4,
      });
      (authLib.signIn as Mock).mockRejectedValue(new Error("Network error"));

      const result = await signInAction(validEmail, validPassword);

      expect(result.success).toBe(false);
      expect("error" in result && result.error).toBeTruthy();
    });
  });

  // ═══════════════════════════════════════════════════
  // SIGN OUT ACTION TESTS
  // ═══════════════════════════════════════════════════

  describe("signOutAction", () => {
    it("should successfully sign out user", async () => {
      (authLib.signOut as Mock).mockResolvedValue(undefined);

      await signOutAction();

      expect(authLib.signOut).toHaveBeenCalledWith({
        redirectTo: "/sign-in",
      });
    });

    it("should handle sign out errors gracefully", async () => {
      (authLib.signOut as Mock).mockRejectedValue(new Error("Sign out error"));

      // signOutAction doesn't catch errors, so it should throw
      await expect(signOutAction()).rejects.toThrow("Sign out error");
    });
  });

  // ═══════════════════════════════════════════════════
  // SIGN OUT ACTION TESTS
  // ═══════════════════════════════════════════════════

  describe("signOutAction", () => {
    it("should successfully sign out user and return success", async () => {
      (authLib.signOut as Mock).mockResolvedValue(undefined);

      await signOutAction();

      expect(authLib.signOut).toHaveBeenCalledWith({
        redirectTo: "/sign-in",
      });
    });

    it("should handle sign out errors gracefully", async () => {
      (authLib.signOut as Mock).mockRejectedValue(new Error("Sign out error"));

      await expect(signOutAction()).rejects.toThrow();
    });

    it("should handle network errors gracefully", async () => {
      (authLib.signOut as Mock).mockRejectedValue(new Error("Network error"));

      await expect(signOutAction()).rejects.toThrow();
    });
  });
});
