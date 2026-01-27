"use client";
import { useState } from "react";

type EntityStats = {
  total?: number;
  created?: number;
  updated?: number;
  skipped?: number;
  errors?: number;
  imagesDownloaded?: number;
  imagesCached?: number;
};

type SeedResult = {
  users?: EntityStats;
  comics?: EntityStats;
  chapters?: EntityStats;
  message?: string;
};

export default function SeedRunner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runSeed() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // start POST and poll status endpoint for streaming progress
      const postPromise = fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entities: "all", options: { verbose: true } }),
      }).then((r) => r.json().catch(() => null));

      const poll = setInterval(async () => {
        try {
          const s = await fetch("/api/seed/status");
          if (s.ok) {
            const j = await s.json();
            if (j?.success && j.data) {
              setResult(
                (prev) => ({ ...(prev ?? {}), ...(j.data.results ?? j.data) }) as SeedResult
              );
            }
          }
        } catch (err) {
          // ignore polling errors
        }
      }, 800);

      const json = await postPromise;
      clearInterval(poll);
      if (json && json.success) {
        setResult(json?.results ?? json?.data?.results ?? json?.data ?? null);
      } else {
        setError(json?.error ?? json?.data?.error ?? "Unknown error");
      }
    } catch (err: any) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
      <h3>Project Seeder</h3>
      <p>Seed the local dataset (comics.json, chapters.json, users.json).</p>
      <button onClick={runSeed} disabled={loading}>
        {loading ? "Seeding…" : "Run Seeder"}
      </button>

      {error && (
        <div style={{ marginTop: 12, color: "red" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 12 }}>
          <h4>Results</h4>
          <div>
            <strong>Message:</strong> {result.message ?? "Completed"}
          </div>
          <ul>
            {result.users && (
              <li>
                <strong>Users:</strong> {result.users.created ?? 0} created,{" "}
                {result.users.updated ?? 0} updated, {result.users.errors ?? 0} errors
              </li>
            )}
            {result.comics && (
              <li>
                <strong>Comics:</strong> {result.comics.created ?? 0} created,{" "}
                {result.comics.updated ?? 0} updated, {result.comics.errors ?? 0} errors
              </li>
            )}
            {result.chapters && (
              <li>
                <strong>Chapters:</strong> {result.chapters.created ?? 0} created,{" "}
                {result.chapters.updated ?? 0} updated, {result.chapters.errors ?? 0} errors
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
