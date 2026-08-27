"use server";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export type LegalProgressResult = { error?: string };

export async function toggleLegalStep(
  corridorId: string,
  stepId: string,
  completed: boolean,
): Promise<LegalProgressResult> {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Unauthorized" };

  if (completed) {
    await prisma.legalStepProgress.upsert({
      where: { userId_corridorId_stepId: { userId: user.id, corridorId, stepId } },
      create: { userId: user.id, corridorId, stepId, completedAt: new Date() },
      update: { completedAt: new Date() },
    });
  } else {
    await prisma.legalStepProgress.deleteMany({
      where: { userId: user.id, corridorId, stepId },
    });
  }

  return {};
}
