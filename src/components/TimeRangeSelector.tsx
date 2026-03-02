"use client";

const ranges = [
  { days: 7, label: "This Week" },
  { days: 30, label: "Last 30 Days" },
  { days: 90, label: "Last 90 Days" },
  { days: 180, label: "Last 6 Months" },
  { days: 365, label: "Last Year" },
] as const;

export function TimeRangeSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (range: number) => void;
}) {
  return (
    <div className="flex gap-1.5">
      {ranges.map(({ days, label }) => (
        <button
          key={days}
          onClick={() => onChange(days)}
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors duration-150 ${
            value === days
              ? "border border-accent text-accent bg-accent/10"
              : "border border-border text-text-muted hover:border-text-dim hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
