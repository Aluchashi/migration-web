import Link from "next/link";
import { useTranslations } from "next-intl";

import { BrandLogo } from "@/components/Elements/brand-logo";
import { LanguageToggle } from "@/components/Elements/language-toggle";

function ProductOverviewVisual() {
  const t = useTranslations("Home");
  const metrics = t.raw("hero.metrics") as {
    label: string;
    value: string;
    tone: string;
  }[];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl shadow-zinc-200/60 sm:p-5">
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {t("hero.preparationLabel")}
            </p>
            <p className="mt-1 text-lg font-semibold text-zinc-950">
              {t("hero.migrationReadiness")}
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
            {t("hero.inProgress")}
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-lg border border-zinc-200 bg-white p-3"
            >
              <span
                className={`block h-1.5 w-8 rounded-full ${metric.tone}`}
              />
              <p className="mt-3 text-xs font-medium text-zinc-500">
                {metric.label}
              </p>
              <p className="mt-1 text-sm font-semibold text-zinc-900">
                {metric.value}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-950">
                {t("hero.prepareWithClarity")}
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {t("hero.clarityDesc")}
              </p>
            </div>
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-800"
              aria-hidden="true"
            >
              ✓
            </span>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs font-semibold text-emerald-800">
              {t("hero.migrationPreparation")}
            </p>
            <p className="mt-1 text-xs leading-5 text-emerald-900">
              {t("hero.migrationPreparationDesc")}
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold text-amber-900">
              {t("hero.scamCheck")}
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-900">
              {t("hero.scamCheckDesc")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeHero() {
  const t = useTranslations("Home");

  return (
    <section className="border-b border-emerald-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pt-5 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-xl outline-none transition-transform hover:-translate-y-px focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <BrandLogo />
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-zinc-700 transition-all hover:-translate-y-px hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-emerald-700 bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:border-emerald-800 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            Register
          </Link>
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:gap-16">
        <div className="max-w-2xl">
          <p className="inline-flex rounded-full border border-emerald-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 shadow-sm">
            {t("hero.badge")}
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.06] tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-emerald-700 px-5 text-sm font-semibold text-white shadow-lg shadow-emerald-800/15 transition hover:-translate-y-px hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              {t("hero.startJourney")}
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-emerald-200 bg-white/90 px-5 text-sm font-semibold text-emerald-900 transition hover:-translate-y-px hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              {t("hero.exploreHow")}
            </a>
          </div>
        </div>
        <ProductOverviewVisual />
      </div>
    </section>
  );
}
