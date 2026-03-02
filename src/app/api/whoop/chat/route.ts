import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSession } from "@/lib/session";
import { ChatMessage, DateRange, TrendsResponse } from "@/lib/types";

const anthropic = new Anthropic();

function buildSystemPrompt(context: TrendsResponse, range: DateRange): string {
  const { summary, data } = context;

  const rangeLabel =
    range.kind === "preset"
      ? `last ${range.days} days`
      : `${range.startDate} to ${range.endDate}`;

  const dailyRows = data
    .map(
      (d) =>
        `${d.date}: recovery=${d.recovery ?? "—"}%, hrv=${d.hrv ?? "—"}ms, rhr=${d.rhr ?? "—"}bpm, strain=${d.strain ?? "—"}, sleep=${d.sleepHours !== null ? d.sleepHours.toFixed(1) : "—"}hrs (${d.sleepPerformance ?? "—"}%)`
    )
    .join("\n");

  return `You are a health insights assistant for a WHOOP user. You have access to their recent health data and help them understand trends, patterns, and actionable takeaways.

## User's WHOOP Data (${rangeLabel})

### Summary
- Average Recovery: ${summary.avgRecovery ?? "N/A"}%
- Average Sleep: ${summary.avgSleepHours ?? "N/A"} hours
- Average Strain: ${summary.avgStrain ?? "N/A"}

### Daily Data
${dailyRows}

## Guidelines
- Reference specific data points and dates when answering questions.
- Identify trends (improving, declining, stable) when relevant.
- Keep answers concise but insightful — a few sentences to a short paragraph.
- You are not a doctor. Avoid definitive medical diagnoses. Frame insights as observations and suggestions.
- If the user asks about data you don't have, say so.`;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.accessToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, context, range } = (await request.json()) as {
    messages: ChatMessage[];
    context: TrendsResponse;
    range: DateRange;
  };

  if (!messages?.length || !context) {
    return new Response(JSON.stringify({ error: "Bad request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const systemPrompt = buildSystemPrompt(context, range);

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        console.error("Chat stream error:", err);
        controller.enqueue(
          encoder.encode("\n\n[Error generating response. Please try again.]")
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
