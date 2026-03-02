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
    <div className="bg-surface rounded-xl p-4">
      <h2 className="text-foreground text-sm font-medium mb-3">Recovery</h2>
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
