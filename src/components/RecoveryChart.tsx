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

export function RecoveryChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h2 className="text-foreground text-lg font-semibold mb-4">Recovery</h2>
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
              formatter={(value) => [`${value}%`, "Recovery"]}
            />
            <ReferenceLine
              y={67}
              stroke="#00d1b2"
              strokeDasharray="3 3"
              strokeOpacity={0.4}
            />
            <ReferenceLine
              y={33}
              stroke="#ff4444"
              strokeDasharray="3 3"
              strokeOpacity={0.4}
            />
            <Line
              type="monotone"
              dataKey="recovery"
              stroke="#00d1b2"
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
