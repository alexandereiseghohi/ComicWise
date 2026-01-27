/* eslint-disable */
import fs from "fs/promises";
import path from "path";

function parseArgs(argv) {
  const out = { dryRun: false, only: null, outFile: null };
  for (const a of argv) {
    if (a === "--dry-run") out.dryRun = true;
    if (a.startsWith("--only=")) out.only = a.split("=")[1];
    if (a.startsWith("--out=")) out.outFile = a.split("=")[1];
  }
  return out;
}

async function readJson(filename) {
  const p = path.resolve(process.cwd(), filename);
  try {
    const raw = await fs.readFile(p, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed?.items)) return parsed.items;
    if (Array.isArray(parsed?.data)) return parsed.data;
    return [parsed];
  } catch (err) {
    return [];
  }
}

async function main() {
  const comics = await readJson("comics.json");
  const chapters = await readJson("chapters.json");
  const users = await readJson("users.json");

  const sources = [
    { name: "comics", rows: comics },
    { name: "chapters", rows: chapters },
    { name: "users", rows: users },
  ];

  const results = [];

  const args = parseArgs(process.argv.slice(2));
  const drizzlePath = process.env.DRIZZLE_CLIENT_PATH;
  let drizzleClient = null;

  // Try explicit env first
  if (drizzlePath) {
    try {
      drizzleClient = await import(path.resolve(process.cwd(), drizzlePath));
      drizzleClient = drizzleClient?.default ?? drizzleClient;
      console.log("Loaded drizzle client from", drizzlePath);
    } catch (err) {
      console.warn("Failed to import DRIZZLE_CLIENT_PATH", drizzlePath, err?.message ?? err);
      drizzleClient = null;
    }
  }

  // Auto-detect common Drizzle client export paths if not provided
  const common = [
    "src/database/db.ts",
    "src/database/db/index.ts",
    "src/lib/db.ts",
    "src/database/index.ts",
    "src/lib/drizzle-client.ts",
  ];

  if (!drizzleClient) {
    for (const candidate of common) {
      try {
        const resolved = path.resolve(process.cwd(), candidate);
        // attempt dynamic import - in many dev environments tsx will allow this
        const mod = await import(resolved).catch(() => null);
        if (mod) {
          drizzleClient = mod?.default ?? mod;
          console.log("Auto-detected drizzle client at", candidate);
          break;
        }
      } catch (err) {
        // ignore
      }
    }
  }

  for (const s of sources) {
    if (!s.rows || s.rows.length === 0) {
      results.push({ source: s.name, inserted: 0 });
      continue;
    }

    // apply --only filter
    if (args.only && args.only !== s.name) {
      results.push({ source: s.name, inserted: 0, skipped: true });
      continue;
    }

    if (!args.dryRun && drizzleClient && typeof drizzleClient.insert === "function") {
      try {
        const res = await drizzleClient.insert(s.name, s.rows);
        const inserted = typeof res === "number" ? res : s.rows.length;
        results.push({ source: s.name, inserted });
      } catch (err) {
        console.error("DB insert failed for", s.name, err);
        results.push({ source: s.name, inserted: 0, error: String(err) });
      }
    } else {
      // dry-run or no DB client: report counts only
      results.push({ source: s.name, inserted: s.rows.length });
    }
  }

  const outFile = path.resolve(process.cwd(), args.outFile ?? ".seeder-output.json");
  try {
    await fs.writeFile(outFile, JSON.stringify({ results, args }, null, 2), "utf-8");
    console.log("Wrote", outFile);
  } catch (err) {
    console.warn("Failed to write output file", err?.message ?? err);
  }

  console.log("Seed results:");
  console.table(results.map((r) => ({ source: r.source, inserted: r.inserted })));
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith("seed.js")) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
