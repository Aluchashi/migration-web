import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: { jobId: string } },
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId } = params;

  const [state, topicRows] = await Promise.all([
    prisma.learningProgress.findUnique({ where: { userId_jobId: { userId: user.id, jobId } } }),
    prisma.topicProgress.findMany({
      where: { userId: user.id, jobId, completed: true },
      select: { topicId: true },
    }),
  ]);

  const topics: Record<string, true> = {};
  for (const row of topicRows) topics[row.topicId] = true;

  return NextResponse.json({ status: state?.status ?? "analysis", topics });
}
