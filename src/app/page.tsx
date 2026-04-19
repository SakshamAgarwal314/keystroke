"use client";

import { useState, useMemo } from "react";
import Login from "@/components/Login";
import Dashboard from "@/components/Dashboard";
import { processResults } from "@/lib/analytics";
import { MonkeyTypeResult } from "@/lib/types";
import { generateDemoResults } from "@/lib/demoData";

export default function Home() {
  const [rawResults, setRawResults] = useState<MonkeyTypeResult[] | null>(null);
  const [goalWpm, setGoalWpm] = useState<number>(150);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  // Recompute dashboard data whenever goal changes — cheap because it's all in-memory
  const dashboardData = useMemo(() => {
    if (!rawResults) return null;
    return processResults(rawResults, goalWpm);
  }, [rawResults, goalWpm]);

  const computeDefaultGoal = (results: MonkeyTypeResult[]): number => {
    if (results.length === 0) return 100;
    const avg = results.reduce((s, r) => s + r.wpm, 0) / results.length;
    // Round to nearest 5 for a clean-looking default
    return Math.round((avg + 30) / 5) * 5;
  };

  const handleLogin = async (apeKey: string) => {
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch("/api/fetch-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apeKey, limit: 1000, mode: "time", mode2: "30" }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || "Failed to fetch data");
      if (!json.results || json.results.length === 0) {
        throw new Error(
          "No typing tests found on this account. Do some tests on monkeytype.com and try again."
        );
      }

      if (json.fallbackUsed) {
        setNotice(
          `No 30s tests found — showing all time-mode tests (${json.filteredCount} total).`
        );
      }

      const results = json.results as MonkeyTypeResult[];
      setGoalWpm(computeDefaultGoal(results));
      setRawResults(results);
      setIsDemo(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setLoading(true);
    setError(null);
    setTimeout(() => {
      const demoResults = generateDemoResults();
      setGoalWpm(computeDefaultGoal(demoResults));
      setRawResults(demoResults);
      setIsDemo(true);
      setNotice("Viewing demo data — sign in with your ApeKey to see your own stats.");
      setLoading(false);
    }, 600);
  };

  const handleReset = () => {
    setRawResults(null);
    setError(null);
    setNotice(null);
    setIsDemo(false);
  };

  if (dashboardData) {
    return (
      <Dashboard
        data={dashboardData}
        onReset={handleReset}
        onGoalChange={setGoalWpm}
        notice={notice}
        isDemo={isDemo}
      />
    );
  }

  return (
    <Login
      onSubmit={handleLogin}
      onDemo={handleDemo}
      loading={loading}
      error={error}
    />
  );
}
