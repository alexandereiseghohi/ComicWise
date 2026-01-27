import { computeImageFilename, ensureSavedImageForUrl } from "@/lib/imageHelper.ts";
import fs from "fs-extra";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const PUBLIC = path.join(process.cwd(), "public");

describe("imageHelper", () => {
  beforeEach(async () => {
    await fs.ensureDir(PUBLIC);
  });
  afterEach(async () => {
    // clean up any test files
    await fs.remove(path.join(PUBLIC, "tests-image"));
  });

  it("computeImageFilename generates consistent hash and ext", () => {
    const url = "https://example.com/image.jpg";
    const info = computeImageFilename(url);
    expect(info.filename).toMatch(/^[0-9a-f]{64}\.jpg$/);
  });

  it("ensureSavedImageForUrl dry-run returns path without downloading", async () => {
    const url = "https://example.com/some.jpg";
    const dest = path.join(PUBLIC, "tests-image");
    const result = await ensureSavedImageForUrl(url, dest, "/placeholder-comic.jpg", {
      dryRun: true,
    } as any);
    expect(result).toContain("/tests-image/");
  });

  it("ensureSavedImageForUrl returns local relative path if non-absolute and exists", async () => {
    const localRel = "/tests-image/local.jpg";
    const localPath = path.join(PUBLIC, "tests-image", "local.jpg");
    await fs.ensureDir(path.dirname(localPath));
    await fs.writeFile(localPath, "ok");
    const result = await ensureSavedImageForUrl(
      localRel,
      path.join(PUBLIC, "tests-image"),
      "/placeholder-comic.jpg"
    );
    expect(result).toBe(localRel);
  });
});
