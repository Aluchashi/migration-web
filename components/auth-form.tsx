"use client";

import Link from "next/link";
import { useEffect, useState, type InvalidEvent } from "react";
import { useFormState, useFormStatus } from "react-dom";

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
type FieldName = "name" | "email" | "password";

function SubmitButton({ mode }: Pick<AuthFormProps, "mode">) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-11 w-full items-center justify-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
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

    if (input.validity.typeMismatch) {
      return "Enter a valid email address.";
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

  function fieldError(field: FieldName) {
    if (field in clientErrors) {
      return clientErrors[field] ?? undefined;
    }

    return state.fieldErrors?.[field];
  }

  function inputClass(field: FieldName) {
    return [
      "h-11 w-full rounded-md border bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400",
      fieldError(field)
        ? "border-red-400 ring-2 ring-red-100 focus:border-red-500 focus:ring-red-100"
        : "border-zinc-300 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100",
    ].join(" ");
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-7">
        <p className="text-sm font-medium text-emerald-700">Migration Web</p>
        <h1 className="mt-2 text-3xl font-semibold text-zinc-950">
          {isLogin ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          {isLogin
            ? "Log in to continue to your migration dashboard."
            : "Start building a profile for your migration plans."}
        </p>
      </div>

      <form action={formAction} className="space-y-5" noValidate={false}>
        {!isLogin && (
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-zinc-800">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              aria-invalid={Boolean(fieldError("name"))}
              aria-describedby={fieldError("name") ? "name-error" : undefined}
              onInvalid={handleInvalid}
              onChange={handleChange}
              className={inputClass("name")}
              placeholder="Your name"
            />
            {fieldError("name") && (
              <p id="name-error" className="mt-1.5 text-sm text-red-600">
                {fieldError("name")}
              </p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-800">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={320}
            aria-invalid={Boolean(fieldError("email"))}
            aria-describedby={fieldError("email") ? "email-error" : undefined}
            onInvalid={handleInvalid}
            onChange={handleChange}
            className={inputClass("email")}
            placeholder="you@example.com"
          />
          {fieldError("email") && (
            <p id="email-error" className="mt-1.5 text-sm text-red-600">
              {fieldError("email")}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-800">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
            minLength={8}
            aria-invalid={Boolean(fieldError("password"))}
            aria-describedby={fieldError("password") ? "password-error" : "password-hint"}
            onInvalid={handleInvalid}
            onChange={handleChange}
            className={inputClass("password")}
            placeholder={isLogin ? "Your password" : "At least 8 characters"}
          />
          {fieldError("password") ? (
            <p id="password-error" className="mt-1.5 text-sm text-red-600">
              {fieldError("password")}
            </p>
          ) : !isLogin ? (
            <p id="password-hint" className="mt-1.5 text-xs text-zinc-500">
              Use at least 8 characters.
            </p>
          ) : null}
        </div>

        {state.error && (
          <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </p>
        )}

        <SubmitButton mode={mode} />
      </form>

      <p className="mt-6 text-center text-sm text-zinc-600">
        {isLogin ? "New to Migration Web?" : "Already have an account?"}{" "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="font-semibold text-emerald-700 hover:text-emerald-800"
        >
          {isLogin ? "Register" : "Log in"}
        </Link>
      </p>
    </div>
  );
}
