"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

interface DataPoint {
  date: string;
  recovery: number | null;
}

export function RecoveryChart({ data, dataLength, visible }: { data: DataPoint[]; dataLength: number; visible: boolean }) {
  const interval = Math.max(0, Math.ceil(dataLength / 10) - 1);
  return (
    <div className="bg-surface rounded p-8">
      <h2 className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-normal mb-4">Recovery</h2>
      <div className="h-64 transition-opacity duration-700" style={{ opacity: visible ? 1 : 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              stroke="var(--text-dim)"
              fontSize={10}
              tickLine={false}
              interval={interval}
            />
            <YAxis
              domain={[0, 100]}
              stroke="var(--text-dim)"
              fontSize={10}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface)",
                border: "none",
                borderRadius: "4px",
                color: "var(--foreground)",
                fontSize: "0.7rem",
              }}
              formatter={(value) => [`${value}%`, "Recovery"]}
            />
            <ReferenceLine
              y={67}
              stroke="var(--recovery-green)"
              strokeDasharray="3 3"
              strokeOpacity={0.2}
            />
            <ReferenceLine
              y={33}
              stroke="var(--recovery-red)"
              strokeDasharray="3 3"
              strokeOpacity={0.2}
            />
            <Line
              type="monotone"
              dataKey="recovery"
              stroke="var(--recovery-green)"
              strokeWidth={1.5}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
