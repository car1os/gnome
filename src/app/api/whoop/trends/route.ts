import { NextRequest, NextResponse } from "next/server";
import { getSession, setSession } from "@/lib/session";
import { getClient } from "@/lib/whoop-client";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startParam = request.nextUrl.searchParams.get("start");
  const endParam = request.nextUrl.searchParams.get("end");

  let startDate: string;
  let endDate: string | undefined;
  let days: number;

  if (startParam && endParam) {
    // Custom date range
    const startMs = new Date(startParam).getTime();
    const endMs = new Date(endParam).getTime();
    if (isNaN(startMs) || isNaN(endMs) || startMs > endMs) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }
    startDate = new Date(startParam).toISOString();
    // Add 1 day to end to include the full end date
    const endPlusOne = new Date(endParam);
    endPlusOne.setDate(endPlusOne.getDate() + 1);
    endDate = endPlusOne.toISOString();
    days = Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24));
  } else {
    // Preset range
    const range = parseInt(request.nextUrl.searchParams.get("range") || "30");
    const validRanges = [7, 30, 90, 180, 365];
    days = validRanges.includes(range) ? range : 30;
    const start = new Date();
    start.setDate(start.getDate() - days);
    startDate = start.toISOString();
  }

  try {
    const { client, updatedTokens } = await getClient(session);

    if (updatedTokens) {
      await setSession({
        ...session,
        accessToken: updatedTokens.accessToken,
        refreshToken: updatedTokens.refreshToken,
        expiresAt: updatedTokens.expiresAt,
      });
    }

    const params: { start: string; end?: string } = { start: startDate };
    if (endDate) params.end = endDate;

    // Fetch sequentially to avoid hitting WHOOP's rate limit on large ranges
    const cycles = await client.cycle.getAll(params);
    const recoveries = await client.recovery.getAll(params);
    const sleeps = await client.sleep.getAll(params);
    const workouts = await client.workout.getAll(params);

    // Group workouts by date string (YYYY-MM-DD)
    const workoutsByDate = new Map<string, { sport: string; strain: number }[]>();
    for (const w of workouts) {
      if (w.score_state !== "SCORED" || !w.score) continue;
      const dateKey = new Date(w.start).toISOString().slice(0, 10);
      const entry = {
        sport: w.sport_name || "Activity",
        strain: w.score.strain,
      };
      const existing = workoutsByDate.get(dateKey);
      if (existing) existing.push(entry);
      else workoutsByDate.set(dateKey, [entry]);
    }

    // Build recovery map by cycle_id
    const recoveryMap = new Map(
      recoveries
        .filter((r) => r.score_state === "SCORED" && r.score)
        .map((r) => [r.cycle_id, r.score!])
    );

    // Build sleep map by sleep_id (from recovery)
    const sleepMap = new Map(
      sleeps
        .filter((s) => s.score_state === "SCORED" && s.score && !s.nap)
        .map((s) => [s.id, s])
    );

    // Recovery + sleep linked by recovery's sleep_id
    const recoverySleepMap = new Map<number, typeof sleeps[number]>();
    for (const r of recoveries) {
      if (r.score_state === "SCORED" && r.sleep_id) {
        const sleep = sleepMap.get(r.sleep_id);
        if (sleep) recoverySleepMap.set(r.cycle_id, sleep);
      }
    }

    // Transform to chart data joined on cycle
    const chartData = cycles
      .filter((c) => c.score_state === "SCORED" && c.score)
      .map((cycle) => {
        const date = new Date(cycle.start).toLocaleDateString("en-US",
          days >= 90
            ? { month: "numeric", day: "numeric" }
            : { month: "short", day: "numeric" }
        );
        const recovery = recoveryMap.get(cycle.id);
        const sleep = recoverySleepMap.get(cycle.id);

        const dateKey = new Date(cycle.start).toISOString().slice(0, 10);

        return {
          date,
          rawDate: cycle.start,
          recovery: recovery?.recovery_score ?? null,
          hrv: recovery?.hrv_rmssd_milli ?? null,
          rhr: recovery?.resting_heart_rate ?? null,
          strain: cycle.score!.strain,
          sleepPerformance: sleep?.score?.sleep_performance_percentage ?? null,
          sleepHours: sleep?.score
            ? sleep.score.stage_summary.total_in_bed_time_milli / 3_600_000
            : null,
          workouts: workoutsByDate.get(dateKey) ?? [],
        };
      })
      .sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime());

    // Compute averages
    const scored = chartData.filter((d) => d.recovery !== null);
    const avgRecovery =
      scored.length > 0
        ? Math.round(scored.reduce((s, d) => s + d.recovery!, 0) / scored.length)
        : null;

    const withSleep = chartData.filter((d) => d.sleepHours !== null);
    const avgSleepHours =
      withSleep.length > 0
        ? parseFloat(
            (withSleep.reduce((s, d) => s + d.sleepHours!, 0) / withSleep.length).toFixed(1)
          )
        : null;

    const withStrain = chartData.filter((d) => d.strain !== null);
    const avgStrain =
      withStrain.length > 0
        ? parseFloat(
            (withStrain.reduce((s, d) => s + d.strain!, 0) / withStrain.length).toFixed(1)
          )
        : null;

    return NextResponse.json({
      data: chartData,
      summary: { avgRecovery, avgSleepHours, avgStrain },
    });
  } catch (err) {
    console.error("Trends API error:", err);
    const status = (err as { statusCode?: number }).statusCode === 429 ? 429 : 500;
    const message = status === 429 ? "Rate limited by WHOOP" : "Failed to fetch trends";
    return NextResponse.json({ error: message }, { status });
  }
}
