import type { ProfileSnapshot } from "@/lib/career-scoring";

type ProfileWorkExperience = { years: number | null; jobTitle: string; industry: string };
type ProfileEducationEntry = { level: string };
type ProfileLanguageEntry = { name: string; proficiency: string };

export type ProfileWithRelations = {
  dateOfBirth: Date | null;
  skills: string[];
  softSkills: string[];
  budget: string | null;
  timeline: string | null;
  preferredRegions: string[];
  workExperiences: ProfileWorkExperience[];
  educationEntries: ProfileEducationEntry[];
  languages: ProfileLanguageEntry[];
} | null;

export function ageFrom(dateOfBirth: Date | null): number | null {
  if (!dateOfBirth) return null;
  const now = new Date();
  let age = now.getFullYear() - dateOfBirth.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - dateOfBirth.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < dateOfBirth.getUTCDate())) {
    age -= 1;
  }
  return age >= 0 && age <= 100 ? age : null;
}

function unique(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function buildSnapshot(profile: ProfileWithRelations): ProfileSnapshot | null {
  if (!profile) return null;

  return {
    age: ageFrom(profile.dateOfBirth),
    skills: profile.skills,
    softSkills: profile.softSkills,
    languages: profile.languages.map((entry) => ({ name: entry.name, proficiency: entry.proficiency })),
    experienceYears: profile.workExperiences.reduce((total, entry) => total + (entry.years ?? 0), 0),
    jobTitles: unique(profile.workExperiences.map((entry) => entry.jobTitle)),
    industries: unique(profile.workExperiences.map((entry) => entry.industry)),
    educationLevels: unique(profile.educationEntries.map((entry) => entry.level)),
    budgetBand: profile.budget,
    preferredRegions: profile.preferredRegions,
    timeline: profile.timeline,
  };
}
