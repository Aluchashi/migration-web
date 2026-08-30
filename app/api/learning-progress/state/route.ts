import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Body = { jobId: string; status: "analysis" | "learning" };

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { jobId, status } = body;
  if (!jobId || (status !== "analysis" && status !== "learning")) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
  }

  await prisma.learningProgress.upsert({
    where: { userId_jobId: { userId: user.id, jobId } },
    create: { userId: user.id, jobId, status, startedAt: new Date() },
    update: { status },
  });

  return NextResponse.json({ ok: true });
}
