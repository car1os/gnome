"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TimeRangeSelector } from "./TimeRangeSelector";
import { StatCard } from "./StatCard";
import { RecoveryChart } from "./RecoveryChart";
import { SleepChart } from "./SleepChart";
import { StrainChart } from "./StrainChart";
import { ChatPanel } from "./ChatPanel";
import { ThemeToggle } from "./ThemeToggle";
import { DateRange, TrendsResponse } from "@/lib/types";

export function DashboardShell({ firstName }: { firstName: string }) {
  const [range, setRange] = useState<DateRange>({ kind: "preset", days: 30 });
  const [trends, setTrends] = useState<TrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  useEffect(() => {
    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    let cancelled = false;

    async function load() {
      setError(null);
      // Fade out existing lines before fetching
      if (trends) {
        setVisible(false);
        await new Promise((r) => setTimeout(r, 500));
      }
      if (cancelled) return;
      setLoading(true);
      try {
        const url =
          range.kind === "preset"
            ? `/api/whoop/trends?range=${range.days}`
            : `/api/whoop/trends?start=${range.startDate}&end=${range.endDate}`;
        const res = await fetch(url, {
          signal: controller.signal,
        });
        if (!res.ok) {
          if (res.status === 429) throw new Error("Rate limited by WHOOP. Wait a moment and try again.");
          throw new Error("Failed to fetch trends");
        }
        const data: TrendsResponse = await res.json();
        if (cancelled) return;
        setTrends(data);
        requestAnimationFrame(() => setVisible(true));
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === "AbortError")) return;
        setError((err as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  return (
    <main className="min-h-screen bg-background p-8 md:p-16">
      <header className="flex items-center justify-between mb-12">
        <TimeRangeSelector value={range} onChange={setRange} />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-9 h-9 rounded-full bg-surface flex items-center justify-center text-text-dim hover:text-text-muted transition-colors duration-300"
              aria-label="User menu"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="8" r="5.5" />
                <path d="M3.5 13.5a5.5 5.5 0 0 1 9 0" />
                <circle cx="8" cy="6.5" r="2" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-11 bg-surface rounded py-1.5 z-50 min-w-[120px]">
                <a href="https://app.whoop.com" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-text-dim hover:text-foreground transition-colors duration-300 border-b border-border">{firstName}</a>
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="w-full text-left px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-text-dim hover:text-foreground transition-colors duration-300"
                  >
                    Logout
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>

      {error && (
        <div className="text-recovery-red text-center py-8 text-[11px] uppercase tracking-wider">{error}</div>
      )}

      {loading && !trends && (
        <div className="text-text-dim text-center py-24 text-[11px] uppercase tracking-wider">
          Loading...
        </div>
      )}

      {trends && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <StatCard
              label="Avg Recovery"
              value={trends.summary.avgRecovery}
              unit="%"
              colorFn={recoveryColor}
            />
            <StatCard
              label="Avg Strain"
              value={trends.summary.avgStrain}
              unit=""
            />
          </div>

          <div className="space-y-8">
            <RecoveryChart data={trends.data} dataLength={trends.data.length} visible={visible} />
            <StrainChart data={trends.data} dataLength={trends.data.length} visible={visible} />
          </div>
        </>
      )}

      <ChatPanel trends={trends} range={range} />
    </main>
  );
}

function recoveryColor(value: number): string {
  if (value >= 67) return "var(--recovery-green)";
  if (value >= 34) return "var(--recovery-yellow)";
  return "var(--recovery-red)";
}
