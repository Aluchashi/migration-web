import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CareerMatcher } from "@/components/Page5-CareerCountry/career-matcher";
import { getAuthenticatedUser } from "@/lib/auth-user";
import { findEssentialGaps } from "@/lib/career-scoring";
import { buildSnapshot } from "@/lib/profile-snapshot";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Career Matcher | Migration Web",
};

export default async function CareerMatcherPage() {
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

  const essentialGaps = snapshot ? findEssentialGaps(snapshot) : [];

  const hasAnyCoreData = Boolean(
    snapshot &&
      (snapshot.skills.length > 0 ||
        snapshot.softSkills.length > 0 ||
        snapshot.educationLevels.length > 0 ||
        snapshot.jobTitles.length > 0),
  );

  const effectiveGaps =
    snapshot && !hasAnyCoreData
      ? Array.from(
          new Set([
            ...essentialGaps,
            "Add your work experience, education, or skills",
          ]),
        )
      : essentialGaps;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <CareerMatcher
        snapshot={hasAnyCoreData ? snapshot : null}
        essentialGaps={effectiveGaps}
      />
    </main>
  );
}
