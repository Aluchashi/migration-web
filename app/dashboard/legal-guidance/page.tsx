import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LegalGuidance } from "@/components/Page7-Legal/legal-guidance";
import { COUNTRY_LEGAL, LEGAL_CORRIDORS, PRE_DEPARTURE_STEPS } from "@/lib/legal-process";
import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Legal Migration Guidance" };

export default async function LegalGuidancePage({
  searchParams,
}: {
  searchParams: { country?: string };
}) {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { preferredRegions: true },
  });

  const requested = typeof searchParams.country === "string" ? searchParams.country : undefined;
  const initialCorridorId =
    (requested && COUNTRY_LEGAL[requested] ? requested : undefined) ??
    LEGAL_CORRIDORS.find((corridor) => profile?.preferredRegions?.includes(corridor.country))
      ?.corridorId ??
    LEGAL_CORRIDORS[0].corridorId;

  const rows = await prisma.legalGuidanceChecklistProgress.findMany({ where: { userId: user.id } });
  const checklistProgress: Record<string, Record<string, Record<string, true>>> = {};
  for (const row of rows) {
    ((checklistProgress[row.countryId] ??= {})[row.phaseId] ??= {})[row.itemId] = true;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <LegalGuidance
        steps={PRE_DEPARTURE_STEPS}
        countries={Object.values(COUNTRY_LEGAL)}
        corridors={LEGAL_CORRIDORS}
        initialCorridorId={initialCorridorId}
        checklistProgress={checklistProgress}
      />
    </div>
  );
}
