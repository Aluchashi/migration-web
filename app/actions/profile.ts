"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

type ProfileField =
  | "currentJob"
  | "yearsExperience"
  | "skills"
  | "education"
  | "languages"
  | "budget"
  | "preferredRegion";

export type ProfileActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Partial<Record<ProfileField, string>>;
};

function optionalText(formData: FormData, field: ProfileField) {
  const value = String(formData.get(field) ?? "").trim();
  return value || null;
}

function commaSeparatedList(formData: FormData, field: "skills" | "languages") {
  const seen = new Set<string>();

  return String(formData.get(field) ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => {
      const key = item.toLocaleLowerCase();
      if (!item || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
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

  const currentJob = optionalText(formData, "currentJob");
  const yearsValue = String(formData.get("yearsExperience") ?? "").trim();
  const yearsExperience = yearsValue === "" ? null : Number(yearsValue);
  const skills = commaSeparatedList(formData, "skills");
  const education = optionalText(formData, "education");
  const languages = commaSeparatedList(formData, "languages");
  const budget = optionalText(formData, "budget");
  const preferredRegion = optionalText(formData, "preferredRegion");
  const fieldErrors: ProfileActionState["fieldErrors"] = {};

  if (currentJob && currentJob.length > 120) {
    fieldErrors.currentJob = "Current job must be 120 characters or fewer.";
  }

  if (
    yearsExperience !== null &&
    (!Number.isInteger(yearsExperience) || yearsExperience < 0 || yearsExperience > 60)
  ) {
    fieldErrors.yearsExperience = "Enter a whole number between 0 and 60.";
  }

  if (skills.length > 30 || skills.some((skill) => skill.length > 60)) {
    fieldErrors.skills = "Add up to 30 skills, with 60 characters or fewer each.";
  }

  if (education && education.length > 160) {
    fieldErrors.education = "Education must be 160 characters or fewer.";
  }

  if (languages.length > 20 || languages.some((language) => language.length > 60)) {
    fieldErrors.languages = "Add up to 20 languages, with 60 characters or fewer each.";
  }

  if (budget && budget.length > 100) {
    fieldErrors.budget = "Budget must be 100 characters or fewer.";
  }

  if (preferredRegion && preferredRegion.length > 100) {
    fieldErrors.preferredRegion = "Preferred region must be 100 characters or fewer.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const data = {
    currentJob,
    yearsExperience,
    skills,
    education,
    languages,
    budget,
    preferredRegion,
  };

  const upsertProfile = () =>
    prisma.profile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...data },
      update: data,
    });

  try {
    await upsertProfile();
  } catch (error) {
    if (!isTransientDatabaseError(error)) throw error;

    await wait(400);

    try {
      await upsertProfile();
    } catch (retryError) {
      if (!isTransientDatabaseError(retryError)) throw retryError;

      return {
        error: "The database is temporarily unavailable. Your entries are still here; please try saving again.",
      };
    }
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/career-matcher");

  return { success: "Profile saved." };
}
