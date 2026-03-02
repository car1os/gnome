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
  strain: number | null;
}

export function StrainChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h2 className="text-foreground text-lg font-semibold mb-4">Strain</h2>
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
              domain={[0, 21]}
              stroke="#666"
              fontSize={12}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "8px",
                color: "#ededed",
              }}
              formatter={(value) => [Number(value).toFixed(1), "Strain"]}
            />
            <Line
              type="monotone"
              dataKey="strain"
              stroke="#f97316"
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
