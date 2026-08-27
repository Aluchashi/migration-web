import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LearningMap } from "@/components/Page8-Roadmap/learning-roadmap";
import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Learning Roadmap | Migration Web" };

type ProfileSummary = {
  currentJob: string | null;
  education: string | null;
  yearsExperience: number | null;
  skills: string[];
  languages: string[];
  location: string;
};

export default async function LearningRoadmapPage() {
  const user = await getAuthenticatedUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      workExperiences: {
        select: { jobTitle: true, years: true },
        orderBy: { order: "asc" },
      },
      educationEntries: {
        select: { level: true, field: true },
        orderBy: { order: "asc" },
      },
      languages: { select: { name: true }, orderBy: { order: "asc" } },
    },
  });

  const hasProfile = Boolean(
    profile &&
      (profile.skills.length > 0 ||
        profile.softSkills.length > 0 ||
        profile.educationEntries.length > 0 ||
        profile.workExperiences.length > 0 ||
        profile.languages.length > 0),
  );

  const totalExperience = profile
    ? profile.workExperiences.reduce(
        (sum, entry) => sum + (typeof entry.years === "number" ? entry.years : 0),
        0,
      )
    : 0;

  const profileSummary: ProfileSummary = {
    currentJob: profile?.workExperiences[0]?.jobTitle ?? null,
    education: profile?.educationEntries[0]
      ? `${profile.educationEntries[0].level}${
          profile.educationEntries[0].field ? ` in ${profile.educationEntries[0].field}` : ""
        }`
      : null,
    yearsExperience: totalExperience > 0 ? totalExperience : null,
    skills: profile?.skills ?? [],
    languages: profile?.languages.map((entry) => entry.name) ?? [],
    location: profile?.district ?? "",
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <LearningMap hasProfile={hasProfile} profile={profileSummary} />
    </main>
  );
}
