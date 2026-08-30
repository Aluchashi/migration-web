import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Body = { jobId: string; phaseId: string; topicId: string; completed: boolean };

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { jobId, phaseId, topicId, completed } = body;
  if (!jobId || !phaseId || !topicId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (completed) {
    await prisma.topicProgress.upsert({
      where: { userId_jobId_phaseId_topicId: { userId: user.id, jobId, phaseId, topicId } },
      create: { userId: user.id, jobId, phaseId, topicId, completedAt: new Date() },
      update: { completedAt: new Date() },
    });
  } else {
    await prisma.topicProgress.deleteMany({
      where: { userId: user.id, jobId, phaseId, topicId },
    });
  }

  return NextResponse.json({ ok: true });
}
