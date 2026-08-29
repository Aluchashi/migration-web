"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";

import {
  AtIcon,
  FloatField,
  LockIcon,
  MailIcon,
} from "@/components/Elements/floating-field";
import { SwitchMode } from "@/components/Elements/switch-mode";

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" strokeLinecap="round" />
      <path d="M10.5 18.5h3" strokeLinecap="round" />
    </svg>
  );
}

function BrandMark() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-md shadow-emerald-900/25">
      <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="h-5 w-5">
        <path d="M21 3 3 10.5l6.5 2L11.5 19l3-6L21 3Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m9.5 12.5 11.5-9.5-9.5 11.5" strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.25)" />
      </svg>
    </span>
  );
}

const RESEND_COOLDOWN = 60;

export function RegisterOtpForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((value) => (value <= 1 ? 0 : value - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function submitRegistration() {
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, phone, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        return;
      }
      setStep(2);
      setCooldown(RESEND_COOLDOWN);
      setNotice("আপনার ইমেইলে ৬ সংখ্যার OTP পাঠানো হয়েছে।");
    } catch {
      setError("নেটওয়ার্ক সমস্যা। পরে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  async function submitVerification() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        return;
      }
      router.push("/login?verified=1");
    } catch {
      setError("নেটওয়ার্ক সমস্যা। পরে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, phone, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        return;
      }
      setCooldown(RESEND_COOLDOWN);
      setNotice("নতুন OTP আপনার ইমেইলে পাঠানো হয়েছে।");
    } catch {
      setError("নেটওয়ার্ক সমস্যা। পরে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  }

  function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("পাসওয়ার্ড মিলছে না।");
      return;
    }
    void submitRegistration();
  }

  function handleVerifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (otp.trim().length !== 6) {
      setError("৬ সংখ্যার OTP দিন।");
      return;
    }
    void submitVerification();
  }

  return (
    <section className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white dark:bg-black">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 dark:hidden"
        style={{
          background: "#ffffff",
          backgroundImage:
            "radial-gradient(circle at top center, rgba(255, 140, 60, 0.5), transparent 70%)",
          filter: "blur(80px)",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 hidden dark:block"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 100%, rgba(255, 69, 0, 0.6) 0%, transparent 60%),
            radial-gradient(circle at 50% 100%, rgba(255, 140, 0, 0.4) 0%, transparent 70%),
            radial-gradient(circle at 50% 100%, rgba(255, 215, 0, 0.3) 0%, transparent 80%)
          `,
        }}
      />

      <header className="relative z-20 flex w-full items-center justify-between px-5 py-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl outline-none transition-transform duration-200 hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-white/70"
          aria-label="Back to homepage"
        >
          <BrandMark />
          <span className="text-lg font-bold tracking-tight text-emerald-950 dark:text-emerald-300 sm:text-xl">
            Migration Web
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <SwitchMode accent="orange" />
          <Link
            href="/login"
            className="rounded-lg border border-orange-200 bg-white/75 px-4 py-2 text-sm font-semibold text-orange-900 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-px hover:border-orange-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 sm:px-5"
          >
            Log in
          </Link>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 210, damping: 24 }}
          className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white/85 p-7 shadow-2xl shadow-emerald-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-[#0c2923]/70 dark:shadow-black/40 sm:p-9"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/80 bg-white/90 shadow-lg shadow-sky-900/10 backdrop-blur dark:border-white/10 dark:bg-white/10">
            <span className="text-orange-600 dark:text-orange-300">
              {step === 1 ? <AtIcon /> : <MailIcon />}
            </span>
          </div>

          <div className="mt-5 mb-7 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
              {step === 1 ? "Create your account" : "Verify your email"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {step === 1
                ? "আপনার প্রোফাইল তৈরি দিয়ে শুরু করুন"
                : `আমরা ${email} এ OTP পাঠিয়েছি। ৬ সংখ্যার কোডটি লিখুন।`}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleRegisterSubmit} autoComplete="off" className="space-y-4" noValidate>
              <FloatField
                id="email"
                name="email"
                type="email"
                label="Email"
                icon={<MailIcon />}
                autoComplete="email"
                required
                maxLength={320}
                value={email}
                onFieldChange={(event) => setEmail(event.target.value)}
              />
              <FloatField
                id="username"
                name="username"
                type="text"
                label="Username"
                icon={<AtIcon />}
                autoComplete="username"
                spellCheck={false}
                required
                minLength={3}
                maxLength={20}
                pattern="[a-z0-9_]{3,20}"
                value={username}
                onFieldChange={(event) => setUsername(event.target.value)}
              />
              <FloatField
                id="phone"
                name="phone"
                type="tel"
                label="Phone (Bangladeshi, e.g. 01712345678)"
                icon={<PhoneIcon />}
                autoComplete="tel"
                inputMode="numeric"
                required
                value={phone}
                onFieldChange={(event) => setPhone(event.target.value)}
              />
              <FloatField
                id="password"
                name="password"
                type="password"
                label="Password"
                icon={<LockIcon />}
                autoComplete="new-password"
                required
                minLength={8}
                toggleable
                value={password}
                onFieldChange={(event) => setPassword(event.target.value)}
              />
              <FloatField
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                label="Confirm password"
                icon={<LockIcon />}
                autoComplete="new-password"
                required
                minLength={8}
                toggleable
                value={confirmPassword}
                onFieldChange={(event) => setConfirmPassword(event.target.value)}
              />

              {error && (
                <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                  {error}
                </p>
              )}

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-orange-400 to-orange-500 px-10 py-3 text-sm font-semibold text-orange-950 shadow-lg shadow-orange-900/20 transition-all duration-200 hover:-translate-y-px hover:from-orange-500 hover:to-orange-600 hover:shadow-xl hover:shadow-orange-900/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? "Please wait..." : "Register"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifySubmit} autoComplete="off" className="space-y-4" noValidate>
              <FloatField
                id="otp"
                name="otp"
                type="text"
                label="6-digit OTP"
                icon={<MailIcon />}
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={otp}
                onFieldChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
              />

              {notice && (
                <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                  {notice}
                </p>
              )}
              {error && (
                <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                  {error}
                </p>
              )}

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-orange-400 to-orange-500 px-10 py-3 text-sm font-semibold text-orange-950 shadow-lg shadow-orange-900/20 transition-all duration-200 hover:-translate-y-px hover:from-orange-500 hover:to-orange-600 hover:shadow-xl hover:shadow-orange-900/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? "Please wait..." : "Verify & create account"}
                </button>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => void resendOtp()}
                  disabled={cooldown > 0 || loading}
                  className="inline-flex items-center justify-center rounded-xl border border-orange-300 bg-white/70 px-8 py-3 text-sm font-semibold text-orange-700 transition-all duration-200 hover:border-orange-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-orange-400/60 dark:bg-white/[0.06] dark:text-orange-300"
                >
                  {cooldown > 0 ? `Resend OTP (${cooldown}s)` : "Resend OTP"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError(null);
                  setNotice(null);
                }}
                disabled={loading}
                className="w-full text-center text-sm font-medium text-orange-700 underline-offset-4 transition-colors hover:text-orange-900 hover:underline dark:text-orange-300"
              >
                Back to details
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-300">
            Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-orange-700 underline-offset-4 transition-colors hover:text-orange-900 hover:underline dark:text-orange-300 dark:hover:text-orange-200"
              >
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
