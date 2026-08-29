import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";

import { prisma } from "@/lib/prisma";
import {
  isEmail,
  normalizeEmail,
  normalizePhone,
  normalizeUsername,
} from "@/lib/identifier";
import { sendOtpEmail } from "@/lib/mailer";

export const runtime = "nodejs";

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const OTP_LENGTH = 6;
const MIN_PASSWORD = 8;

type RegisterBody = {
  email?: unknown;
  username?: unknown;
  phone?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "অবৈধ অনুরোধ।" }, { status: 400 });
  }

  const { email, username, phone, password, confirmPassword } = (body ?? {}) as RegisterBody;

  if (
    typeof email !== "string" ||
    typeof phone !== "string" ||
    typeof password !== "string"
  ) {
    return NextResponse.json({ error: "সব তথ্য সঠিকভাবে দিন।" }, { status: 400 });
  }

  const normalizedEmail = normalizeEmail(email);
  if (!isEmail(normalizedEmail)) {
    return NextResponse.json({ error: "সঠিক ইমেইল দিন।" }, { status: 400 });
  }

  const normalizedPhone = normalizePhone(phone);
  if (!normalizedPhone) {
    return NextResponse.json(
      { error: "সঠিক বাংলাদেশি ফোন নম্বর দিন (যেমন: 01XXXXXXXXX)।" },
      { status: 400 },
    );
  }

  const rawUsername = typeof username === "string" ? username.trim() : "";
  const normalizedUsername = normalizeUsername(rawUsername);
  if (!normalizedUsername) {
    return NextResponse.json(
      {
        error:
          "ইউজারনেম ৩-২০ অক্ষরের হতে হবে এবং ছোট হাতের ইংরেজি অক্ষর, সংখ্যা ও আন্ডারস্কোর ব্যবহার করা যাবে।",
      },
      { status: 400 },
    );
  }

  if (typeof confirmPassword !== "string" || password !== confirmPassword) {
    return NextResponse.json({ error: "পাসওয়ার্ড মিলছে না।" }, { status: 400 });
  }

  if (password.length < MIN_PASSWORD) {
    return NextResponse.json(
      { error: `পাসওয়ার্ড কমপক্ষে ${MIN_PASSWORD} অক্ষরের হতে হবে।` },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: normalizedEmail },
        { phone: normalizedPhone },
        { username: normalizedUsername },
      ],
    },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "এই ইমেইল, ফোন বা ইউজারনেম ইতিমধ্যে ব্যবহৃত হয়েছে।" },
      { status: 409 },
    );
  }

  const usernameTakenPending = await prisma.pendingRegistration.findFirst({
    where: { username: normalizedUsername, NOT: { email: normalizedEmail } },
    select: { id: true },
  });
  if (usernameTakenPending) {
    return NextResponse.json(
      { error: "এই ইউজারনেম ইতিমধ্যে নেওয়া হয়েছে।" },
      { status: 409 },
    );
  }

  const pending = await prisma.pendingRegistration.findUnique({
    where: { email: normalizedEmail },
  });
  if (pending) {
    const elapsed = Date.now() - pending.lastSentAt.getTime();
    if (elapsed < RESEND_COOLDOWN_MS) {
      const wait = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
      return NextResponse.json(
        { error: `আবার OTP পেতে ${wait} সেকেন্ড অপেক্ষা করুন।`, retryAfter: wait },
        { status: 429 },
      );
    }
  }

  const otp = String(randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH));
  const hashedOtp = await bcrypt.hash(otp, 10);
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.pendingRegistration.upsert({
    where: { email: normalizedEmail },
    update: {
      username: normalizedUsername,
      phone: normalizedPhone,
      password: hashedPassword,
      otp: hashedOtp,
      otpExpiry: new Date(Date.now() + OTP_TTL_MS),
      lastSentAt: new Date(),
    },
    create: {
      email: normalizedEmail,
      username: normalizedUsername,
      phone: normalizedPhone,
      password: hashedPassword,
      otp: hashedOtp,
      otpExpiry: new Date(Date.now() + OTP_TTL_MS),
      lastSentAt: new Date(),
    },
  });

  try {
    await sendOtpEmail(normalizedEmail, otp);
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    return NextResponse.json(
      { error: "OTP ইমেইল পাঠাতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।" },
      { status: 502 },
    );
  }

  return NextResponse.json({
    success: true,
    message: "আপনার ইমেইলে OTP পাঠানো হয়েছে।",
  });
}
