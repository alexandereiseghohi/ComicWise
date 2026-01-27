import fs from "fs/promises";
import path from "path";

export interface SeedResult {
  source: string;
  inserted: number;
}

export interface SeederOptions {
  // Optional programmatic DB client with insert(table, rows) signature
  dbClient?: { insert?(table: string, rows: any[]): Promise<number> | number };
  outFile?: string; // when no dbClient provided, write results here
}

async function readJsonFile<T = any>(filename: string): Promise<T[]> {
  const p = path.resolve(process.cwd(), filename);
  try {
    const raw = await fs.readFile(p, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as T[];
    // if object with property items or data
    if (Array.isArray(parsed.items)) return parsed.items as T[];
    if (Array.isArray(parsed.data)) return parsed.data as T[];
    // fallback: wrap object
    return [parsed] as unknown as T[];
  } catch {
    // file missing is allowed; return empty
    return [];
  }
}

export async function seedData(opts?: SeederOptions): Promise<{ results: SeedResult[] }> {
  const comics = await readJsonFile("comics.json");
  const chapters = await readJsonFile("chapters.json");
  const users = await readJsonFile("users.json");

  const sources: Array<{ name: string; rows: any[] }> = [
    { name: "comics", rows: comics },
    { name: "chapters", rows: chapters },
    { name: "users", rows: users },
  ];

  const results: SeedResult[] = [];

  for (const s of sources) {
    if (!s.rows || s.rows.length === 0) {
      results.push({ source: s.name, inserted: 0 });
      continue;
    }

    if (opts?.dbClient && typeof opts.dbClient.insert === "function") {
      try {
        const res = await opts.dbClient.insert(s.name, s.rows);
        const inserted = typeof res === "number" ? res : s.rows.length;
        results.push({ source: s.name, inserted });
      } catch {
        // On DB error, push zero and continue
        results.push({ source: s.name, inserted: 0 });
      }
    } else {
      // write to outFile or collect counts
      results.push({ source: s.name, inserted: s.rows.length });
    }
  }

  if (!opts?.dbClient) {
    const outFile = opts?.outFile ?? path.resolve(process.cwd(), ".seeder-output.json");
    try {
      await fs.writeFile(outFile, JSON.stringify({ results }, null, 2), "utf-8");
    } catch {
      // ignore write errors
    }
  }

  return { results };
}

export default seedData;
