import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { isEmail, normalizeEmail } from "@/lib/identifier";
import { sendConfirmationEmail } from "@/lib/mailer";

export const runtime = "nodejs";

type VerifyBody = {
  email?: unknown;
  otp?: unknown;
};

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "অবৈধ অনুরোধ।" }, { status: 400 });
  }

  const { email, otp } = (body ?? {}) as VerifyBody;
  if (typeof email !== "string" || typeof otp !== "string") {
    return NextResponse.json({ error: "ইমেইল ও OTP দিন।" }, { status: 400 });
  }

  const normalizedEmail = normalizeEmail(email);
  if (!isEmail(normalizedEmail)) {
    return NextResponse.json({ error: "সঠিক ইমেইল দিন।" }, { status: 400 });
  }

  const pending = await prisma.pendingRegistration.findUnique({
    where: { email: normalizedEmail },
  });
  if (!pending) {
    return NextResponse.json(
      { error: "কোনো রেজিস্ট্রেশন রিকোয়েস্ট পাওয়া যায়নি। আবার শুরু করুন।" },
      { status: 404 },
    );
  }

  if (new Date() > pending.otpExpiry) {
    await prisma.pendingRegistration.delete({ where: { email: normalizedEmail } });
    return NextResponse.json(
      { error: "OTP-এর মেয়াদ শেষ। আবার রেজিস্ট্রেশন করুন।" },
      { status: 410 },
    );
  }

  const otpMatch = await bcrypt.compare(otp.trim(), pending.otp);
  if (!otpMatch) {
    return NextResponse.json(
      { error: "ভুল OTP। আবার চেষ্টা করুন।" },
      { status: 400 },
    );
  }

  await prisma.user.create({
    data: {
      email: pending.email,
      username: pending.username,
      phone: pending.phone,
      password: pending.password,
      verified: true,
    },
  });

  await prisma.pendingRegistration.delete({ where: { email: normalizedEmail } });

  try {
    await sendConfirmationEmail(pending.email);
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
  }

  return NextResponse.json({
    success: true,
    message: "অ্যাকাউন্ট ভেরিফাই করা হয়েছে। এখন লগ ইন করুন।",
  });
}
