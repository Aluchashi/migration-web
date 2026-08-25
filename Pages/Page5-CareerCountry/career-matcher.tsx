"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { CareerMatchResult } from "@/lib/career-match";

export type CareerMatchView = CareerMatchResult & {
  id: string;
  createdAt: string;
};

type CareerMatcherProps = {
  hasProfile: boolean;
  initialMatch: CareerMatchView | null;
};

export function CareerMatcher({ hasProfile, initialMatch }: CareerMatcherProps) {
  const router = useRouter();
  const [match, setMatch] = useState(initialMatch);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getRecommendations() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/career-matcher", {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      const data = (await response.json()) as { match?: CareerMatchView; error?: string };

      if (!response.ok || !data.match) {
        throw new Error(data.error || "Could not generate recommendations.");
      }

      setMatch(data.match);
      router.refresh();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not generate recommendations.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-zinc-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">AI career planning</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-950 sm:text-3xl">Career &amp; Country Matcher</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Compare migration destinations and job paths against your saved career profile.
          </p>
        </div>
        <button
          type="button"
          onClick={getRecommendations}
          disabled={!hasProfile || pending}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400"
        >
          {pending ? "Generating..." : match ? "Refresh recommendations" : "Get recommendations"}
        </button>
      </div>

      {!hasProfile ? (
        <div className="mt-6 border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Save some career details in your{" "}
          <Link href="/dashboard/profile" className="font-semibold underline underline-offset-2">
            profile
          </Link>{" "}
          before generating recommendations.
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div aria-live="polite" aria-busy={pending}>
        {match ? (
          <div className="space-y-10 py-8">
            <p className="text-xs text-zinc-500">
              Generated {new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(match.createdAt))}
            </p>

            <section aria-labelledby="countries-heading">
              <div className="mb-4">
                <h2 id="countries-heading" className="text-xl font-semibold text-zinc-950">Suggested countries</h2>
                <p className="mt-1 text-sm text-zinc-600">Fit scores compare the destination with your current profile.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {match.suggestedCountries.map((country) => (
                  <article key={country.country} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-semibold text-zinc-950">{country.country}</h3>
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-800">
                        {country.matchScore}% match
                      </span>
                    </div>
                    <div
                      className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-100"
                      role="progressbar"
                      aria-label={`${country.country} match score`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={country.matchScore}
                    >
                      <div className="h-full rounded-full bg-emerald-600" style={{ width: `${country.matchScore}%` }} />
                    </div>
                    <p className="mt-4 text-sm leading-6 text-zinc-600">{country.reasons}</p>
                  </article>
                ))}
              </div>
            </section>

            <section aria-labelledby="jobs-heading">
              <div className="mb-4">
                <h2 id="jobs-heading" className="text-xl font-semibold text-zinc-950">Suggested jobs</h2>
                <p className="mt-1 text-sm text-zinc-600">Salary figures are approximate estimates and vary by location and employer.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {match.suggestedJobs.map((job) => (
                  <article key={`${job.job}-${job.expectedSalaryRange}`} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-zinc-950">{job.job}</h3>
                    <p className="mt-3 text-xs font-semibold uppercase text-zinc-500">Expected salary range</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-800">{job.expectedSalaryRange}</p>
                    <p className="mt-4 text-xs font-semibold uppercase text-zinc-500">Eligibility</p>
                    <p className="mt-1 text-sm leading-6 text-zinc-600">{job.eligibility}</p>
                  </article>
                ))}
              </div>
            </section>

            <section aria-labelledby="requirements-heading">
              <h2 id="requirements-heading" className="text-xl font-semibold text-zinc-950">Missing requirements</h2>
              {match.missingRequirements.length > 0 ? (
                <ul className="mt-4 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white px-4 shadow-sm">
                  {match.missingRequirements.map((requirement) => (
                    <li key={requirement} className="flex items-start gap-3 py-4 text-sm leading-6 text-zinc-700">
                      <input type="checkbox" disabled aria-label={requirement} className="mt-1 h-4 w-4 shrink-0 rounded border-zinc-300" />
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  No major missing requirements were identified from this profile.
                </p>
              )}
            </section>
          </div>
        ) : hasProfile ? (
          <div className="py-16 text-center">
            <h2 className="text-lg font-semibold text-zinc-950">No recommendations yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
              Generate your first comparison from the career details saved in your profile.
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}
