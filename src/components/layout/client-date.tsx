"use client";

import { useEffect, useState } from "react";

export default function ClientDate({ value }: { value?: string }) {
  const [display, setDisplay] = useState<string | null>(null);

  useEffect(() => {
    const date = value ? new Date(value) : new Date();
    try {
      setDisplay(date.toLocaleDateString());
    } catch {
      const iso = date.toISOString().split("T")[0] || date.toISOString();
      setDisplay(iso);
    }
  }, [value]);

  return <>{display ?? null}</>;
}
