"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";

export type AuthActionState = {
  error?: string;
  fieldErrors?: {
    name?: string;
    identifier?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
  };
};

export async function login(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!identifier) {
    return { fieldErrors: { identifier: "Enter your username, email, or phone." } };
  }

  if (password.length < 8) {
    return { fieldErrors: { password: "Password must be at least 8 characters." } };
  }

  try {
    await signIn("credentials", {
      identifier,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "The credentials are incorrect. Check and try again." };
    }

    throw error;
  }

  return {};
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
