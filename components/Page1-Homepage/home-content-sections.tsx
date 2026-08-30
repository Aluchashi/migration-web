import Link from "next/link";
import { useTranslations } from "next-intl";

import { HomeSectionHeading } from "@/components/Page1-Homepage/home-section-heading";

type Metric = { label: string; value: string; tone: string };
type FeatureItem = {
  title: string;
  description: string;
  status: string;
  href: string;
};
type Step = { number: string; title: string };

export function ProblemSection() {
  const t = useTranslations("Home");
  const questions = t.raw("problem.questions") as string[];
  const features = t.raw("problem.features") as string[];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <HomeSectionHeading title={t("problem.title")} />
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {questions.map((question, index) => (
          <article
            key={question}
            className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300 hover:shadow sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-zinc-950">{question}</h3>
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
                0{index + 1}
              </span>
            </div>
            <p className="mt-5 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
              {features[index]}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function JourneySection() {
  const t = useTranslations("Home");
  const steps = t.raw("journey.steps") as string[];

  return (
    <section className="border-y border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <HomeSectionHeading center title={t("journey.title")} />
        <ol className="mx-auto mt-12 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {steps.map((step, index) => (
            <li
              key={step}
              className="relative rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-5 text-center"
            >
              <span className="text-xs font-semibold text-emerald-700">
                0{index + 1}
              </span>
              <p className="mt-2 font-semibold text-zinc-950">{step}</p>
              {index < steps.length - 1 ? (
                <span
                  className="absolute -bottom-4 left-1/2 text-zinc-400 sm:hidden"
                  aria-hidden="true"
                >
                  ↓
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function FeatureGrid() {
  const t = useTranslations("Home");
  const items = t.raw("features.items") as FeatureItem[];
  const explore = t("features.explore");

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <HomeSectionHeading title={t("features.title")} />
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const featured = item.title === "Scam Checker";
          const className = `rounded-xl border bg-white p-5 shadow-sm transition sm:p-6 ${featured ? "border-emerald-300 ring-1 ring-emerald-100" : "border-zinc-200"} ${item.href ? "hover:border-emerald-300 hover:shadow" : ""}`;
          const content = (
            <>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-semibold text-zinc-950">
                  {item.title}
                </h3>
                <span
                  className={
                    item.status === "Available"
                      ? "shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800"
                      : "shrink-0 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600"
                  }
                >
                  {item.status}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {item.description}
              </p>
              {item.href ? (
                <span className="mt-5 inline-block text-sm font-semibold text-emerald-800">
                  {explore} <span aria-hidden="true">→</span>
                </span>
              ) : null}
            </>
          );
          return item.href ? (
            <Link key={item.title} href={item.href} className={className}>
              {content}
            </Link>
          ) : (
            <article key={item.title} className={className}>
              {content}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function ScamCheckerHighlight() {
  const t = useTranslations("Home");
  const checks = t.raw("scam.checks") as string[];

  return (
    <section className="border-y border-emerald-100 bg-emerald-50/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <HomeSectionHeading title={t("scam.title")} />
          <Link
            href="/dashboard/scam-checker"
            className="mt-7 inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            {t("scam.checkAnOffer")}
          </Link>
          <p
            id="scam-checker-note"
            className="mt-4 max-w-xl text-xs leading-5 text-zinc-600"
          >
            {t("scam.note")}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-sm font-semibold text-zinc-950">
            {t("scam.checkBeforeTrust")}
          </p>
          <ol className="mt-5 space-y-2">
            {checks.map((check, index) => (
              <li
                key={check}
                className="flex items-center gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2.5"
              >
                <span
                  className={
                    index === checks.length - 1
                      ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-900"
                      : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800"
                  }
                >
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-zinc-800">{check}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function PlatformDetails() {
  const t = useTranslations("Home");
  const differentiators = t.raw("platform.differentiators") as string[];
  const steps = t.raw("platform.steps") as Step[];
  const trust = t.raw("platform.trust") as string[];

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <HomeSectionHeading title={t("platform.title")} />
        <div className="mt-10">
          <ul
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:max-w-3xl"
            aria-label="Platform differentiators"
          >
            {differentiators.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 shadow-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section
        id="how-it-works"
        className="border-y border-zinc-200 bg-white scroll-mt-20"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <HomeSectionHeading center title={t("platform.howTitle")} />
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <li
                key={step.number}
                className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6"
              >
                <span className="text-sm font-bold text-emerald-700">
                  {step.number}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-zinc-950">
                  {step.title}
                </h3>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <HomeSectionHeading center title={t("platform.trustTitle")} />
        <ul className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2">
          {trust.map((point) => (
            <li
              key={point}
              className="rounded-lg border border-zinc-200 bg-white p-4 text-sm leading-6 text-zinc-700 shadow-sm"
            >
              {point}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export function DashboardPreview() {
  const t = useTranslations("Home");
  const items = t.raw("dashboard.items") as {
    title: string;
    status: string;
    description: string;
  }[];
  const sidebar = t.raw("dashboard.sidebar") as string[];

  return (
    <section className="border-y border-zinc-200 bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <HomeSectionHeading center title={t("dashboard.title")} />
        <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg shadow-zinc-200/60">
          <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 sm:px-5">
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-zinc-300" />
            </div>
            <p className="text-xs font-semibold text-zinc-500">
              {t("dashboard.readiness")}
            </p>
          </div>
          <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-[170px_1fr]">
            <aside className="rounded-lg bg-zinc-950 p-4 text-zinc-300">
              <p className="text-sm font-semibold text-white">
                {t("dashboard.yourJourney")}
              </p>
              <ul className="mt-4 space-y-3 text-xs">
                {sidebar.map((item, index) => (
                  <li
                    key={item}
                    className={
                      index === 0
                        ? "font-semibold text-emerald-300"
                        : "text-zinc-300"
                    }
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
            <div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                  {t("dashboard.prepStatus")}
                </p>
                <p className="mt-1 text-xl font-semibold text-zinc-950">
                  {t("dashboard.prepStatusBegin")}
                </p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {items.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-lg border border-zinc-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold text-zinc-950">
                        {item.title}
                      </h3>
                      <span
                        className={
                          item.status === "Available"
                            ? "rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800"
                            : "rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600"
                        }
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-zinc-600">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
