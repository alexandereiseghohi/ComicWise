import { computeImageFilename, isAbsoluteUrl, normalizeImageUrl } from "@/lib/imageHelper.ts";
import { describe, expect, it } from "vitest";

describe("imageHelper basics", () => {
  it("computes a filename and extension for an absolute url", () => {
    const { filename, ext, hash } = computeImageFilename("https://example.com/images/pic.webp");
    expect(filename.endsWith(ext)).toBe(true);
    expect(hash.length).toBe(64);
  });

  it("normalizes relative paths to start with slash", () => {
    expect(normalizeImageUrl("images/pic.jpg")).toBe("/images/pic.jpg");
    expect(normalizeImageUrl("/images/pic.jpg")).toBe("/images/pic.jpg");
  });

  it("detects absolute urls", () => {
    expect(isAbsoluteUrl("https://example.com/a.png")).toBe(true);
    expect(isAbsoluteUrl("/a.png")).toBe(false);
  });
});
