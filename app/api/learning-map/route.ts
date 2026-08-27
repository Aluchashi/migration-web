import { NextResponse } from "next/server";
import OpenAI from "openai";

import { parseLearningMap } from "@/lib/learning-map";

export const runtime = "nodejs";

function parseJsonContent(content: string): unknown {
  let text = content.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text.replace(/,(\s*[}\]])/g, "$1");
    return JSON.parse(cleaned);
  }
}

const SYSTEM_PROMPT = `You are a career coach for migrant workers from Bangladesh planning to work abroad. You create practical, honest learning maps that explain which skills a worker likely already has, which they must develop, and an ordered step-by-step plan to become job-ready. Keep advice concrete, low-cost, and relevant to the destination country's labour market. Always respond with a single JSON object.`;

const USER_TEMPLATE = (country: string, job: string, position: string) => `Create a personalized learning map for a Bangladeshi worker targeting the position "${position}" (job category "${job}") in ${country}.

Return ONLY a JSON object with this exact shape:
{
  "target": { "country": "${country}", "job": "${job}", "position": "${position}" },
  "readinessScore": <integer 0-100 estimating current job readiness for this role>,
  "existingSkills": [ { "name": "string", "level": "strong" | "developing", "reason": "string" } ],
  "skillGaps": [ { "name": "string", "reason": "string", "priority": "high" | "medium" | "low" } ],
  "roadmap": [ { "step": <integer>, "title": "string", "priority": "high" | "medium" | "low", "description": "string", "estimatedEffort": "string (optional, e.g. 2 weeks)" } ],
  "jobReadiness": { "strengths": ["string"], "improvements": ["string"], "recommendations": ["string"] }
}

Rules:
- "existingSkills" lists capabilities a typical Bangladeshi worker already brings (e.g. basic literacy, physical stamina, prior field experience). Each MUST include "level" as exactly "strong" (already confident) or "developing" (needs more practice).
- "skillGaps" lists specific skills/certifications/qualifications needed for "${position}" in ${country}.
- "roadmap" is an ordered list of 4-8 concrete steps (training, certification, language, document prep) the worker should follow in order. Number "step" sequentially starting at 1. Set "priority" for each. Provide "estimatedEffort" as a short string only when meaningful; otherwise OMIT the field (do not use null).
- Keep all text concise and plain-language. Respond with JSON only.`;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The learning map service is not configured on the server." },
      { status: 503 },
    );
  }

  let body: { country?: unknown; job?: unknown; position?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { country, job, position } = body;
  if (
    typeof country !== "string" ||
    typeof job !== "string" ||
    typeof position !== "string"
  ) {
    return NextResponse.json(
      { error: "Target country, job, and position are required." },
      { status: 400 },
    );
  }

  const openai = new OpenAI({ apiKey, baseURL: process.env.OPENAI_BASE_URL });
  const model = process.env.OPENAI_MODEL ?? "gemini-2.0-flash";

  try {
    const completion = await openai.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      max_tokens: 3_000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: USER_TEMPLATE(country, job, position) },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    const parsed = parseLearningMap(parseJsonContent(content));
    if (!parsed) {
      return NextResponse.json(
        { error: "Could not build your learning map. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ learningMap: parsed });
  } catch {
    return NextResponse.json(
      { error: "The learning map service is temporarily unavailable." },
      { status: 502 },
    );
  }
}
