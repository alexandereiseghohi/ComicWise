/**
 * Search utilities tests
 */

import {
  calculatePagination,
  createSearchDebounce,
  generateSearchAnnouncement,
  getPageOffset,
  getSearchSnippet,
  highlightSearchQuery,
  searchCache,
  validateSearchInput,
} from "@/lib/search-enhanced";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Search Utilities", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllTimers();
    searchCache.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("createSearchDebounce", () => {
    it("should debounce search queries", async () => {
      const mockSearch = vi.fn().mockResolvedValue(undefined);
      const debounced = createSearchDebounce(mockSearch, 100);

      debounced("test");
      debounced("test2");
      debounced("test3");

      expect(mockSearch).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      // Run any pending timers and flush microtasks so the debounced promise resolves
      vi.runAllTimers();
      await Promise.resolve();

      expect(mockSearch).toHaveBeenCalledOnce();
      expect(mockSearch).toHaveBeenCalledWith("test3");
    });

    it("should skip queries below minimum length", async () => {
      const mockSearch = vi.fn().mockResolvedValue(undefined);
      const debounced = createSearchDebounce(mockSearch, 100);

      const result = debounced("a");

      await result;
      expect(mockSearch).not.toHaveBeenCalled();
    });
  });

  describe("calculatePagination", () => {
    it("should calculate pagination state correctly", () => {
      const pagination = calculatePagination(2, 50, 12);

      expect(pagination.currentPage).toBe(2);
      expect(pagination.totalPages).toBe(5);
      expect(pagination.hasNextPage).toBe(true);
      expect(pagination.hasPreviousPage).toBe(true);
    });

    it("should handle first page", () => {
      const pagination = calculatePagination(1, 50, 12);

      expect(pagination.hasPreviousPage).toBe(false);
      expect(pagination.hasNextPage).toBe(true);
    });

    it("should handle last page", () => {
      const pagination = calculatePagination(5, 50, 12);

      expect(pagination.hasPreviousPage).toBe(true);
      expect(pagination.hasNextPage).toBe(false);
    });
  });

  describe("getPageOffset", () => {
    it("should calculate correct offset", () => {
      expect(getPageOffset(1, 10)).toBe(0);
      expect(getPageOffset(2, 10)).toBe(10);
      expect(getPageOffset(3, 10)).toBe(20);
    });

    it("should handle invalid page numbers", () => {
      expect(getPageOffset(0, 10)).toBe(0); // Should default to page 1
      expect(getPageOffset(-1, 10)).toBe(0);
    });
  });

  describe("generateSearchAnnouncement", () => {
    it("should generate announcement for no results", () => {
      const announcement = generateSearchAnnouncement(0, "test");
      expect(announcement).toBe("No results found for test");
    });

    it("should generate announcement for single result", () => {
      const announcement = generateSearchAnnouncement(1, "test");
      expect(announcement).toBe("Found 1 result for test");
    });

    it("should generate announcement for multiple results", () => {
      const announcement = generateSearchAnnouncement(42, "test");
      expect(announcement).toBe("Found 42 results for test");
    });
  });

  describe("validateSearchInput", () => {
    it("should validate valid input", () => {
      const result = validateSearchInput("test query");
      expect(result.valid).toBe(true);
    });

    it("should reject empty input", () => {
      const result = validateSearchInput("");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("cannot be empty");
    });

    it("should reject input below minimum length", () => {
      const result = validateSearchInput("a");
      expect(result.valid).toBe(false);
      expect(result.message).toContain("at least 2 characters");
    });

    it("should reject input above maximum length", () => {
      const result = validateSearchInput("a".repeat(101));
      expect(result.valid).toBe(false);
      expect(result.message).toContain("less than 100 characters");
    });
  });

  describe("highlightSearchQuery", () => {
    it("should highlight matching text", () => {
      const result = highlightSearchQuery("Hello World", "world");

      expect(result).toContainEqual({ text: "Hello ", highlighted: false });
      expect(result).toContainEqual({ text: "World", highlighted: true });
    });

    it("should handle case-insensitive matching", () => {
      const result = highlightSearchQuery("HELLO world", "hello");

      expect(result.some((p) => p.highlighted && p.text.toUpperCase() === "HELLO")).toBe(true);
    });

    it("should handle no matches", () => {
      const result = highlightSearchQuery("Hello World", "xyz");

      expect(result).toEqual([{ text: "Hello World", highlighted: false }]);
    });
  });

  describe("getSearchSnippet", () => {
    it("should extract snippet around search term", () => {
      const text = "This is a long text about testing. The test contains important information.";
      const snippet = getSearchSnippet(text, "test", 50);

      expect(snippet).toContain("test");
    });

    it("should return beginning if match not found", () => {
      const text = "This is a long text about testing.";
      const snippet = getSearchSnippet(text, "xyz", 20);

      expect(snippet).toBe("This is a long text ");
    });

    it("should add ellipsis for truncated content", () => {
      const text = "A".repeat(200);
      const snippet = getSearchSnippet(text, "A", 50);

      expect(snippet).toMatch(/\.{3}/);
    });
  });

  describe("Search Cache", () => {
    it("should cache and retrieve data", () => {
      const data = { results: [], total: 0, page: 1, limit: 12, hasMore: false, totalPages: 0 };
      searchCache.set("test-key", data);

      const cached = searchCache.get("test-key");
      expect(cached).toEqual(data);
    });

    it("should return null for expired cache", () => {
      const data = { results: [], total: 0, page: 1, limit: 12, hasMore: false, totalPages: 0 };
      searchCache.set("test-key", data);

      vi.advanceTimersByTime(6 * 60 * 1000); // 6 minutes

      const cached = searchCache.get("test-key");
      expect(cached).toBeNull();
    });

    it("should generate consistent cache keys", () => {
      const options = { query: "test", page: 1 };
      const key1 = searchCache.getCacheKey(options);
      const key2 = searchCache.getCacheKey(options);

      expect(key1).toBe(key2);
    });

    it("should clear all cache", () => {
      const data = { results: [], total: 0, page: 1, limit: 12, hasMore: false, totalPages: 0 };
      searchCache.set("key1", data);
      searchCache.set("key2", data);

      searchCache.clear();

      expect(searchCache.get("key1")).toBeNull();
      expect(searchCache.get("key2")).toBeNull();
    });
  });
});
