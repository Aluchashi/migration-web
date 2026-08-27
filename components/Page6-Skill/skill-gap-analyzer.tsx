"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import type { SkillGapResult, SkillPriority } from "@/lib/skill-gap";

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
      setError("Enter both a target job and company country.");
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
        throw new Error(data.error || "Could not analyze skill gaps.");
      }

      setReport(data.report);
      setReportOpen(true);
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not analyze skill gaps.");
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
      <div className="border-b border-zinc-200 pb-7">
        <p className="text-sm font-medium text-emerald-700">AI skills planning</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-950 sm:text-3xl">Skill Gap Analyzer</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Compare your saved experience with the practical skills needed for a target role and country.
        </p>
      </div>

      {!hasProfile ? (
        <div className="mt-6 border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add your skills, education, or experience to your{" "}
          <Link href="/dashboard/profile" className="font-semibold underline underline-offset-2">
            profile
          </Link>{" "}
          before running an analysis.
        </div>
      ) : null}

      {matchSuggestions && matchSuggestions.length > 0 ? (
        <div className="mt-6">
          <p className="text-sm font-semibold text-zinc-800">From your Career Matcher</p>
          <p className="mt-1 text-xs text-zinc-500">
            Pick a role your matcher suggested - it loads the job and country and runs the analysis.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {matchSuggestions.map((item) => (
              <div
                key={item.id}
                className="flex flex-col rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:border-emerald-500 hover:shadow"
              >
                <button
                  type="button"
                  onClick={() => pickMatch(item)}
                  className="flex flex-1 flex-col gap-3 rounded-t-lg p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-zinc-950">{item.job}</h4>
                      <p className="mt-0.5 text-xs text-zinc-500">{item.country}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset ${demandBadge[item.demandLevel]}`}
                    >
                      {item.demandLevel} demand
                    </span>
                  </div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                    {item.category}
                  </p>
                  <dl className="space-y-1.5 text-xs">
                    <div className="flex justify-between gap-2">
                      <dt className="text-zinc-500">Salary</dt>
                      <dd className="text-right font-medium text-zinc-700">{item.monthlySalaryLabel}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-zinc-500">Timeline</dt>
                      <dd className="text-right font-medium text-zinc-700">{item.timelineLabel}</dd>
                    </div>
                  </dl>
                </button>
                <div className="flex items-center justify-between gap-2 border-t border-zinc-100 px-4 py-2">
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
                    Source ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <form onSubmit={analyze} className="mt-7 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="targetJob" className="mb-2 block text-sm font-medium text-zinc-800">
              Job name <span className="text-zinc-400">(what job)</span>
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
              className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="e.g. Maintenance electrician"
            />
          </div>

          <div>
            <label htmlFor="targetCountry" className="mb-2 block text-sm font-medium text-zinc-800">
              Company country
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
              className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="e.g. Saudi Arabia"
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
            {showExternal ? "− Hide external job details" : "+ Add external job details"}
          </button>
          {showExternal ? (
            <div className="mt-4 grid gap-5 rounded-md border border-zinc-200 bg-zinc-50 p-4 sm:grid-cols-2">
              <div>
                <label htmlFor="companyName" className="mb-2 block text-sm font-medium text-zinc-800">
                  Company name <span className="text-zinc-400">(optional)</span>
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  maxLength={160}
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  placeholder="e.g. ABC Wires Co."
                />
              </div>

              <div>
                <label htmlFor="designation" className="mb-2 block text-sm font-medium text-zinc-800">
                  Designation <span className="text-zinc-400">(optional)</span>
                </label>
                <select
                  id="designation"
                  name="designation"
                  value={designation}
                  onChange={(event) => setDesignation(event.target.value)}
                  className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                >
                  <option value="">Select level</option>
                  {designationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="expectedSalary" className="mb-2 block text-sm font-medium text-zinc-800">
                  Expected salary <span className="text-zinc-400">(optional)</span>
                </label>
                <input
                  id="expectedSalary"
                  name="expectedSalary"
                  type="text"
                  maxLength={60}
                  value={expectedSalary}
                  onChange={(event) => setExpectedSalary(event.target.value)}
                  className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  placeholder="e.g. SAR 1,500/month"
                />
              </div>
            </div>
          ) : null}
        </div>

        {jobSuggestions.length > 0 || countrySuggestions.length > 0 ? (
          <p className="mt-4 text-xs text-zinc-500">
            Previous matcher suggestions are available in the input dropdowns. Type any other job freely
            for roles outside the dataset.
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end border-t border-zinc-200 pt-5">
          <button
            type="submit"
            disabled={!hasProfile || pending}
            className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {pending ? "Analyzing..." : report ? "Run new analysis" : "Analyze skill gaps"}
          </button>
        </div>
      </form>

      <div aria-live="polite" aria-busy={pending}>
        {report ? (
          <div className="py-9">
            <button
              type="button"
              onClick={() => setReportOpen((value) => !value)}
              className="flex w-full items-center justify-between gap-4 border-b border-zinc-200 pb-5 text-left"
              aria-expanded={reportOpen}
            >
              <div>
                <p className="text-xs font-semibold uppercase text-zinc-500">Latest analysis</p>
                <h2 className="mt-2 text-xl font-semibold text-zinc-950">
                  {report.targetJob} in {report.targetCountry}
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
                    {entry.count} {entry.priority}
                  </span>
                ))}
                <span className="text-zinc-400">{reportOpen ? "▲" : "▼"}</span>
              </div>
            </button>

            {reportOpen ? (
              <div className="mt-7">
                <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
                  <span className="font-semibold text-zinc-700">How to read this:</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> High focus = learn first
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Medium focus
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Light focus
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
                              className="text-lg font-semibold text-zinc-950"
                            >
                              {meta.label}
                            </h3>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.chipClass}`}
                            >
                              {skills.length}
                            </span>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            {skills.map((item) => (
                              <article
                                key={`${item.priority}-${item.skill}`}
                                className={`rounded-lg border border-l-4 border-zinc-200 bg-white p-5 shadow-sm ${meta.ringClass}`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <h4 className="font-semibold text-zinc-950">{item.skill}</h4>
                                  <span
                                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${meta.chipClass}`}
                                  >
                                    {item.priority}
                                  </span>
                                </div>
                                <div className="mt-3">
                                  <div className="flex items-center justify-between text-[11px] font-medium text-zinc-500">
                                    <span>Focus level</span>
                                    <span>{meta.weight}%</span>
                                  </div>
                                  <div
                                    className="mt-1 h-2 w-full overflow-hidden rounded-full bg-zinc-100"
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
                                <p className="mt-3 text-sm leading-6 text-zinc-600">{item.reason}</p>
                              </article>
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                ) : (
                  <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    No significant skill gaps were identified for this target.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        ) : hasProfile ? (
          <div className="py-14 text-center">
            <h2 className="text-lg font-semibold text-zinc-950">No skill gap report yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
              Choose a target role and destination to generate your first prioritized skills plan.
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}
