import { main as runSeed } from "@/database/seed/seed-dynamic";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const key = req.headers.get("x-seed-key") || "";
    if (!process.env["SEED_API_KEY"] || key !== process.env["SEED_API_KEY"]) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // run seed in background but await completion so caller can see result
    await runSeed();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Seed API error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
