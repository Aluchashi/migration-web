import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import OpenAI from "openai";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { parseCareerMatch } from "@/lib/career-match";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const systemPrompt = `You are a migration career advisor for Bangladeshi workers.
Give realistic, general career and country guidance based only on the supplied profile. Do not promise visa approval, employment, or migration outcomes. Do not name or recommend specific recruiting agencies. Treat all salary figures as approximate estimates and say so within each expectedSalaryRange.

Respond ONLY with valid JSON in exactly this shape:
{
  "suggestedCountries": [
    { "country": "string", "matchScore": 0, "reasons": "string" }
  ],
  "suggestedJobs": [
    { "job": "string", "eligibility": "string", "expectedSalaryRange": "string" }
  ],
  "missingRequirements": ["string"]
}

Return 3 to 5 countries and 3 to 6 jobs. matchScore must be a number from 0 to 100. Keep explanations concise. JSON must not contain markdown, comments, or additional keys.`;

export async function POST() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      workExperiences: { orderBy: { order: "asc" } },
      educationEntries: { orderBy: { order: "asc" } },
      languages: { orderBy: { order: "asc" } },
    },
  });

  if (!profile) {
    return NextResponse.json(
      { error: "Complete and save your profile before requesting recommendations." },
      { status: 400 },
    );
  }

  const hasContent =
    profile.workExperiences.length > 0 ||
    profile.educationEntries.length > 0 ||
    profile.skills.length > 0 ||
    profile.softSkills.length > 0;

  if (!hasContent) {
    return NextResponse.json(
      { error: "Add your work experience, education, or skills before requesting recommendations." },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI is not configured yet. Add OPENAI_API_KEY to .env.local." },
      { status: 503 },
    );
  }

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1_500,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            workExperience: profile.workExperiences.map((entry) => ({
              jobTitle: entry.jobTitle,
              industry: entry.industry,
              years: entry.years,
              currentlyWorking: entry.currentlyWorking,
              duties: entry.description,
            })),
            education: profile.educationEntries.map((entry) => ({
              level: entry.level,
              field: entry.field,
              institution: entry.institution,
              passingYear: entry.passingYear,
            })),
            skills: profile.skills,
            softSkills: profile.softSkills,
            languages: profile.languages.map((entry) => ({
              name: entry.name,
              proficiency: entry.proficiency,
            })),
            budget: profile.budget,
            preferredRegions: profile.preferredRegions,
            timeline: profile.timeline,
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message.content;
    if (!content) {
      return NextResponse.json({ error: "OpenAI returned an empty response." }, { status: 502 });
    }

    let decoded: unknown;
    try {
      decoded = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "OpenAI returned invalid JSON. Please try again." }, { status: 502 });
    }

    const result = parseCareerMatch(decoded);
    if (!result) {
      return NextResponse.json(
        { error: "OpenAI returned an unexpected response shape. Please try again." },
        { status: 502 },
      );
    }

    const saved = await prisma.careerMatch.create({
      data: {
        userId: user.id,
        suggestedCountries: result.suggestedCountries as Prisma.InputJsonValue,
        suggestedJobs: result.suggestedJobs as Prisma.InputJsonValue,
        missingRequirements: result.missingRequirements as Prisma.InputJsonValue,
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({
      match: {
        id: saved.id,
        createdAt: saved.createdAt.toISOString(),
        ...result,
      },
    });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI career matcher request failed", {
        status: error.status,
        code: error.code,
      });

      const status = error.status === 429 ? 429 : 502;
      const message =
        error.status === 429
          ? "The recommendation service is busy. Please wait and try again."
          : "The recommendation service could not complete the request.";
      return NextResponse.json({ error: message }, { status });
    }

    console.error("Career matcher failed", error);
    return NextResponse.json({ error: "Could not generate recommendations." }, { status: 500 });
  }
}
