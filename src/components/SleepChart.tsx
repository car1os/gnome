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
    <div className="bg-surface rounded-xl p-4">
      <h2 className="text-foreground text-sm font-medium mb-3">
        Sleep Performance
      </h2>
      <div className="h-52 transition-opacity duration-500" style={{ opacity: visible ? 1 : 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="date"
              stroke="#555"
              fontSize={11}
              tickLine={false}
              interval={interval}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#555"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#2a2a2a",
                border: "1px solid #444",
                borderRadius: "8px",
                color: "#e0e0e0",
                fontSize: "0.78rem",
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
