import { loadAllData } from "@/database/seed/data-loader-optimized";
import { describe, expect, it } from "vitest";

describe("Seed API", () => {
  it("loadAllData returns users, comics and chapters", async () => {
    const data = await loadAllData();
    expect(data).toHaveProperty("users");
    expect(data).toHaveProperty("comics");
    expect(data).toHaveProperty("chapters");
  });
});
