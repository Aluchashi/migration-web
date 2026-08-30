"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { GlobalSearchIcon } from "@hugeicons/core-free-icons";

import { useTranslations } from "next-intl";

import type { SkillGapResult, SkillPriority } from "@/lib/skill-gap";
import { Dropdown } from "@/components/Elements/dropdown";

const ICON_TILE = "bg-muted dark:bg-muted/10 mb-0 size-fit rounded-xl p-px";
const ICON_INNER =
  "flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-[inset_0_-2px_0.5px_0px_rgba(0,0,0,0),inset_0px_2px_0_2px_rgba(255,255,255,1),0_0px_6px_0_rgba(0,0,0,0.07),0_2px_4px_0_rgba(0,0,0,0.05)] dark:bg-black/20 dark:shadow-[inset_0_-1px_0px_0px_rgba(0,0,0,0.1),inset_0px_1px_0px_0px_rgba(255,255,255,0.05),0_0px_2px_0_rgba(0,0,0,0.2),0_1px_4px_0_rgba(0,0,0,0.05)]";

export type SkillGapReportView = SkillGapResult & {
  id: string;
  targetJob: string;
  targetCountry: string;
  createdAt: string;
};

type MatchSuggestion = {
  id: string;
  job: string;
  country: string;
  category: string;
  demandLevel: "high" | "medium" | "low";
  confidence: "verified" | "estimated";
  monthlySalaryLabel: string;
  timelineLabel: string;
  sourceUrl: string;
};

type SkillGapAnalyzerProps = {
  hasProfile: boolean;
  jobSuggestions: string[];
  countrySuggestions: string[];
  initialReport: SkillGapReportView | null;
  initialJob?: string;
  initialCountry?: string;
  matchSuggestions?: MatchSuggestion[];
};

const priorityMeta: Record<
  SkillPriority,
  { label: string; weight: number; barClass: string; chipClass: string; ringClass: string }
> = {
  high: {
    label: "High focus",
    weight: 100,
    barClass: "bg-red-500",
    chipClass: "bg-red-50 text-red-700 ring-red-200",
    ringClass: "border-l-red-500",
  },
  medium: {
    label: "Medium focus",
    weight: 62,
    barClass: "bg-orange-500",
    chipClass: "bg-orange-50 text-orange-700 ring-orange-200",
    ringClass: "border-l-orange-500",
  },
  low: {
    label: "Light focus",
    weight: 32,
    barClass: "bg-emerald-500",
    chipClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    ringClass: "border-l-emerald-500",
  },
};

const priorityOrder: SkillPriority[] = ["high", "medium", "low"];

const designationOptions = ["Fresher", "Intern", "Junior", "Mid-level", "Senior", "Lead / Manager"];

const demandBadge: Record<MatchSuggestion["demandLevel"], string> = {
  high: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  low: "bg-zinc-100 text-zinc-600 ring-zinc-200",
};

