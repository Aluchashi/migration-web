import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile-form";
import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Profile | Migration Web",
};

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

function toMonthInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 7);
}

export default async function ProfilePage() {
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

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-700">
          Your profile
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
          Tell us about yourself
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
          The more complete your background, the smarter your career matches, skill gap
          analysis, and roadmap will be.
        </p>
      </div>

      <ProfileForm
        initialValues={{
          name: user.name,
          dateOfBirth: toDateInputValue(profile?.dateOfBirth ?? null),
          nid: profile?.nid ?? "",
          phone: profile?.phone ?? "",
          district: profile?.district ?? "",
          skills: profile?.skills ?? [],
          softSkills: profile?.softSkills ?? [],
          budget: profile?.budget ?? "",
          preferredRegions: profile?.preferredRegions ?? [],
          timeline: profile?.timeline ?? "",
          familyStatus: profile?.familyStatus ?? "",
          workExperiences: (profile?.workExperiences ?? []).map((entry) => ({
            jobTitle: entry.jobTitle,
            industry: entry.industry,
            employer: entry.employer ?? "",
            years: entry.years !== null ? String(entry.years) : "",
            currentlyWorking: entry.currentlyWorking,
            startDate: toMonthInputValue(entry.startDate),
            endDate: toMonthInputValue(entry.endDate),
            description: entry.description ?? "",
          })),
          educationEntries: (profile?.educationEntries ?? []).map((entry) => ({
            level: entry.level,
            field: entry.field ?? "",
            institution: entry.institution ?? "",
            passingYear: entry.passingYear !== null ? String(entry.passingYear) : "",
            result: entry.result ?? "",
          })),
          languages: (profile?.languages ?? []).map((entry) => ({
            name: entry.name,
            proficiency: entry.proficiency,
          })),
        }}
      />
    </main>
  );
}
