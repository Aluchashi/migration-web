import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CareerMatcher, type CareerMatchView } from "@/components/career-matcher";
import { getAuthenticatedUser } from "@/lib/auth-user";
import { parseCareerMatch } from "@/lib/career-match";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Career Matcher | Migration Web",
};

export default async function CareerMatcherPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, latest] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        workExperiences: { select: { id: true } },
        educationEntries: { select: { id: true } },
      },
    }),
    prisma.careerMatch.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const hasProfile = Boolean(
    profile &&
      (profile.skills.length > 0 ||
        profile.softSkills.length > 0 ||
        profile.educationEntries.length > 0 ||
        profile.workExperiences.length > 0),
  );
  const parsed = latest
    ? parseCareerMatch({
        suggestedCountries: latest.suggestedCountries,
        suggestedJobs: latest.suggestedJobs,
        missingRequirements: latest.missingRequirements,
      })
    : null;
  const initialMatch: CareerMatchView | null = latest && parsed
    ? { id: latest.id, createdAt: latest.createdAt.toISOString(), ...parsed }
    : null;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <CareerMatcher hasProfile={hasProfile} initialMatch={initialMatch} />
    </main>
  );
}
