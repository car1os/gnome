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
    <div className="bg-surface rounded-xl p-4">
      <p className="text-text-muted text-xs mb-1">{label}</p>
      <p className="text-xl font-semibold" style={color ? { color } : undefined}>
        {displayValue}
        {value !== null && (
          <span className="text-sm font-normal text-text-dim ml-0.5">
            {unit}
          </span>
        )}
      </p>
    </div>
  );
}
