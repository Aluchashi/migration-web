"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { normalizePhone } from "@/lib/identifier";
import { prisma } from "@/lib/prisma";
import {
  EDUCATION_LEVELS,
  FAMILY_STATUSES,
  PROFICIENCY_LEVELS,
  TIMELINES,
} from "@/lib/profile-options";

export type ProfileActionState = {
  error?: string;
  success?: string;
};

type WorkInput = {
  jobTitle: string;
  industry: string;
  employer: string | null;
  years: number | null;
  currentlyWorking: boolean;
  startDate: Date | null;
  endDate: Date | null;
  description: string | null;
};

type EducationInput = {
  level: string;
  field: string | null;
  institution: string | null;
  passingYear: number | null;
  result: string | null;
};

type LanguageInput = { name: string; proficiency: string };

function clean(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const result = value.trim();
  return result && result.length <= maxLength ? result : null;
}

function parseJsonArray(raw: unknown): unknown[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseMonth(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}-01T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function cleanList(raw: unknown, maxItems: number, maxItemLength: number) {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const item of parseJsonArray(raw)) {
    if (typeof item !== "string") continue;
    const value = item.trim();
    const key = value.toLocaleLowerCase();
    if (!value || value.length > maxItemLength || seen.has(key)) continue;
    seen.add(key);
    items.push(value);
    if (items.length >= maxItems) break;
  }

  return items;
}

function parseWorkExperiences(raw: FormDataEntryValue | null) {
  const entries: WorkInput[] = [];

  for (const item of parseJsonArray(raw)) {
    if (entries.length >= 15) break;
    if (typeof item !== "object" || item === null) continue;
    const entry = item as Record<string, unknown>;

    const jobTitle = clean(entry.jobTitle, 120);
    const industry = clean(entry.industry, 60);
    if (!jobTitle || !industry) continue;

    const currentlyWorking = entry.currentlyWorking === true;
    const startDate = parseMonth(entry.startDate);
    const endDate = currentlyWorking ? null : parseMonth(entry.endDate);

    const yearsRaw = entry.years;
    const years =
      typeof yearsRaw === "number" && Number.isInteger(yearsRaw) && yearsRaw >= 0 && yearsRaw <= 60
        ? yearsRaw
        : null;

    entries.push({
      jobTitle,
      industry,
      employer: clean(entry.employer, 120),
      years,
      currentlyWorking,
      startDate,
      endDate,
      description: clean(entry.description, 1000),
    });
  }

  return entries;
}

function parseEducationEntries(raw: FormDataEntryValue | null) {
  const entries: EducationInput[] = [];

  for (const item of parseJsonArray(raw)) {
    if (entries.length >= 15) break;
    if (typeof item !== "object" || item === null) continue;
    const entry = item as Record<string, unknown>;

    const level = clean(entry.level, 80);
    if (!level || !EDUCATION_LEVELS.includes(level)) continue;

    const passingYearRaw = entry.passingYear;
    const passingYear =
      typeof passingYearRaw === "number" &&
      Number.isInteger(passingYearRaw) &&
      passingYearRaw >= 1970 &&
      passingYearRaw <= 2030
        ? passingYearRaw
        : null;

    entries.push({
      level,
      field: clean(entry.field, 120),
      institution: clean(entry.institution, 160),
      passingYear,
      result: clean(entry.result, 60),
    });
  }

  return entries;
}

function parseLanguages(raw: FormDataEntryValue | null) {
  const entries: LanguageInput[] = [];
  const seen = new Set<string>();

  for (const item of parseJsonArray(raw)) {
    if (entries.length >= 12) break;
    if (typeof item !== "object" || item === null) continue;
    const entry = item as Record<string, unknown>;

    const name = clean(entry.name, 40);
    const proficiency = clean(entry.proficiency, 20);
    if (!name || !proficiency || !PROFICIENCY_LEVELS.includes(proficiency)) continue;

    const key = name.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    entries.push({ name, proficiency });
  }

  return entries;
}

