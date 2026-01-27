import { loadJsonData } from "@/lib/seedHelpers";
import fs from "fs-extra";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";

const TMP = path.join(process.cwd(), "tmp-test-seed.json");

afterEach(() => {
  try {
    fs.removeSync(TMP);
  } catch (e) {}
});

describe("loadJsonData", () => {
  it("loads an array file and validates entries", async () => {
    const data = [
      { id: 1, name: "one" },
      { id: 2, name: "two" },
    ];
    fs.writeFileSync(TMP, JSON.stringify(data), "utf-8");
    const schema = z.object({ id: z.number(), name: z.string() });
    const res = (await loadJsonData(
      TMP.replace(process.cwd() + path.sep, ""),
      schema as any
    )) as any[];
    expect(res.length).toBe(2);
    expect(res[0].id).toBe(1);
  });
});
