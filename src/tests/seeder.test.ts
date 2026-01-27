import fs from "fs/promises";
import path from "path";
import { describe, expect, it } from "vitest";
import { seedData } from "../lib/seeder.ts";

async function readCount(filename: string) {
  try {
    const raw = await fs.readFile(path.resolve(process.cwd(), filename), "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.length;
    if (Array.isArray((parsed as any).items)) return (parsed as any).items.length;
    if (Array.isArray((parsed as any).data)) return (parsed as any).data.length;
    return 1;
  } catch (err) {
    return 0;
  }
}

describe("seeder", () => {
  it("reads bundled JSON files and returns counts", async () => {
    const [cCount, chCount, uCount] = await Promise.all([
      readCount("comics.json"),
      readCount("chapters.json"),
      readCount("users.json"),
    ]);

    const { results } = await seedData({ outFile: ".seeder-test-output.json" });

    const bySource = Object.fromEntries(results.map((r) => [r.source, r.inserted]));

    expect(Number(bySource["comics"] || 0)).toBe(cCount);
    expect(Number(bySource["chapters"] || 0)).toBe(chCount);
    expect(Number(bySource["users"] || 0)).toBe(uCount);
  });
});
