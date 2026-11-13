"use client";

import { useEffect, useState } from "react";
import type { SessionResults, SessionStatus } from "../types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function useSessionAnalysis(sessionId: string | null) {
  const [status, setStatus] = useState<SessionStatus | null>(null);
  const [results, setResults] = useState<SessionResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const res = await fetch(`${API}/api/sessions/${sessionId}/status`);
        if (!res.ok) throw new Error("Could not load session status");
        const data: SessionStatus = await res.json();
        if (cancelled) return;

        setStatus(data);

        if (data.status === "done") {
          const resultsRes = await fetch(`${API}/api/sessions/${sessionId}/results`);
          if (!resultsRes.ok) throw new Error("Could not load results");
          const payload: SessionResults = await resultsRes.json();
          if (!cancelled) setResults(payload);
          return;
        }

        timer = setTimeout(poll, 2000);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Something went wrong");
      }
    }

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sessionId]);

  return { status, results, error };
}
