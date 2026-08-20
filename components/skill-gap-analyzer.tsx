"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import type { SkillGapResult, SkillPriority } from "@/lib/skill-gap";

export type SkillGapReportView = SkillGapResult & {
  id: string;
  targetJob: string;
  targetCountry: string;
  createdAt: string;
};

type SkillGapAnalyzerProps = {
  hasProfile: boolean;
  jobSuggestions: string[];
  countrySuggestions: string[];
  initialReport: SkillGapReportView | null;
};

const priorityGroups: Array<{
  priority: SkillPriority;
  label: string;
  badgeClass: string;
  accentClass: string;
}> = [
  {
    priority: "high",
    label: "High priority",
    badgeClass: "bg-red-50 text-red-700 ring-red-200",
    accentClass: "border-l-red-500",
  },
  {
    priority: "medium",
    label: "Medium priority",
    badgeClass: "bg-orange-50 text-orange-700 ring-orange-200",
    accentClass: "border-l-orange-500",
  },
  {
    priority: "low",
    label: "Low priority",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    accentClass: "border-l-emerald-500",
  },
];

export function SkillGapAnalyzer({
  hasProfile,
  jobSuggestions,
  countrySuggestions,
  initialReport,
}: SkillGapAnalyzerProps) {
  const router = useRouter();
  const [targetJob, setTargetJob] = useState(initialReport?.targetJob ?? "");
  const [targetCountry, setTargetCountry] = useState(initialReport?.targetCountry ?? "");
  const [report, setReport] = useState(initialReport);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const job = targetJob.trim();
    const country = targetCountry.trim();

    if (!job || !country) {
      setError("Enter both a target job and target country.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ targetJob: job, targetCountry: country }),
      });
      const data = (await response.json()) as { report?: SkillGapReportView; error?: string };

      if (!response.ok || !data.report) {
        throw new Error(data.error || "Could not analyze skill gaps.");
      }

      setReport(data.report);
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not analyze skill gaps.");
    } finally {
      setPending(false);
    }
  }

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

      <form onSubmit={analyze} className="mt-7 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="targetJob" className="mb-2 block text-sm font-medium text-zinc-800">
              Target job
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
            {jobSuggestions.length > 0 ? (
              <datalist id="job-suggestions">
                {jobSuggestions.map((job) => <option key={job} value={job} />)}
              </datalist>
            ) : null}
          </div>

          <div>
            <label htmlFor="targetCountry" className="mb-2 block text-sm font-medium text-zinc-800">
              Target country
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
              placeholder="e.g. Germany"
            />
            {countrySuggestions.length > 0 ? (
              <datalist id="country-suggestions">
                {countrySuggestions.map((country) => <option key={country} value={country} />)}
              </datalist>
            ) : null}
          </div>
        </div>

        {jobSuggestions.length > 0 || countrySuggestions.length > 0 ? (
          <p className="mt-4 text-xs text-zinc-500">
            Previous matcher suggestions are available in the input dropdowns.
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
            <div className="flex flex-col gap-1 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              <div>
                <p className="text-xs font-semibold uppercase text-zinc-500">Latest analysis</p>
                <h2 className="mt-2 text-xl font-semibold text-zinc-950">
                  {report.targetJob} in {report.targetCountry}
                </h2>
              </div>
              <p className="mt-2 shrink-0 text-xs text-zinc-500 sm:mt-0">
                {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(report.createdAt))}
              </p>
            </div>

            {report.missingSkills.length > 0 ? (
              <div className="mt-7 space-y-8">
                {priorityGroups.map((group) => {
                  const skills = report.missingSkills.filter((item) => item.priority === group.priority);
                  if (skills.length === 0) return null;

                  return (
                    <section key={group.priority} aria-labelledby={`${group.priority}-priority-heading`}>
                      <div className="mb-4 flex items-center gap-3">
                        <h3 id={`${group.priority}-priority-heading`} className="text-lg font-semibold text-zinc-950">
                          {group.label}
                        </h3>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${group.badgeClass}`}>
                          {skills.length}
                        </span>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {skills.map((item) => (
                          <article key={`${item.priority}-${item.skill}`} className={`rounded-lg border border-l-4 border-zinc-200 bg-white p-5 shadow-sm ${group.accentClass}`}>
                            <div className="flex items-start justify-between gap-4">
                              <h4 className="font-semibold text-zinc-950">{item.skill}</h4>
                              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${group.badgeClass}`}>
                                {item.priority}
                              </span>
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
              <p className="mt-7 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                No significant skill gaps were identified for this target.
              </p>
            )}
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
