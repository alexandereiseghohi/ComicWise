import { loadJsonData } from "@/lib/seedHelpers.ts";
import { normalizeImagePath, userSchema } from "@/lib/validations/seed.ts";
import fs from "fs";
import { describe, expect, it } from "vitest";

describe("seed helpers", () => {
  it("normalizeImagePath should ensure leading slash or preserve absolute", () => {
    expect(normalizeImagePath("image.jpg")).toBe("/image.jpg");
    expect(normalizeImagePath("/image.jpg")).toBe("/image.jpg");
    expect(normalizeImagePath("https://example.com/a.jpg")).toBe("https://example.com/a.jpg");
  });

  it("userSchema parses simple user", () => {
    const parsed = userSchema.parse({ email: "test@example.com" });
    expect(parsed.email).toBe("test@example.com");
  });

  it("loadJsonData loads json files", async () => {
    const tmp = "./tests/__tmp_users.json";
    fs.writeFileSync(tmp, JSON.stringify([{ email: "a@b.com" }]));
    const arr = await loadJsonData(tmp, userSchema as any);
    expect(arr.length).toBe(1);
    fs.unlinkSync(tmp);
  });
});
