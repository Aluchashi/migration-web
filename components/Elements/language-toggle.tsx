"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: "en" | "bn") {
    if (next === locale) return;
    document.cookie = `NEXT_LOCALE=${next};path=/;max-age=31536000;samesite=lax`;
    startTransition(() => router.refresh());
  }

  const base =
    "rounded-md px-2 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2";

  return (
    <div
      className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white/80 p-0.5"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => switchTo("en")}
        className={`${base} ${locale === "en" ? "bg-emerald-700 text-white" : "text-zinc-600 hover:text-emerald-800"}`}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchTo("bn")}
        className={`${base} ${locale === "bn" ? "bg-emerald-700 text-white" : "text-zinc-600 hover:text-emerald-800"}`}
        aria-pressed={locale === "bn"}
      >
        BN
      </button>
    </div>
  );
}
