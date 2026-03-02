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
import { WorkoutMark } from "@/lib/types";

interface DataPoint {
  date: string;
  strain: number | null;
  workouts: WorkoutMark[];
}

function WorkoutTicks(props: { cx?: number; cy?: number; payload?: { workouts?: WorkoutMark[] } }) {
  const { cx, payload } = props;
  if (!cx || !payload?.workouts?.length) return null;

  return (
    <g>
      {payload.workouts.map((_, i) => (
        <line
          key={i}
          x1={cx + (i - (payload.workouts!.length - 1) / 2) * 3}
          x2={cx + (i - (payload.workouts!.length - 1) / 2) * 3}
          y1={0}
          y2={8}
          stroke="var(--chart-strain)"
          strokeWidth={1}
          strokeOpacity={0.4}
        />
      ))}
    </g>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; payload: DataPoint }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  const workouts = point.workouts ?? [];

  return (
    <div style={{ backgroundColor: "var(--surface)", borderRadius: "4px", padding: "8px 10px", color: "var(--foreground)", fontSize: "0.7rem" }}>
      <div style={{ marginBottom: workouts.length ? 4 : 0 }}>{label}: {Number(point.strain).toFixed(1)} strain</div>
      {workouts.map((w, i) => (
        <div key={i} style={{ color: "var(--text-muted)" }}>{w.sport} — {w.strain.toFixed(1)}</div>
      ))}
    </div>
  );
}

export function StrainChart({ data, dataLength, visible }: { data: DataPoint[]; dataLength: number; visible: boolean }) {
  const interval = Math.max(0, Math.ceil(dataLength / 10) - 1);
  return (
    <div className="bg-surface rounded p-8">
      <h2 className="text-[10px] uppercase tracking-[0.2em] text-text-muted font-normal mb-4">Strain</h2>
      <div className="h-64 transition-opacity duration-700" style={{ opacity: visible ? 1 : 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 0, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="date"
              stroke="var(--text-dim)"
              fontSize={10}
              tickLine={false}
              interval={interval}
            />
            <YAxis
              domain={[0, 21]}
              stroke="var(--text-dim)"
              fontSize={10}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="strain"
              stroke="var(--chart-strain)"
              strokeWidth={1.5}
              dot={<WorkoutTicks />}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
