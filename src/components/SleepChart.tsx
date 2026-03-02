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

export function SleepChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h2 className="text-foreground text-lg font-semibold mb-4">
        Sleep Performance
      </h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis
              dataKey="date"
              stroke="#666"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#666"
              fontSize={12}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "8px",
                color: "#ededed",
              }}
              formatter={(value) => [`${value}%`, "Sleep Performance"]}
            />
            <Line
              type="monotone"
              dataKey="sleepPerformance"
              stroke="#6366f1"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