function isTransientDatabaseError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      ["P1001", "P1002", "P2024"].includes(error.code))
  );
}

async function wait(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function saveProfile(
  _previousState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { error: "Your session has expired. Please log in again." };
  }

  const name = clean(formData.get("name"), 80);
  const phoneRaw = clean(formData.get("phone"), 20);
  const phone = phoneRaw ? normalizePhone(phoneRaw) : null;
  const district = clean(formData.get("district"), 80);
  const nid = clean(formData.get("nid"), 17);
  const budget = clean(formData.get("budget"), 100);
  const timelineValue = clean(formData.get("timeline"), 100);
  const timeline = timelineValue && TIMELINES.includes(timelineValue) ? timelineValue : null;
  const familyValue = clean(formData.get("familyStatus"), 100);
  const familyStatus =
    familyValue && FAMILY_STATUSES.includes(familyValue) ? familyValue : null;

  const dateRaw = clean(formData.get("dateOfBirth"), 10);
  const dateOfBirth =
    dateRaw && /^\d{4}-\d{2}-\d{2}$/.test(dateRaw) ? new Date(`${dateRaw}T00:00:00.000Z`) : null;
  if (dateOfBirth && Number.isNaN(dateOfBirth.getTime())) {
    return { error: "Enter a valid date of birth." };
  }

  const skills = cleanList(formData.get("skillsJson"), 30, 60);
  const softSkills = cleanList(formData.get("softSkillsJson"), 20, 60);
  const preferredRegions = cleanList(formData.get("preferredRegionsJson"), 10, 80);

  const workExperiences = parseWorkExperiences(formData.get("workExperienceJson"));
  const educationEntries = parseEducationEntries(formData.get("educationJson"));
  const languages = parseLanguages(formData.get("languagesJson"));

  if (!name || name.length < 2) {
    return { error: "Full name is required (at least 2 characters)." };
  }

  if (!phone) {
    return {
      error: "A valid Bangladeshi mobile number is required (e.g. 01712345678).",
    };
  }

  if (nid && !/^\d{8,17}$/.test(nid)) {
    return { error: "NID should be 8-17 digits with no spaces or letters." };
  }

  if (educationEntries.length === 0) {
    return { error: "Add at least one education entry (degree or certificate)." };
  }

  const data = {
    dateOfBirth,
    nid,
    phone,
    district,
    skills,
    softSkills,
    budget,
    preferredRegions,
    timeline,
    familyStatus,
  };

  const saveAll = async () => {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { name } });

      const profile = await tx.profile.upsert({
        where: { userId: user.id },
        create: { userId: user.id, ...data },
        update: data,
        select: { id: true },
      });

      await tx.workExperience.deleteMany({ where: { profileId: profile.id } });
      await tx.educationEntry.deleteMany({ where: { profileId: profile.id } });
      await tx.languageEntry.deleteMany({ where: { profileId: profile.id } });

      if (workExperiences.length > 0) {
        await tx.workExperience.createMany({
          data: workExperiences.map((entry, index) => ({ ...entry, profileId: profile.id, order: index })),
        });
      }

      if (educationEntries.length > 0) {
        await tx.educationEntry.createMany({
          data: educationEntries.map((entry, index) => ({ ...entry, profileId: profile.id, order: index })),
        });
      }

      if (languages.length > 0) {
        await tx.languageEntry.createMany({
          data: languages.map((entry, index) => ({ ...entry, profileId: profile.id, order: index })),
        });
      }
    });
  };

  try {
    await saveAll();
  } catch (error) {
    if (!isTransientDatabaseError(error)) throw error;

    await wait(400);

    try {
      await saveAll();
    } catch (retryError) {
      if (!isTransientDatabaseError(retryError)) throw retryError;

      return {
        error: "The database is temporarily unavailable. Your entries are still here; please try saving again.",
      };
    }
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/career-matcher");
  revalidatePath("/dashboard");

  return { success: "Profile saved." };
}
