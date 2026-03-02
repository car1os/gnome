"use client";

const ranges = [7, 30, 90] as const;

export function TimeRangeSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (range: number) => void;
}) {
  return (
    <div className="flex bg-surface rounded-lg border border-border overflow-hidden">
      {ranges.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            value === r
              ? "bg-accent text-background"
              : "text-foreground/60 hover:text-foreground"
          }`}
        >
          {r}d
        </button>
      ))}
    </div>
  );
}
