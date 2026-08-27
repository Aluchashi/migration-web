"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  DEFAULT_WEIGHTS,
  WEIGHT_FIELDS,
  computeMatches,
  groupByTier,
  type MatchResult,
  type MatchTier,
  type ProfileSnapshot,
  type ScoreWeights,
} from "@/lib/career-scoring";
import { REGION_OPTIONS } from "@/lib/profile-options";

type CareerMatcherProps = {
  snapshot: ProfileSnapshot | null;
  essentialGaps: string[];
};

type SortKey = "score" | "salary" | "cost" | "timeline" | "demand";

const demandRank: Record<string, number> = { high: 3, medium: 2, low: 1 };

const sorters: Record<SortKey, (a: MatchResult, b: MatchResult) => number> = {
  score: (a, b) => b.matchScore - a.matchScore,
  salary: (a, b) => b.salaryApproxBDT - a.salaryApproxBDT,
  cost: (a, b) => a.costApproxBDT - b.costApproxBDT,
  timeline: (a, b) => a.timelineMonths - b.timelineMonths,
  demand: (a, b) => (demandRank[b.demandLevel] ?? 0) - (demandRank[a.demandLevel] ?? 0),
};

const tierMeta: Record<
  MatchTier,
  { title: string; blurb: string; dotClass: string; badgeClass: string }
