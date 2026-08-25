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
} from "@/components/floating-field";
import { SwitchMode } from "@/components/switch-mode";
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
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 shadow-md shadow-sky-900/30">
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
        <span className="text-base font-bold tracking-tight text-white drop-shadow-sm sm:text-lg">
          Migration Web
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <SwitchMode />
        <Link
          href={isLogin ? "/register" : "/login"}
          className="rounded-full border border-white/60 bg-white/20 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-px hover:bg-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:px-5"
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
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-950 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-zinc-950/20 transition-all duration-200 hover:-translate-y-px hover:from-zinc-700 hover:shadow-xl hover:shadow-zinc-950/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
    >
      {pending ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
    </button>
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
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-[#2e86c1] from-10% via-[#8ecdf1] via-55% to-[#f3fafe] dark:from-[#07142b] dark:from-10% dark:via-[#0d2340] dark:via-55% dark:to-[#14304a]">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%]">
        <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-white via-white/95 to-transparent dark:from-[#16324c] dark:via-[#16324c]/95" />
        <div className="absolute -bottom-28 -left-[10%] h-80 w-[75%] rounded-full bg-white/90 blur-2xl dark:bg-white/10" />
        <div className="absolute -bottom-32 left-[25%] h-96 w-[85%] rounded-full bg-white/95 blur-3xl dark:bg-white/[0.12]" />
        <div className="absolute -bottom-24 right-[-15%] h-80 w-[70%] rounded-full bg-white/90 blur-2xl dark:bg-white/10" />
        <div className="absolute -bottom-16 left-[5%] h-40 w-[45%] rounded-full bg-sky-100/80 blur-xl dark:bg-white/[0.06]" />
        <div className="absolute -bottom-20 right-[10%] h-44 w-[50%] rounded-full bg-sky-100/70 blur-xl dark:bg-white/[0.05]" />
        <div className="absolute bottom-40 left-[15%] h-16 w-72 rounded-full bg-white/50 blur-2xl dark:bg-white/[0.08]" />
        <div className="absolute bottom-48 right-[18%] h-12 w-60 rounded-full bg-white/40 blur-2xl dark:bg-white/[0.06]" />
        <div className="absolute bottom-64 left-1/2 h-10 w-52 -translate-x-1/2 rounded-full bg-white/30 blur-2xl dark:bg-white/[0.05]" />
      </div>

      <AuthHeader mode={mode} />

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 22, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 210, damping: 24 }}
          className="w-full max-w-md rounded-3xl border border-white/70 bg-white/70 p-7 shadow-2xl shadow-sky-900/15 backdrop-blur-xl dark:border-white/10 dark:bg-[#0c1c30]/70 dark:shadow-black/40 sm:p-9"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/80 bg-white/90 shadow-lg shadow-sky-900/10 backdrop-blur dark:border-white/10 dark:bg-white/10">
            <span className="text-sky-600 dark:text-sky-400">
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
              className="font-semibold text-sky-700 underline-offset-4 transition-colors hover:text-sky-900 hover:underline dark:text-sky-400 dark:hover:text-sky-300"
            >
              {isLogin ? "Create an account" : "Log in"}
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
