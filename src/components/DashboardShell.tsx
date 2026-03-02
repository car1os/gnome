"use client";

import { useState, useEffect, useCallback } from "react";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { StatCard } from "./StatCard";
import { RecoveryChart } from "./RecoveryChart";
import { SleepChart } from "./SleepChart";
import { StrainChart } from "./StrainChart";

interface TrendPoint {
  date: string;
  recovery: number | null;
  hrv: number | null;
  rhr: number | null;
  strain: number | null;
  sleepPerformance: number | null;
  sleepHours: number | null;
}

interface TrendsResponse {
  data: TrendPoint[];
  summary: {
    avgRecovery: number | null;
    avgSleepHours: number | null;
    avgStrain: number | null;
  };
}

export function DashboardShell({ firstName }: { firstName: string }) {
  const [range, setRange] = useState(30);
  const [trends, setTrends] = useState<TrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrends = useCallback(async (days: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/whoop/trends?range=${days}`);
      if (!res.ok) throw new Error("Failed to fetch trends");
      const data: TrendsResponse = await res.json();
      setTrends(data);
    } catch {
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrends(range);
  }, [range, fetchTrends]);

  return (
    <main className="min-h-screen bg-background p-6 md:p-10">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Hey, {firstName}
          </h1>
          <p className="text-foreground/60 text-sm">Your WHOOP trends</p>
        </div>
        <div className="flex items-center gap-4">
          <TimeRangeSelector value={range} onChange={setRange} />
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="text-sm text-foreground/40 hover:text-foreground/60 transition-colors"
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      {error && (
        <div className="text-recovery-red text-center py-8">{error}</div>
      )}

      {loading && !trends && (
        <div className="text-foreground/40 text-center py-20">
          Loading your data...
        </div>
      )}

      {trends && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Avg Recovery"
              value={trends.summary.avgRecovery}
              unit="%"
              colorFn={recoveryColor}
            />
            <StatCard
              label="Avg Sleep"
              value={trends.summary.avgSleepHours}
              unit="hrs"
            />
            <StatCard
              label="Avg Strain"
              value={trends.summary.avgStrain}
              unit=""
            />
          </div>

          <div className="space-y-6">
            <RecoveryChart data={trends.data} />
            <SleepChart data={trends.data} />
            <StrainChart data={trends.data} />
          </div>
        </>
      )}
    </main>
  );
}

function recoveryColor(value: number): string {
  if (value >= 67) return "var(--recovery-green)";
  if (value >= 34) return "var(--recovery-yellow)";
  return "var(--recovery-red)";
}
