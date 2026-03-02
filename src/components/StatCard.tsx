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
  const displayValue = value !== null ? value : "—";
  const color = value !== null && colorFn ? colorFn(value) : undefined;

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <p className="text-foreground/60 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold" style={color ? { color } : undefined}>
        {displayValue}
        {value !== null && (
          <span className="text-lg font-normal text-foreground/40 ml-1">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
