export interface WorkoutMark {
  sport: string;
  strain: number;
}

export interface TrendPoint {
  date: string;
  recovery: number | null;
  hrv: number | null;
  rhr: number | null;
  strain: number | null;
  sleepPerformance: number | null;
  sleepHours: number | null;
  workouts: WorkoutMark[];
}

export interface TrendsResponse {
  data: TrendPoint[];
  summary: {
    avgRecovery: number | null;
    avgSleepHours: number | null;
    avgStrain: number | null;
  };
}

export type DateRange =
  | { kind: "preset"; days: number }
  | { kind: "custom"; startDate: string; endDate: string }; // YYYY-MM-DD

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
