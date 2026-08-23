"use server";

import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import {
  isEmail,
  normalizeEmail,
  normalizePhone,
  normalizeUsername,
} from "@/lib/identifier";
import { prisma } from "@/lib/prisma";

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

export async function register(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const rawIdentifier = String(formData.get("identifier") ?? "").trim();
  const rawUsername = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (name.length < 2 || name.length > 80) {
    return { fieldErrors: { name: "Name must be between 2 and 80 characters." } };
  }

  let email: string | null = null;
  let phone: string | null = null;

  if (rawIdentifier) {
    if (isEmail(rawIdentifier)) {
      email = normalizeEmail(rawIdentifier);
      if (email.length > 320) {
        return { fieldErrors: { identifier: "Enter a valid email address or phone number." } };
      }
    } else {
      phone = normalizePhone(rawIdentifier);
      if (!phone) {
        return {
          fieldErrors: {
            identifier:
              "Enter a valid email address or a Bangladeshi mobile number (e.g. 01712345678).",
          },
        };
      }
    }
  } else {
    return { fieldErrors: { identifier: "Email or phone is required." } };
  }

  const username = normalizeUsername(rawUsername);
  if (!username) {
    return {
      fieldErrors: {
        username:
          "Username must be 3-20 characters using only lowercase letters, numbers, and underscores.",
      },
    };
  }

  if (password.length < 8) {
    return { fieldErrors: { password: "Password must be at least 8 characters." } };
  }

  if (Buffer.byteLength(password, "utf8") > 72) {
    return { fieldErrors: { password: "Password must be no more than 72 bytes." } };
  }

  if (password !== confirmPassword) {
    return { fieldErrors: { confirmPassword: "Passwords do not match." } };
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
        username,
        email,
        phone,
        password: passwordHash,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(",")
        : "";
      const conflictField = target.includes("username")
        ? "username"
        : target.includes("phone")
          ? "phone"
          : target.includes("email")
            ? "email"
            : null;

      if (conflictField === "username") {
        return { fieldErrors: { username: "This username is already taken. Try another." } };
      }

      return {
        error: "An account already exists with this email or phone number.",
      };
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
      identifier: email ?? phone,
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
