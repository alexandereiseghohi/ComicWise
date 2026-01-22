/**
 * Rate Limiting Service Tests
 */

import {
  checkRateLimit,
  createRateLimitError,
  rateLimitAction,
  withRateLimit,
} from "@/lib/rate-limit";
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

  describe("createRateLimitError", () => {
    it("creates standardized error response", () => {
      const retryAfter = 60000;

      const error = createRateLimitError(retryAfter);

      expect(error.success).toBe(false);
      expect(error.error).toContain("Rate limit exceeded");
    });

    it("displays correct retry time in seconds", () => {
      const retryAfter = 120000; // 2 minutes

      const error = createRateLimitError(retryAfter);

      expect(error.error).toContain("120 seconds");
    });

    it("uses singular form for 1 minute", () => {
      const retryAfter = 30000; // 30 seconds

      const error = createRateLimitError(retryAfter);

      expect(error.error).toContain("30 seconds");
    });
  });

  describe("checkRateLimit", () => {
    it("returns success when rate limit not exceeded", async () => {
      const result = await checkRateLimit("test-key", { limit: 10 });

      expect(result.success).toBe(true);
      expect(result.allowed).toBe(true);
    });
  });

  describe("rateLimitAction", () => {
    it("wraps action with rate limit check", async () => {
      const mockAction = vi.fn(async () => ({ success: true }));
      const wrapped = rateLimitAction(mockAction, { limit: 10 });

      const result = await wrapped();

      expect(result.success).toBe(true);
      expect(mockAction).toHaveBeenCalled();
    });
  });

  describe("withRateLimit", () => {
    it("wraps handler with rate limit check", async () => {
      const mockHandler = vi.fn(async () => ({ status: 200 }));
      const wrapped = withRateLimit(mockHandler, { limit: 10 });

      await wrapped();

      expect(mockHandler).toHaveBeenCalled();
    });
  });
});
