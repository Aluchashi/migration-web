"use client";

import {
  useState,
  type InputHTMLAttributes,
  type InvalidEvent,
  type ReactNode,
} from "react";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="3" y="5" width="18" height="14" rx="2" strokeLinecap="round" />
      <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="8" r="4" strokeLinecap="round" />
      <path d="M5 20c1.4-3 4-4.5 7-4.5s5.6 1.5 7 4.5" strokeLinecap="round" />
    </svg>
  );
}

export function AtIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="12" r="4" strokeLinecap="round" />
      <path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1" strokeLinecap="round" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="5" y="10" width="14" height="10" rx="2" strokeLinecap="round" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}

export function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M3 3l18 18M10.6 5.9A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-2.2 3M19.8 19.8 4.2 4.2M6.2 6.2C3.9 8 2.5 12 2.5 12S6 18.5 12 18.5c1.5 0 2.9-.4 4.1-1" strokeLinecap="round" />
    </svg>
  );
}

export function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="3" y="8" width="18" height="12" rx="2" strokeLinecap="round" />
      <path d="M9 8V6.5A1.5 1.5 0 0 1 10.5 5h3A1.5 1.5 0 0 1 15 6.5V8M3 13h18" strokeLinecap="round" />
    </svg>
  );
}

export function GraduationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="m2.5 9.5 9.5-4.5 9.5 4.5-9.5 4.5-9.5-4.5Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 11.5v4.2c0 1 2.5 2.3 5.5 2.3s5.5-1.3 5.5-2.3v-4.2" strokeLinecap="round" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="4" y="6" width="16" height="14" rx="2" strokeLinecap="round" />
      <path d="M8 3.5V7m8-3.5V7M4 10.5h16" strokeLinecap="round" />
    </svg>
  );
}

export function IdIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <rect x="3" y="5" width="18" height="14" rx="2" strokeLinecap="round" />
      <circle cx="9" cy="11" r="2" strokeLinecap="round" />
      <path d="M6 16.2c.7-1.2 1.8-1.7 3-1.7s2.3.5 3 1.7M15 10h3.5M15 13.5h3.5" strokeLinecap="round" />
    </svg>
  );
}

export function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.3 2.2 3.5 5.1 3.5 8.5s-1.2 6.3-3.5 8.5c-2.3-2.2-3.5-5.1-3.5-8.5S9.7 5.7 12 3.5Z" />
    </svg>
  );
}

export function WalletIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
      <path d="M4 7.5A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5v-9Z" />
      <path d="M15 12h2.5M4 9.5h16" strokeLinecap="round" />
    </svg>
  );
}

type FloatFieldProps = {
  label: string;
  icon?: ReactNode;
  error?: string;
  onInvalid?: (event: InvalidEvent<HTMLInputElement>) => void;
  onFieldChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  toggleable?: boolean;
  alwaysFloat?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "onInvalid">;

export function FloatField({
  label,
  icon,
  error,
  onInvalid,
  onFieldChange,
  toggleable,
  alwaysFloat,
  type,
  ...inputProps
}: FloatFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(
    Boolean(
      inputProps.defaultValue !== undefined &&
        String(inputProps.defaultValue) !== "",
    ),
  );
  const [revealed, setRevealed] = useState(false);

  const floated = focused || hasValue || Boolean(alwaysFloat);

  return (
    <div>
      <div className="relative">
        {icon ? (
          <span
            aria-hidden
            className={cx(
              "pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 transition-colors duration-200",
              error
                ? "text-red-500"
                : floated
                  ? "text-sky-600 dark:text-sky-400"
                  : "text-zinc-400 dark:text-zinc-500",
            )}
          >
            {icon}
          </span>
        ) : null}

        <input
          {...inputProps}
          type={toggleable ? (revealed ? "text" : "password") : type}
          placeholder=" "
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            setFocused(false);
            setHasValue(event.target.value !== "");
          }}
          onInvalid={onInvalid}
          onChange={(event) => {
            setHasValue(event.target.value !== "");
            onFieldChange?.(event);
          }}
          aria-invalid={Boolean(error)}
          className={cx(
            "h-14 w-full rounded-xl border bg-white/70 text-sm text-zinc-950 outline-none backdrop-blur-sm transition-all duration-200 placeholder:text-transparent dark:bg-white/[0.08] dark:text-white",
            icon ? "pl-12" : "pl-4",
            toggleable ? "pr-12" : "pr-4",
            error
              ? "border-red-400 ring-4 ring-red-100 focus:border-red-500 dark:ring-red-950"
              : "border-white/80 shadow-sm hover:border-sky-300 hover:bg-white/85 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100 dark:border-white/15 dark:hover:border-sky-400/60 dark:hover:bg-white/[0.12] dark:focus:border-sky-400 dark:focus:bg-white/[0.14] dark:focus:ring-sky-500/20",
          )}
        />

        <label
          htmlFor={inputProps.id}
          className={cx(
            "pointer-events-none absolute select-none rounded-md px-1.5 transition-all duration-200",
            floated
              ? "-top-2.5 text-[11px] font-medium"
              : "top-1/2 -translate-y-1/2 text-sm",
            icon ? (floated ? "left-9" : "left-12") : "left-4",
            error
              ? "bg-white text-red-600 dark:bg-[#122540] dark:text-red-400"
              : floated
                ? "bg-white text-sky-700 dark:bg-[#122540] dark:text-sky-300"
                : "text-zinc-500 dark:text-zinc-400",
          )}
        >
          {label}
        </label>

        {toggleable ? (
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            aria-label={revealed ? "Hide password" : "Show password"}
            className="absolute right-2.5 top-1/2 z-10 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
          >
            {revealed ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="mt-1.5 pl-1 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
