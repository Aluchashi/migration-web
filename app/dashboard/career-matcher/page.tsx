import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { CareerMatcher } from "@/components/Page5-CareerCountry/career-matcher";
import { getAuthenticatedUser } from "@/lib/auth-user";
import { findEssentialGaps } from "@/lib/career-scoring";
import { buildSnapshot } from "@/lib/profile-snapshot";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Career Matcher | Porizayi",
};

export default async function CareerMatcherPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const t = await getTranslations("Dashboard.careerMatcher");

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
      ? Array.from(new Set([...essentialGaps, t("essentialFallback")]))
      : essentialGaps;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <CareerMatcher
        snapshot={hasAnyCoreData ? snapshot : null}
        essentialGaps={effectiveGaps}
      />
    </div>
  );
}
