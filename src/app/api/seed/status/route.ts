import fs from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function GET() {
  const statusFile = path.resolve(process.cwd(), ".seed-status.json");
  try {
    const raw = await fs.readFile(statusFile, "utf-8");
    const parsed = JSON.parse(raw);
    return NextResponse.json({ success: true, data: parsed });
  } catch {
    return NextResponse.json({ success: false, error: "No status available" }, { status: 404 });
  }
}
