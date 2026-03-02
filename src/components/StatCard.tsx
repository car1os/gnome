"use client";

export function StatCard({
  label,
  value,
  unit,
  colorFn,
}: {
  label: string;
  value: number | null;
  unit: string;
  colorFn?: (value: number) => string;
}) {
  const displayValue = value !== null ? value : "\u2014";
  const color = value !== null && colorFn ? colorFn(value) : undefined;

  return (
    <div className="bg-surface rounded p-8">
      <p className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-3">{label}</p>
      <p className="text-4xl font-light" style={color ? { color } : undefined}>
        {displayValue}
        {value !== null && (
          <span className="text-xs font-light text-text-dim ml-1.5">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
