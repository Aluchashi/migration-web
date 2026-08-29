"use server";

import { revalidatePath } from "next/cache";

import { getAuthenticatedUser } from "@/lib/auth-user";
import { normalizePhone } from "@/lib/identifier";
import { prisma } from "@/lib/prisma";

type AccountActionState = {
  error?: string;
  success?: string;
};

function clean(value: FormDataEntryValue | null, maxLength: number) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return trimmed.length <= maxLength ? trimmed : "";
}

export async function updateAccount(
  _previousState: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { error: "Your session has expired. Please log in again." };
  }

  const name = clean(formData.get("name"), 80);
  const phoneRaw = clean(formData.get("phone"), 20);
  const phone = phoneRaw ? normalizePhone(phoneRaw) : null;

  if (name.length < 2) {
    return { error: "Full name is required (at least 2 characters)." };
  }

  if (!phone) {
    return {
      error: "A valid Bangladeshi mobile number is required (e.g. 01712345678).",
    };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { name, phone },
    });
  } catch {
    return { error: "Could not save your changes. Please try again." };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");

  return { success: "Account details saved." };
}
