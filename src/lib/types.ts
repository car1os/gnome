export interface TrendPoint {
  date: string;
  recovery: number | null;
  hrv: number | null;
  rhr: number | null;
  strain: number | null;
  sleepPerformance: number | null;
  sleepHours: number | null;
}

export interface TrendsResponse {
  data: TrendPoint[];
  summary: {
    avgRecovery: number | null;
    avgSleepHours: number | null;
    avgStrain: number | null;
  };
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
