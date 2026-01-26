import path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Module under test
import {
  loadAllData,
  loadChapters,
  loadComics,
  loadUsers,
} from "@/database/seed/data-loader-optimized";

// Mock glob and fs to simulate files in the repository
vi.mock("glob", async () => {
  return {
    glob: async (pattern: string, opts: any) => {
      // Return a single file path that ends with the pattern's first segment
      const cwd = opts?.cwd ?? process.cwd();
      // Normalize simple patterns used in the loader
      const base = pattern.replace("*", "");
      return [path.join(cwd, base)];
    },
  };
});

vi.mock("fs/promises", async () => {
  // Provide a default export object like the real ESM module
  const mod = {
    readFile: async (filePath: string, enc: string) => {
      const name = path.basename(filePath).toLowerCase();
      if (name.includes("users")) {
        return JSON.stringify([{ name: "Seed User", email: "seed@example.com" }]);
      }
      if (name.includes("comics")) {
        return JSON.stringify([{ title: "Seed Comic", slug: "seed-comic", description: "desc" }]);
      }
      if (name.includes("chapters")) {
        return JSON.stringify([
          {
            name: "Chapter 1",
            chapterNumber: 1,
            comic: { title: "Seed Comic", slug: "seed-comic" },
          },
        ]);
      }

      return JSON.stringify([]);
    },
  };

  return { default: mod };
});

describe("Seed Data Loader (optimized)", () => {
  beforeEach(() => {
    // Ensure tests run in repo root
    process.chdir(path.resolve(__dirname, "../../../../"));
  });

  it("loads and validates users", async () => {
    const result = await loadUsers();
    expect(result.valid).toBeGreaterThanOrEqual(1);
    expect(result.data.length).toBeGreaterThanOrEqual(1);
    expect(result.data[0]!.email).toBe("seed@example.com");
  });

  it("loads and validates comics", async () => {
    const result = await loadComics();
    expect(result.valid).toBeGreaterThanOrEqual(1);
    expect(result.data.length).toBeGreaterThanOrEqual(1);
    expect(result.data[0]!.title).toBe("Seed Comic");
  });

  it("loads and validates chapters", async () => {
    const result = await loadChapters();
    expect(result.valid).toBeGreaterThanOrEqual(1);
    expect(result.data.length).toBeGreaterThanOrEqual(1);
    expect(result.data[0]!.chapterNumber).toBeGreaterThanOrEqual(1);
  });

  it("loads all data", async () => {
    const all = await loadAllData();
    expect(all.users.valid).toBeGreaterThanOrEqual(1);
    expect(all.comics.valid).toBeGreaterThanOrEqual(1);
    expect(all.chapters.valid).toBeGreaterThanOrEqual(1);
  });
});
