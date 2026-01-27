"use client";
import { useEffect, useState } from "react";

export default function DevSeedPage() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<any>(null);
  const [polling, setPolling] = useState(false);

  async function trigger() {
    setStatus({ step: "starting" });
    try {
      const res = await fetch("/api/dev/seed", {
        method: "POST",
        headers: {
          "x-seed-key": key,
        },
      });
      const json = await res.json();
      if (res.ok) setStatus("Seed started successfully");
      else setStatus({ error: json.error });
      setPolling(true);
    } catch (err) {
      setStatus({ error: String(err) });
    }
  }

  useEffect(() => {
    let id: any;
    if (polling) {
      id = setInterval(async () => {
        try {
          const res = await fetch("/api/dev/seed/status");
          const json = await res.json();
          setStatus(json);
        } catch (err) {
          setStatus({ error: String(err) });
        }
      }, 1500);
    }
    return () => clearInterval(id);
  }, [polling]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Dev Seed</h1>
      <p>Provide SEED_API_KEY to trigger seeding.</p>
      <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="SEED_API_KEY" />
      <button onClick={trigger} style={{ marginLeft: 8 }}>
        Trigger Seed
      </button>
      {status && (
        <div style={{ marginTop: 12 }}>
          <pre>{JSON.stringify(status, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