export function SkillGapAnalyzer({
  hasProfile,
  jobSuggestions,
  countrySuggestions,
  initialReport,
  initialJob,
  initialCountry,
  matchSuggestions,
}: SkillGapAnalyzerProps) {
  const router = useRouter();
  const t = useTranslations("Dashboard.skillGap");

  const priorityLabel: Record<SkillPriority, string> = {
    high: "highFocus",
    medium: "mediumFocus",
    low: "lightFocus",
  };

  const [targetJob, setTargetJob] = useState(initialReport?.targetJob ?? initialJob ?? "");
  const [targetCountry, setTargetCountry] = useState(initialReport?.targetCountry ?? initialCountry ?? "");
  const [companyName, setCompanyName] = useState("");
  const [designation, setDesignation] = useState("");
  const [expectedSalary, setExpectedSalary] = useState("");
  const [report, setReport] = useState(initialReport);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExternal, setShowExternal] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const autoRan = useRef(false);

  async function analyze(
    event?: FormEvent<HTMLFormElement>,
    explicitJob?: string,
    explicitCountry?: string,
  ) {
    if (event) event.preventDefault();
    const job = (explicitJob ?? targetJob).trim();
    const country = (explicitCountry ?? targetCountry).trim();

    if (!job || !country) {
      setError(t("needBoth"));
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          targetJob: job,
          targetCountry: country,
          companyName: companyName.trim(),
          designation: designation.trim(),
          expectedSalary: expectedSalary.trim(),
        }),
      });
      const data = (await response.json()) as { report?: SkillGapReportView; error?: string };

      if (!response.ok || !data.report) {
        throw new Error(data.error || t("analyzeError"));
      }

      setReport(data.report);
      setReportOpen(true);
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("analyzeError"));
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    if (initialJob && initialCountry && hasProfile && !initialReport && !autoRan.current) {
      autoRan.current = true;
      void analyze(undefined, initialJob, initialCountry);
    }
    // Run once on mount: auto-trigger analysis only when arriving with a
    // prefilled job+country (e.g. from a Career Matcher card).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickMatch(item: MatchSuggestion) {
    setTargetJob(item.job);
    setTargetCountry(item.country);
    setShowExternal(false);
    void analyze(undefined, item.job, item.country);
  }

  const priorityCounts = report
    ? (["high", "medium", "low"] as SkillPriority[]).map((priority) => ({
        priority,
        count: report.missingSkills.filter((item) => item.priority === priority).length,
      }))
    : [];

  return (
    <>
      <div className="border-b border-zinc-200 pb-7 dark:border-zinc-800">
        <p className="text-sm font-medium text-emerald-700">{t("eyebrow")}</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-950 sm:text-3xl dark:text-zinc-50">
          {t("pageTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("pageIntro")}
        </p>
      </div>

      {!hasProfile ? (
        <div className="mt-6 rounded-2xl border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40">
          {t("needProfileBefore")}{" "}
          <Link href="/dashboard/profile" className="font-semibold underline underline-offset-2">
            {t("needProfileLink")}
          </Link>{" "}
          {t("needProfileAfter")}
        </div>
      ) : null}

      {matchSuggestions && matchSuggestions.length > 0 ? (
        <div className="mt-6">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{t("careerMatcherIntro")}</p>
          <p className="mt-1 text-xs text-zinc-500">{t("matcherHint")}</p>
          <div className="mt-3 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {matchSuggestions.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col overflow-hidden rounded-3xl bg-muted/50 shadow-none ring-0 transition-all duration-300 hover:shadow-[0_12px_34px_rgba(0,0,0,0.16)] dark:hover:shadow-[0_12px_34px_rgba(0,0,0,0.6)]"
              >
                <button
                  type="button"
                  onClick={() => pickMatch(item)}
                  className="flex flex-1 flex-col gap-3 rounded-t-3xl p-6 text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className={ICON_TILE}>
                      <div className={ICON_INNER}>
                        <HugeiconsIcon icon={GlobalSearchIcon} className="h-5 w-5 text-emerald-500" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-semibold text-zinc-950 dark:text-zinc-50">{item.job}</h4>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset ${demandBadge[item.demandLevel]}`}
                        >
                          {t("demand", { level: item.demandLevel })}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-500">{item.country}</p>
                    </div>
                  </div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                    {item.category}
                  </p>
                  <dl className="space-y-1.5 text-xs">
                    <div className="flex justify-between gap-2">
                      <dt className="text-zinc-500">{t("salary")}</dt>
                      <dd className="text-right font-medium text-zinc-700 dark:text-zinc-200">{item.monthlySalaryLabel}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-zinc-500">{t("timeline")}</dt>
                      <dd className="text-right font-medium text-zinc-700 dark:text-zinc-200">{item.timelineLabel}</dd>
                    </div>
                  </dl>
                </button>
                <div className="flex items-center justify-between gap-2 border-t border-zinc-200 px-6 py-3 dark:border-zinc-800">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
                      item.confidence === "verified"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-zinc-100 text-zinc-500 ring-zinc-200"
                    }`}
                  >
                    {item.confidence}
                  </span>
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-medium text-emerald-700 hover:underline"
                  >
                    {t("source")}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <form
        onSubmit={analyze}
        className="mt-7 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="targetJob" className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-100">
              {t("jobName")}
            </label>
            <input
              id="targetJob"
              name="targetJob"
              type="text"
              list={jobSuggestions.length > 0 ? "job-suggestions" : undefined}
              required
              maxLength={160}
              value={targetJob}
              onChange={(event) => setTargetJob(event.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder={t("jobPlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="targetCountry" className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-100">
              {t("companyCountry")}
            </label>
            <input
              id="targetCountry"
              name="targetCountry"
              type="text"
              list={countrySuggestions.length > 0 ? "country-suggestions" : undefined}
              required
              maxLength={100}
              value={targetCountry}
              onChange={(event) => setTargetCountry(event.target.value)}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder={t("countryPlaceholder")}
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowExternal((value) => !value)}
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:underline"
            aria-expanded={showExternal}
          >
            {showExternal ? t("hideExternal") : t("addExternal")}
          </button>
          {showExternal ? (
            <div className="mt-4 grid gap-5 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/60 sm:grid-cols-2">
              <div>
                <label htmlFor="companyName" className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  {t("companyName")}
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  maxLength={160}
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  placeholder={t("companyPlaceholder")}
                />
              </div>

              <div>
                <label htmlFor="designation" className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  {t("designation")} <span className="text-zinc-400">{t("optional")}</span>
                </label>
                <Dropdown
                  options={[
                    { value: "", label: t("selectLevel") },
                    ...designationOptions.map((option) => ({ value: option, label: option })),
                  ]}
                  value={designation}
                  onValueChange={(v) => setDesignation(v)}
                  placeholder={t("selectLevel")}
                  title={t("designation")}
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="expectedSalary" className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  {t("expectedSalary")}
                </label>
                <input
                  id="expectedSalary"
                  name="expectedSalary"
                  type="text"
                  maxLength={60}
                  value={expectedSalary}
                  onChange={(event) => setExpectedSalary(event.target.value)}
                  className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  placeholder={t("salaryPlaceholder")}
                />
              </div>
            </div>
          ) : null}
        </div>

        {jobSuggestions.length > 0 || countrySuggestions.length > 0 ? (
          <p className="mt-4 text-xs text-zinc-500">{t("matcherAvailable")}</p>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <button
            type="submit"
            disabled={!hasProfile || pending}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {pending ? t("analyzing") : report ? t("runNew") : t("analyze")}
          </button>
        </div>
      </form>

      <div aria-live="polite" aria-busy={pending}>
        {report ? (
          <div className="py-9">
            <button
              type="button"
              onClick={() => setReportOpen((value) => !value)}
              className="flex w-full items-center justify-between gap-4 rounded-3xl bg-muted/50 p-6 text-left shadow-none ring-0 transition-all duration-300 hover:shadow-[0_12px_34px_rgba(0,0,0,0.16)] dark:hover:shadow-[0_12px_34px_rgba(0,0,0,0.6)]"
              aria-expanded={reportOpen}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("latestAnalysis")}</p>
                <h2 className="mt-2 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
                  {t("jobInCountry", { job: report.targetJob, country: report.targetCountry })}
                </h2>
                <p className="mt-2 text-xs text-zinc-500">
                  {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(
                    new Date(report.createdAt),
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {priorityCounts.map((entry) => (
                  <span
                    key={entry.priority}
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${priorityMeta[entry.priority].chipClass}`}
                  >
                    {entry.count} {t(priorityLabel[entry.priority])}
                  </span>
                ))}
                <span className="text-zinc-400">
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-4 w-4 transition-transform ${reportOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </button>

            {reportOpen ? (
              <div className="mt-7">
                <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-muted/50 px-4 py-3 text-xs text-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-300">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-200">{t("howToRead")}</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> {t("highFocusFirst")}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> {t("mediumFocusHint")}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> {t("lightFocusHint")}
                  </span>
                </div>

                {report.missingSkills.length > 0 ? (
                  <div className="space-y-8">
                    {priorityOrder.map((priority) => {
                      const skills = report.missingSkills.filter((item) => item.priority === priority);
                      if (skills.length === 0) return null;
                      const meta = priorityMeta[priority];

                      return (
                        <section key={priority} aria-labelledby={`${priority}-priority-heading`}>
                          <div className="mb-4 flex items-center gap-3">
                            <h3
                              id={`${priority}-priority-heading`}
                              className="text-lg font-semibold text-zinc-950 dark:text-zinc-50"
                            >
                              {t(priorityLabel[priority])}
                            </h3>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.chipClass}`}
                            >
                              {skills.length}
                            </span>
                          </div>
                          <div className="grid gap-6 md:grid-cols-2">
                            {skills.map((item) => (
                              <article
                                key={`${item.priority}-${item.skill}`}
                                className={`flex flex-col rounded-3xl border border-l-4 border-zinc-200 bg-muted/50 p-6 shadow-sm transition-all duration-300 hover:shadow-[0_12px_34px_rgba(0,0,0,0.16)] dark:border-zinc-800 dark:bg-zinc-900/40 dark:hover:shadow-[0_12px_34px_rgba(0,0,0,0.6)] ${meta.ringClass}`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <h4 className="font-semibold text-zinc-950 dark:text-zinc-50">{item.skill}</h4>
                                  <span
                                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${meta.chipClass}`}
                                  >
                                    {t(priorityLabel[item.priority])}
                                  </span>
                                </div>
                                <div className="mt-3">
                                  <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
                                    <span>{t("focusLevel")}</span>
                                    <span>{meta.weight}%</span>
                                  </div>
                                  <div
                                    className="mt-1 h-2 w-full overflow-hidden rounded-full bg-zinc-200/70 dark:bg-zinc-700"
                                    role="progressbar"
                                    aria-valuenow={meta.weight}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                  >
                                    <div
                                      className={`h-full rounded-full ${meta.barClass}`}
                                      style={{ width: `${meta.weight}%` }}
                                    />
                                  </div>
                                </div>
                                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{item.reason}</p>
                              </article>
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40">
                    {t("noGaps")}
                  </p>
                )}
              </div>
            ) : null}
          </div>
        ) : hasProfile ? (
          <div className="py-14 text-center">
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">{t("noReport")}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {t("chooseTarget")}
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}
