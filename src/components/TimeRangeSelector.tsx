"use client";

import { DateRange } from "@/lib/types";

const ranges = [
  { days: 7, label: "This Week" },
  { days: 30, label: "30 Days" },
  { days: 90, label: "90 Days" },
  { days: 180, label: "6 Months" },
  { days: 365, label: "1 Year" },
] as const;

function toYMD(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function TimeRangeSelector({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
}) {
  const isCustom = value.kind === "custom";

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {ranges.map(({ days, label }, i) => (
        <span key={days} className="flex items-center">
          <button
            onClick={() => onChange({ kind: "preset", days })}
            className={`text-[10px] uppercase tracking-[0.15em] transition-colors duration-300 ${
              value.kind === "preset" && value.days === days
                ? "text-foreground underline underline-offset-4 decoration-1"
                : "text-text-dim hover:text-text-muted"
            }`}
          >
            {label}
          </button>
          {i < ranges.length && (
            <span className="text-text-dim text-[10px] mx-2.5">&middot;</span>
          )}
        </span>
      ))}
      <button
        onClick={() => {
          if (!isCustom) {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 30);
            onChange({ kind: "custom", startDate: toYMD(start), endDate: toYMD(end) });
          }
        }}
        className={`text-[10px] uppercase tracking-[0.15em] transition-colors duration-300 ${
          isCustom
            ? "text-foreground underline underline-offset-4 decoration-1"
            : "text-text-dim hover:text-text-muted"
        }`}
      >
        Custom
      </button>
      {isCustom && (
        <>
          <span className="text-text-dim text-[10px] mx-1.5">—</span>
          <input
            type="date"
            value={value.startDate}
            onChange={(e) =>
              onChange({ ...value, startDate: e.target.value })
            }
            className="bg-surface border border-border rounded px-2 py-1 text-[11px] text-foreground focus:outline-none focus:border-accent/50"
          />
          <span className="text-text-dim text-[10px] mx-1">to</span>
          <input
            type="date"
            value={value.endDate}
            onChange={(e) =>
              onChange({ ...value, endDate: e.target.value })
            }
            className="bg-surface border border-border rounded px-2 py-1 text-[11px] text-foreground focus:outline-none focus:border-accent/50"
          />
        </>
      )}
    </div>
  );
}
