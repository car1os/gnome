"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface DataPoint {
  date: string;
  sleepPerformance: number | null;
}

export function SleepChart({ data, dataLength, visible }: { data: DataPoint[]; dataLength: number; visible: boolean }) {
  const interval = Math.max(0, Math.ceil(dataLength / 10) - 1);
  return (
    <div className="bg-surface rounded p-8">
      <h2 className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-normal mb-4">
        Sleep Performance
      </h2>
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
              formatter={(value) => [`${value}%`, "Sleep Performance"]}
            />
            <Line
              type="monotone"
              dataKey="sleepPerformance"
              stroke="var(--chart-sleep)"
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
