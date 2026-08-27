import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { CorridorDetail } from "@/components/Page5-CareerCountry/corridor-detail";
import { MIGRATION_CORRIDORS } from "@/lib/migration-corridors";
import { getAuthenticatedUser } from "@/lib/auth-user";
import { computeMatchForCorridor, DEFAULT_WEIGHTS, findEssentialGaps } from "@/lib/career-scoring";
import { buildSnapshot } from "@/lib/profile-snapshot";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Career Detail | Migration Web",
};

export function generateStaticParams() {
  return MIGRATION_CORRIDORS.map((corridor) => ({ corridorId: corridor.id }));
}

export default async function CorridorDetailPage({
  params,
}: {
  params: { corridorId: string };
}) {
  const corridor = MIGRATION_CORRIDORS.find((entry) => entry.id === params.corridorId);
  if (!corridor) {
    notFound();
  }

  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      workExperiences: { orderBy: { order: "asc" } },
      educationEntries: { orderBy: { order: "asc" } },
      languages: { orderBy: { order: "asc" } },
    },
  });

  const snapshot = buildSnapshot(profile);
  const result = snapshot ? computeMatchForCorridor(corridor, snapshot, DEFAULT_WEIGHTS) : null;
  const essentialGaps = snapshot ? findEssentialGaps(snapshot) : [];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <CorridorDetail corridor={corridor} result={result} essentialGaps={essentialGaps} />
    </main>
  );
}