> = {
  "best-fit": {
    title: "Best fit now",
    blurb: "You already meet the core requirements - these are realistic in the shortest time.",
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  },
  "achievable-soon": {
    title: "Achievable soon",
    blurb: "Small closeable gaps (training, certificate, language) stand between you and eligibility.",
    dotClass: "bg-amber-400",
    badgeClass: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  "stretch-option": {
    title: "Stretch options",
    blurb: "Bigger gaps, but the highest long-term value if you invest in preparation.",
    dotClass: "bg-sky-500",
    badgeClass: "bg-sky-50 text-sky-800 ring-sky-200",
  },
};

const eligibilityMeta: Record<
  MatchResult["eligibility"],
  { label: string; className: string }
> = {
  eligible: {
    label: "Eligible",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  partial: {
    label: "Partially eligible",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  "not-yet": {
    label: "Not yet eligible",
    className: "bg-red-50 text-red-700 ring-red-200",
  },
};

function SubscoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-zinc-600">
        <span>{label}</span>
        <span className="font-semibold text-zinc-800">{value}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100">
        <div className="h-full rounded-full bg-zinc-700" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function MatchCard({
  result,
  comparable,
  compareFull,
  onToggleCompare,
}: {
  result: MatchResult;
  comparable: boolean;
  compareFull: boolean;
  onToggleCompare: () => void;
}) {
  const eligibility = eligibilityMeta[result.eligibility];

  return (
    <article className="flex flex-col rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link
            href={`/dashboard/career-matcher/${result.corridorId}`}
            className="font-semibold leading-snug text-zinc-950 hover:text-emerald-700 hover:underline underline-offset-2"
          >
            {result.jobTitle} &mdash; {result.country}
          </Link>
          <p className="mt-1 text-xs text-zinc-500">{result.category}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${eligibility.className}`}>
          {eligibility.label}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-zinc-600">Match score</span>
          <span className="font-bold text-zinc-950">{result.matchScore}%</span>
        </div>
        <div
          className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-100"
          role="progressbar"
          aria-label={`${result.jobTitle} match score`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={result.matchScore}
        >
          <div className="h-full rounded-full bg-emerald-600" style={{ width: `${result.matchScore}%` }} />
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Salary</dt>
          <dd className="mt-0.5 font-medium text-zinc-800">{result.salaryLabel}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Migration cost</dt>
          <dd className="mt-0.5 font-medium text-zinc-800">{result.costLabel}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Timeline</dt>
          <dd className="mt-0.5 font-medium text-zinc-800">{result.timelineLabel}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Demand</dt>
          <dd className="mt-0.5 flex items-center gap-1.5 font-medium capitalize text-zinc-800">
            <span className={`h-1.5 w-1.5 rounded-full ${result.demandLevel === "high" ? "bg-emerald-500" : result.demandLevel === "medium" ? "bg-amber-400" : "bg-zinc-300"}`} />
            {result.demandLevel}
          </dd>
        </div>
      </dl>

      <p className={`mt-4 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${result.confidence === "verified" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-orange-50 text-orange-700 ring-orange-200"}`}>
        {result.confidence === "verified" ? "High confidence (official data)" : "Estimated (limited data)"}
      </p>

      {result.missingRequirements.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Missing requirements</p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {result.missingRequirements.map((item) => (
              <li key={item} className="rounded-md bg-red-50 px-2 py-0.5 text-xs text-red-700">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.whatIf.length > 0 ? (
        <div className="mt-4 rounded-md border border-sky-100 bg-sky-50 px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">What if?</p>
          <ul className="mt-1 space-y-1 text-xs leading-5 text-sky-900">
            {result.whatIf.map((scenario) => (
              <li key={scenario.action}>
                Complete <strong>{scenario.action}</strong> &rarr; score becomes{" "}
                <strong>{scenario.projectedScore}%</strong>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <details className="group mt-4 rounded-md border border-zinc-200 open:bg-zinc-50">
        <summary className="cursor-pointer select-none px-3 py-2 text-sm font-semibold text-zinc-700 marker:content-none hover:text-zinc-950">
          Why this match?
          <span className="ml-2 inline-block text-xs font-normal text-zinc-400 transition group-open:rotate-180">&#9662;</span>
        </summary>
        <div className="space-y-3 border-t border-zinc-200 px-3 pb-3 pt-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">How we calculated this</p>
            <div className="mt-2 space-y-2">
              <SubscoreBar label="Skill match" value={result.subscores.skill} />
              <SubscoreBar label="Language" value={result.subscores.language} />
              <SubscoreBar label="Experience" value={result.subscores.experience} />
              <SubscoreBar label="Budget fit" value={result.subscores.budget} />
              <SubscoreBar label="Priority alignment" value={result.subscores.priority} />
            </div>
            <p className="mt-2 text-[11px] leading-4 text-zinc-500">
              Weighted rule-based formula: skill + language + experience + budget + priority alignment.
              No AI-generated scores - the same profile always produces the same result.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Explanation</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-5 text-zinc-700">
              {result.explanationBn.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </details>

      <div className="mt-auto pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/skill-gap?job=${encodeURIComponent(result.jobTitle)}&country=${encodeURIComponent(result.country)}`}
            className="inline-flex h-9 items-center rounded-md bg-zinc-950 px-3 text-xs font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            View skill gap
          </Link>
          <button
            type="button"
            disabled
            title="Legal migration guidance module is coming soon"
            className="inline-flex h-9 cursor-not-allowed items-center rounded-md border border-zinc-200 px-3 text-xs font-semibold text-zinc-400"
          >
            Legal process
          </button>
          <button
            type="button"
            disabled
            title="Agency verification module is coming soon"
            className="inline-flex h-9 cursor-not-allowed items-center rounded-md border border-zinc-200 px-3 text-xs font-semibold text-zinc-400"
          >
            Verify agency
          </button>
          <label className="ml-auto inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-zinc-600">
            <input
              type="checkbox"
              checked={comparable}
              disabled={!comparable && compareFull}
              onChange={onToggleCompare}
              className="h-3.5 w-3.5 rounded border-zinc-300"
            />
            Compare
          </label>
        </div>
      </div>
    </article>
  );
}

export function CareerMatcher({ snapshot, essentialGaps }: CareerMatcherProps) {
  const [weights, setWeights] = useState<ScoreWeights>(DEFAULT_WEIGHTS);
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [regionFilter, setRegionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const allResults = useMemo(
    () => (snapshot ? computeMatches(snapshot, weights) : []),
    [snapshot, weights],
  );

  const categories = useMemo(
    () => Array.from(new Set(allResults.map((result) => result.category))).sort(),
    [allResults],
  );

  const filteredResults = useMemo(() => {
    return allResults
      .filter((result) => regionFilter === "all" || result.region === regionFilter)
      .filter((result) => categoryFilter === "all" || result.category === categoryFilter)
      .sort(sorters[sortKey]);
  }, [allResults, regionFilter, categoryFilter, sortKey]);

  const tiers = useMemo(() => groupByTier(filteredResults), [filteredResults]);

  const compared = useMemo(
    () => filteredResults.filter((result) => compareIds.includes(result.corridorId)),
    [filteredResults, compareIds],
  );

  const weightTotal =
    weights.skill + weights.language + weights.experience + weights.budget + weights.priority;

  function toggleCompare(corridorId: string) {
    setCompareIds((current) =>
      current.includes(corridorId)
        ? current.filter((id) => id !== corridorId)
        : current.length >= 3
          ? current
          : [...current, corridorId],
    );
  }

  return (
    <>
      <div className="border-b border-zinc-200 pb-7">
        <p className="text-sm font-medium text-emerald-700">AI pre-migration intelligence</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-950 sm:text-3xl">Career &amp; Country Matcher</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Realistic country and job options ranked against your saved profile by a transparent,
          rule-based scoring engine - no forms to fill again, no black-box scores.
        </p>
      </div>

      <p className="mt-5 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs leading-5 text-zinc-600">
        Scores come from your saved profile checked against a curated dataset of migration corridors
        (BMET demand patterns, embassy rules, BOESL postings). Salary and cost figures are estimates
        tagged with their source and verification date - always confirm with BMET or the destination
        embassy before paying anyone.
      </p>

      {!snapshot ? (
        <div className="mt-6 border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Your profile does not have enough career data yet. Complete these first:
          <ul className="mt-2 list-disc pl-5">
            {essentialGaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
          <Link
            href="/dashboard/profile"
            className="mt-3 inline-flex font-semibold underline underline-offset-2"
          >
            Complete your profile
          </Link>
        </div>
      ) : null}

      {snapshot && essentialGaps.length > 0 ? (
        <div className="mt-6 border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Recommendations improve when you complete your profile. Missing:
          {" "}
          {essentialGaps.join(", ")}.{" "}
          <Link href="/dashboard/profile" className="font-semibold underline underline-offset-2">
            Update profile
          </Link>
        </div>
      ) : null}

      {snapshot && allResults.length > 0 ? (
        <>
          <section aria-labelledby="priority-heading" className="mt-8 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="priority-heading" className="font-semibold text-zinc-950">
                Priority weighting
              </h2>
              <button
                type="button"
                onClick={() => setWeights(DEFAULT_WEIGHTS)}
                className="text-xs font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
              >
                Reset to default
              </button>
            </div>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Drag the sliders toward what matters most to you - the ranking below re-orders instantly.
            </p>
            <div className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {WEIGHT_FIELDS.map((field) => (
                <div key={field.key}>
                  <label htmlFor={`weight-${field.key}`} className="flex items-center justify-between text-sm font-medium text-zinc-800">
                    <span>{field.label}</span>
                    <span className="text-xs font-bold text-emerald-700">
                      {Math.round((weights[field.key] / weightTotal) * 100)}%
                    </span>
                  </label>
                  <input
                    id={`weight-${field.key}`}
                    type="range"
                    min={0}
                    max={40}
                    step={1}
                    value={weights[field.key]}
                    onChange={(event) =>
                      setWeights((current) => ({ ...current, [field.key]: Number(event.target.value) }))
                    }
                    className="mt-1.5 w-full accent-emerald-600"
                  />
                  <p className="text-[11px] text-zinc-400">{field.hint}</p>
                </div>
              ))}
            </div>
          </section>

          <section aria-labelledby="controls-heading" className="mt-6 flex flex-wrap items-end gap-3">
            <h2 id="controls-heading" className="sr-only">
              Filter and sort
            </h2>
            <div>
              <label htmlFor="sort-key" className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Sort by
              </label>
              <select
                id="sort-key"
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
                className="mt-1 h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="score">Match score</option>
                <option value="salary">Salary (high first)</option>
                <option value="cost">Cost (low first)</option>
                <option value="timeline">Fastest first</option>
                <option value="demand">Demand level</option>
              </select>
            </div>
            <div>
              <label htmlFor="region-filter" className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Region
              </label>
              <select
                id="region-filter"
                value={regionFilter}
                onChange={(event) => setRegionFilter(event.target.value)}
                className="mt-1 h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">All regions</option>
                {REGION_OPTIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="category-filter" className="block text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Job category
              </label>
              <select
                id="category-filter"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="mt-1 h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            {compareIds.length > 0 ? (
              <button
                type="button"
                onClick={() => setCompareIds([])}
                className="ml-auto text-xs font-semibold text-zinc-500 underline underline-offset-2 hover:text-zinc-800"
              >
                Clear comparison ({compareIds.length})
              </button>
            ) : null}
          </section>

          {compared.length >= 2 ? (
            <section aria-labelledby="compare-heading" className="mt-6 overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
              <h2 id="compare-heading" className="border-b border-zinc-200 px-5 py-3 font-semibold text-zinc-950">
                Side-by-side comparison
              </h2>
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                    <th className="px-5 py-2.5 font-semibold">Attribute</th>
                    {compared.map((item) => (
                      <th key={item.corridorId} className="px-5 py-2.5 font-semibold">
                        {item.jobTitle}, {item.country}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {[
                    { label: "Match score", render: (item: MatchResult) => `${item.matchScore}%` },
                    { label: "Eligibility", render: (item: MatchResult) => eligibilityMeta[item.eligibility].label },
                    { label: "Monthly salary", render: (item: MatchResult) => item.salaryLabel },
                    { label: "Migration cost", render: (item: MatchResult) => item.costLabel },
                    { label: "Timeline", render: (item: MatchResult) => item.timelineLabel },
                    { label: "Demand", render: (item: MatchResult) => item.demandLevel },
                    {
                      label: "Data confidence",
                      render: (item: MatchResult) =>
                        item.confidence === "verified" ? "Verified source" : "Estimated",
                    },
                    {
                      label: "Top gap",
                      render: (item: MatchResult) => item.missingRequirements[0] ?? "None",
                    },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td className="px-5 py-2.5 font-medium text-zinc-500">{row.label}</td>
                      {compared.map((item) => (
                        <td key={`${row.label}-${item.corridorId}`} className="px-5 py-2.5 text-zinc-800">
                          {row.render(item)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}

          <div aria-live="polite" className="space-y-10 py-9">
            {(["best-fit", "achievable-soon", "stretch-option"] as MatchTier[]).map((tier) => {
              const items = tiers[tier === "best-fit" ? "bestFit" : tier === "achievable-soon" ? "achievableSoon" : "stretchOptions"];
              if (items.length === 0) return null;
              const meta = tierMeta[tier];

              return (
                <section key={tier} aria-labelledby={`${tier}-heading`}>
                  <div className="mb-4 flex items-start gap-2.5">
                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${meta.dotClass}`} />
                    <div>
                      <h2 id={`${tier}-heading`} className="text-xl font-semibold text-zinc-950">
                        {meta.title}
                        <span className={`ml-2.5 rounded-full px-2 py-0.5 align-middle text-xs font-semibold ring-1 ring-inset ${meta.badgeClass}`}>
                          {items.length}
                        </span>
                      </h2>
                      <p className="mt-1 text-sm text-zinc-600">{meta.blurb}</p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {items.map((result) => (
                      <MatchCard
                        key={result.corridorId}
                        result={result}
                        comparable={compareIds.includes(result.corridorId)}
                        compareFull={compareIds.length >= 3}
                        onToggleCompare={() => toggleCompare(result.corridorId)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {filteredResults.length === 0 ? (
              <div className="py-14 text-center">
                <h2 className="text-lg font-semibold text-zinc-950">No corridors match these filters</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                  Try clearing the region or category filter to see every option.
                </p>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </>
  );
}
