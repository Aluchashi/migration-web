import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { PRE_DEPARTURE_STEPS } from "@/lib/legal-process";

export const runtime = "nodejs";

type Body = { countryId: string; phaseId: string; itemId: string; completed: boolean };

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { countryId, phaseId, itemId, completed } = body;
  if (!countryId || !phaseId || !itemId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (completed) {
    await prisma.legalGuidanceChecklistProgress.upsert({
      where: { userId_countryId_phaseId_itemId: { userId: user.id, countryId, phaseId, itemId } },
      create: { userId: user.id, countryId, phaseId, itemId, completedAt: new Date() },
      update: { completedAt: new Date() },
    });
  } else {
    await prisma.legalGuidanceChecklistProgress.deleteMany({
      where: { userId: user.id, countryId, phaseId, itemId },
    });
  }

  const step = PRE_DEPARTURE_STEPS.find((item) => item.id === phaseId);
  if (step) {
    const total = step.documents.length;
    const doneCount = await prisma.legalGuidanceChecklistProgress.count({
      where: { userId: user.id, countryId, phaseId, completed: true },
    });
    if (total > 0 && doneCount >= total) {
      await prisma.legalStepProgress.upsert({
        where: { userId_corridorId_stepId: { userId: user.id, corridorId: countryId, stepId: phaseId } },
        create: { userId: user.id, corridorId: countryId, stepId: phaseId, completedAt: new Date() },
        update: { completedAt: new Date() },
      });
    } else {
      await prisma.legalStepProgress.deleteMany({
        where: { userId: user.id, corridorId: countryId, stepId: phaseId },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
