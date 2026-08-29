"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type InvalidEvent } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { motion } from "motion/react";

import {
  AtIcon,
  FloatField,
  LockIcon,
  MailIcon,
  UserIcon,
} from "@/components/Elements/floating-field";
import { SwitchMode } from "@/components/Elements/switch-mode";
import type { AuthActionState } from "@/app/actions/auth";

type AuthAction = (
  state: AuthActionState,
  formData: FormData,
) => Promise<AuthActionState>;

type AuthFormProps = {
  action: AuthAction;
  mode: "login" | "register";
};

const initialState: AuthActionState = {};
type FieldName =
  | "name"
  | "identifier"
  | "username"
  | "password"
  | "confirmPassword";

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

function AuthHeader({ mode }: Pick<AuthFormProps, "mode">) {
  const isLogin = mode === "login";

  return (
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
        <SwitchMode accent="purple" />
        <Link
          href={isLogin ? "/register" : "/login"}
          className="rounded-lg border border-purple-200 bg-white/75 px-4 py-2 text-sm font-semibold text-purple-900 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-px hover:border-purple-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 sm:px-5"
        >
          {isLogin ? "Register" : "Log in"}
        </Link>
      </div>
    </header>
  );
}

function SubmitButton({ mode }: Pick<AuthFormProps, "mode">) {
  const { pending } = useFormStatus();

  return (
    <div className="flex justify-center">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-purple-400 to-purple-500 px-10 py-3 text-sm font-semibold text-purple-950 shadow-lg shadow-purple-900/20 transition-all duration-200 hover:-translate-y-px hover:from-purple-500 hover:to-purple-600 hover:shadow-xl hover:shadow-purple-900/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {pending ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
      </button>
    </div>
  );
}

export function AuthForm({ action, mode }: AuthFormProps) {
  const [state, formAction] = useFormState(action, initialState);
  const [clientErrors, setClientErrors] = useState<
    Partial<Record<FieldName, string | null>>
  >({});
  const isLogin = mode === "login";

  useEffect(() => {
    setClientErrors({});
  }, [state]);

  function validationMessage(input: HTMLInputElement) {
    if (input.validity.valueMissing) {
      return `${input.labels?.[0]?.textContent ?? "This field"} is required.`;
    }

    if (input.name === "username" && input.validity.patternMismatch) {
      return "Use 3-20 lowercase letters, numbers, or underscores.";
    }

    if (input.validity.tooShort) {
      return input.name === "name"
        ? "Name must be at least 2 characters."
        : "Password must be at least 8 characters.";
    }

    return "Check this field and try again.";
  }

  function handleInvalid(event: InvalidEvent<HTMLInputElement>) {
    event.preventDefault();
    const input = event.currentTarget;
    const field = input.name as FieldName;
    setClientErrors((current) => ({ ...current, [field]: validationMessage(input) }));
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const field = input.name as FieldName;

    if (clientErrors[field] || state.fieldErrors?.[field]) {
      setClientErrors((current) => ({
        ...current,
        [field]: input.validity.valid ? null : validationMessage(input),
      }));
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (isLogin) return;

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password && confirmPassword && password !== confirmPassword) {
      event.preventDefault();
      setClientErrors((current) => ({
        ...current,
        confirmPassword: "Passwords do not match.",
      }));
    }
  }

  function fieldError(field: FieldName) {
    if (field in clientErrors) {
      return clientErrors[field] ?? undefined;
    }

    return state.fieldErrors?.[field];
  }

  return (
    <section className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white dark:bg-black">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 dark:hidden"
        style={{
          background: "#ffffff",
          backgroundImage:
            "radial-gradient(circle at top center, rgba(173, 109, 244, 0.5), transparent 70%)",
          filter: "blur(80px)",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 hidden dark:block"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 100%, rgba(173, 109, 244, 0.6) 0%, transparent 60%),
            radial-gradient(circle at 50% 100%, rgba(147, 80, 255, 0.4) 0%, transparent 70%),
            radial-gradient(circle at 50% 100%, rgba(200, 160, 255, 0.3) 0%, transparent 80%)
          `,
        }}
      />

      <AuthHeader mode={mode} />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 210, damping: 24 }}
          className="w-full max-w-md rounded-3xl border border-purple-100 bg-white/85 p-7 shadow-2xl shadow-purple-950/10 backdrop-blur-xl dark:border-white/10 dark:bg-[#0c2923]/70 dark:shadow-black/40 sm:p-9"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/80 bg-white/90 shadow-lg shadow-sky-900/10 backdrop-blur dark:border-white/10 dark:bg-white/10">
            <span className="text-purple-600 dark:text-purple-300">
              {isLogin ? <UserIcon /> : <AtIcon />}
            </span>
          </div>

          <div className="mt-5 mb-7 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {isLogin
                ? "Log in with your username, email or phone."
                : "Start building a profile for your migration plans."}
            </p>
          </div>

          <form action={formAction} onSubmit={handleSubmit} autoComplete="off" className="space-y-4" noValidate={false}>
            {!isLogin && (
              <FloatField
                id="name"
                name="name"
                label="Name (as per national identity)"
                icon={<UserIcon />}
                autoComplete="name"
                required
                minLength={2}
                maxLength={80}
                error={fieldError("name")}
                onInvalid={handleInvalid}
                onFieldChange={handleChange}
              />
            )}

            <FloatField
              id="identifier"
              name="identifier"
              label={isLogin ? "Username, email, or phone" : "Email or phone"}
              icon={<MailIcon />}
              type="text"
              autoComplete="off"
              inputMode={isLogin ? undefined : "email"}
              required
              maxLength={320}
              error={fieldError("identifier")}
              onInvalid={handleInvalid}
              onFieldChange={handleChange}
            />

            {!isLogin && (
              <FloatField
                id="username"
                name="username"
                label="Username"
              icon={<AtIcon />}
              type="text"
              autoComplete="off"
                spellCheck={false}
                required
                minLength={3}
                maxLength={20}
                pattern="[a-z0-9_]{3,20}"
                error={fieldError("username")}
                onInvalid={handleInvalid}
                onFieldChange={handleChange}
              />
            )}

            <FloatField
              id="password"
              name="password"
              label="Password"
              icon={<LockIcon />}
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              toggleable
              error={fieldError("password")}
              onInvalid={handleInvalid}
              onFieldChange={handleChange}
            />

            {!isLogin && (
              <FloatField
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm password"
                icon={<LockIcon />}
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                toggleable
                error={fieldError("confirmPassword")}
                onInvalid={handleInvalid}
                onFieldChange={handleChange}
              />
            )}

            {state.error && (
              <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                {state.error}
              </p>
            )}

            <SubmitButton mode={mode} />
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-300">
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <Link
              href={isLogin ? "/register" : "/login"}
              className="font-semibold text-purple-700 underline-offset-4 transition-colors hover:text-purple-900 hover:underline dark:text-purple-300 dark:hover:text-purple-200"
            >
              {isLogin ? "Create an account" : "Log in"}
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
