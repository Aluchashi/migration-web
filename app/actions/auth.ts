"use server";

import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export type AuthActionState = {
  error?: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    password?: string;
  };
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function login(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!emailPattern.test(email)) {
    return { fieldErrors: { email: "Enter a valid email address." } };
  }

  if (password.length < 8) {
    return { fieldErrors: { password: "Password must be at least 8 characters." } };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "The email or password is incorrect." };
    }

    throw error;
  }

  return {};
}

export async function register(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (name.length < 2 || name.length > 80) {
    return { fieldErrors: { name: "Name must be between 2 and 80 characters." } };
  }

  if (email.length > 320 || !emailPattern.test(email)) {
    return { fieldErrors: { email: "Enter a valid email address." } };
  }

  if (password.length < 8) {
    return { fieldErrors: { password: "Password must be at least 8 characters." } };
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    return { fieldErrors: { password: "Password must be no more than 72 bytes." } };
  }

  if (!process.env.DATABASE_URL) {
    return {
      error: "Registration is temporarily unavailable because the database connection is not configured.",
    };
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "An account with this email already exists." };
    }

    if (
      error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientValidationError
    ) {
      return {
        error: "Registration is temporarily unavailable. Check the database connection and try again.",
      };
    }

    throw error;
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created, but automatic login failed. Please log in." };
    }

    throw error;
  }

  return {};
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}
