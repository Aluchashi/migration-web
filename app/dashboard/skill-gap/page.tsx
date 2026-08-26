import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SkillGapAnalyzer, type SkillGapReportView } from "@/components/Page6-Skill/skill-gap-analyzer";
import { getAuthenticatedUser } from "@/lib/auth-user";
import { parseCareerMatch } from "@/lib/career-match";
import { prisma } from "@/lib/prisma";
import { parseSkillGap } from "@/lib/skill-gap";

export const metadata: Metadata = {
  title: "Skill Gap Analyzer | Migration Web",
};

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export default async function SkillGapPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, careerMatch, latestReport] = await Promise.all([
    prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        workExperiences: { select: { id: true } },
        educationEntries: { select: { id: true } },
      },
    }),
    prisma.careerMatch.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.skillGapReport.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const parsedMatch = careerMatch
    ? parseCareerMatch({
        suggestedCountries: careerMatch.suggestedCountries,
        suggestedJobs: careerMatch.suggestedJobs,
        missingRequirements: careerMatch.missingRequirements,
      })
    : null;
  const parsedReport = latestReport
    ? parseSkillGap({ missingSkills: latestReport.missingSkills })
    : null;
  const initialReport: SkillGapReportView | null = latestReport && parsedReport
    ? {
        id: latestReport.id,
        targetJob: latestReport.targetJob,
        targetCountry: latestReport.targetCountry,
        createdAt: latestReport.createdAt.toISOString(),
        ...parsedReport,
      }
    : null;
  const hasProfile = Boolean(
    profile &&
      (profile.skills.length > 0 ||
        profile.softSkills.length > 0 ||
        profile.educationEntries.length > 0 ||
        profile.workExperiences.length > 0),
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <SkillGapAnalyzer
        hasProfile={hasProfile}
        jobSuggestions={unique(parsedMatch?.suggestedJobs.map((item) => item.job) ?? [])}
        countrySuggestions={unique(parsedMatch?.suggestedCountries.map((item) => item.country) ?? [])}
        initialReport={initialReport}
      />
    </main>
  );
}
