"use client";

import { useState } from "react";

type SeedEntityResult = {
  total: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  imagesDownloaded?: number;
  imagesCached?: number;
};

type SeedApiResponse = {
  success: boolean;
  data?: {
    message?: string;
    results?: {
      users: SeedEntityResult;
      comics: SeedEntityResult;
      chapters: SeedEntityResult;
    };
  };
  error?: string;
};

export default function SeedPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SeedApiResponse | null>(null);

  async function runSeed() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/seed", {
        method: "POST",
        body: JSON.stringify({ options: { dryRun: true } }),
        headers: { "content-type": "application/json" },
      });
      const json = (await res.json()) as SeedApiResponse;
      setResult(json);
    } catch (err) {
      setResult({ success: false, error: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Seed Data Runner</h1>
      <p>Run the seed loader to validate and preview seed data.</p>
      <button onClick={runSeed} disabled={loading}>
        {loading ? "Running..." : "Run Seed (dry-run)"}
      </button>
      {result && (
        <pre style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
