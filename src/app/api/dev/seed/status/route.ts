import fs from "fs-extra";
import { NextResponse } from "next/server";
import path from "path";

export async function GET() {
  try {
    const file = path.join(process.cwd(), ".cache", "seed-progress.json");
    if (!(await fs.pathExists(file))) return NextResponse.json({ step: "idle" });
    const raw = await fs.readFile(file, "utf-8");
    const json = JSON.parse(raw);
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
