import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { countryId: string } },
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { countryId } = params;

  const rows = await prisma.legalGuidanceChecklistProgress.findMany({
    where: { userId: user.id, countryId },
    select: { phaseId: true, itemId: true },
  });

  const progress: Record<string, Record<string, true>> = {};
  for (const row of rows) {
    (progress[row.phaseId] ??= {})[row.itemId] = true;
  }

  return NextResponse.json(progress);
}
