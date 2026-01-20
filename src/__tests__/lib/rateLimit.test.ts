/**
 * Rate Limiting Service Tests
 */

import {
  checkRateLimit,
  createRateLimitError,
  getIdentifier,
  rateLimitAction,
  withRateLimit,
} from "@/lib/rateLimit";
import { Ratelimit } from "@upstash/ratelimit";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock Upstash Redis
vi.mock("@upstash/redis", () => ({
  Redis: vi.fn(() => ({
    del: vi.fn(),
  })),
}));

// Mock Upstash Ratelimit
vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: vi.fn(() => ({
    limit: vi.fn((identifier: string) =>
      Promise.resolve({
        success: true,
        limit: 10,
        remaining: 9,
        reset: Date.now() + 60000,
        pending: Promise.resolve(),
      })
    ),
  })),
}));

describe("Rate Limiting Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getIdentifier", () => {
    it("returns user identifier when userId provided", () => {
      const result = getIdentifier("user-123");
      expect(result).toBe("user:user-123");
    });

    it("returns IP identifier when only IP provided", () => {
      const result = getIdentifier(undefined, "192.168.1.1");
      expect(result).toBe("ip:192.168.1.1");
    });

    it("returns anonymous when neither provided", () => {
      const result = getIdentifier();
      expect(result).toBe("anonymous");
    });

    it("prefers userId over IP", () => {
      const result = getIdentifier("user-123", "192.168.1.1");
      expect(result).toBe("user:user-123");
    });
  });

  describe("createRateLimitError", () => {
    it("creates standardized error response", () => {
      const result = {
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 60000,
        pending: Promise.resolve(),
      };

      const error = createRateLimitError(result);

      expect(error).toHaveProperty("error", "Too many requests");
      expect(error).toHaveProperty("message");
      expect(error).toHaveProperty("retryAfter", result.reset);
      expect(error).toHaveProperty("limit", 10);
      expect(error).toHaveProperty("remaining", 0);
    });

    it("displays correct retry time in minutes", () => {
      const result = {
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 120000, // 2 minutes
        pending: Promise.resolve(),
      };

      const error = createRateLimitError(result);

      expect(error.message).toContain("2 minutes");
    });

    it("uses singular form for 1 minute", () => {
      const result = {
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 30000, // Less than 1 minute, rounds to 1
        pending: Promise.resolve(),
      };

      const error = createRateLimitError(result);

      expect(error.message).toContain("1 minute");
      expect(error.message).not.toContain("minutes");
    });
  });

  describe("checkRateLimit", () => {
    it("returns success when rate limit not exceeded", async () => {
      const mockLimiter = {
        limit: vi.fn(() =>
          Promise.resolve({
            success: true,
            limit: 10,
            remaining: 5,
            reset: Date.now() + 60000,
            pending: Promise.resolve(),
          })
        ),
      } as unknown as Ratelimit;

      const result = await checkRateLimit(mockLimiter, "user:123");

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(5);
    });

    it("returns failure when rate limit exceeded", async () => {
      const mockLimiter = {
        limit: vi.fn(() =>
          Promise.resolve({
            success: false,
            limit: 10,
            remaining: 0,
            reset: Date.now() + 60000,
            pending: Promise.resolve(),
          })
        ),
      } as unknown as Ratelimit;

      const result = await checkRateLimit(mockLimiter, "user:123");

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });

  describe("rateLimitAction", () => {
    it("applies rate limit for user actions", async () => {
      const mockLimiter = {
        limit: vi.fn(() =>
          Promise.resolve({
            success: true,
            limit: 10,
            remaining: 8,
            reset: Date.now() + 60000,
            pending: Promise.resolve(),
          })
        ),
      } as unknown as Ratelimit;

      const result = await rateLimitAction(mockLimiter, "user-123");

      expect(result.success).toBe(true);
      expect(mockLimiter.limit).toHaveBeenCalledWith("user:user-123");
    });
  });

  describe("withRateLimit", () => {
    it("extracts IP from request headers", async () => {
      const mockLimiter = {
        limit: vi.fn(() =>
          Promise.resolve({
            success: true,
            limit: 10,
            remaining: 9,
            reset: Date.now() + 60000,
            pending: Promise.resolve(),
          })
        ),
      } as unknown as Ratelimit;

      const request = new Request("https://example.com", {
        headers: {
          "x-forwarded-for": "192.168.1.1",
        },
      });

      await withRateLimit(mockLimiter, request);

      expect(mockLimiter.limit).toHaveBeenCalledWith("ip:192.168.1.1");
    });

    it("uses userId when provided", async () => {
      const mockLimiter = {
        limit: vi.fn(() =>
          Promise.resolve({
            success: true,
            limit: 10,
            remaining: 9,
            reset: Date.now() + 60000,
            pending: Promise.resolve(),
          })
        ),
      } as unknown as Ratelimit;

      const request = new Request("https://example.com");

      await withRateLimit(mockLimiter, request, "user-123");

      expect(mockLimiter.limit).toHaveBeenCalledWith("user:user-123");
    });
  });
});
