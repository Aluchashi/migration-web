import { NextResponse } from "next/server";

import { assessScamRisk, validateScamRiskInput } from "@/lib/scam-risk";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validation = validateScamRiskInput(body);
  if (!validation.valid || !validation.data) {
    return NextResponse.json(
      { error: validation.errors?.[0] ?? "Invalid agency details." },
      { status: 400 },
    );
  }

  try {
    const result = assessScamRisk(validation.data);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Could not assess the agency risk." },
      { status: 502 },
    );
  }
}
