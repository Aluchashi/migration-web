"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { HugeiconsIcon } from "@hugeicons/react";
import { GlobalSearchIcon } from "@hugeicons/core-free-icons";

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
import { Dropdown } from "@/components/Elements/dropdown";

type CareerMatcherProps = {
  snapshot: ProfileSnapshot | null;
  essentialGaps: string[];
};

type SortKey = "score" | "salary" | "cost" | "timeline" | "demand";

const ICON_TILE = "bg-muted dark:bg-muted/10 mb-0 size-fit rounded-xl p-px";
const ICON_INNER =
  "flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-[inset_0_-2px_0.5px_0px_rgba(0,0,0,0),inset_0px_2px_0_2px_rgba(255,255,255,1),0_0px_6px_0_rgba(0,0,0,0.07),0_2px_4px_0_rgba(0,0,0,0.05)] dark:bg-black/20 dark:shadow-[inset_0_-1px_0px_0px_rgba(0,0,0,0.1),inset_0px_1px_0px_0px_rgba(255,255,255,0.05),0_0px_2px_0_rgba(0,0,0,0.2),0_1px_4px_0_rgba(0,0,0,0.05)]";

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
  { titleKey: string; blurbKey: string; dotClass: string; badgeClass: string }
> = {
  "best-fit": {
    titleKey: "bestFitNow",
    blurbKey: "bestFitBlurb",
    dotClass: "bg-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  },
  "achievable-soon": {
    titleKey: "achievableSoon",
    blurbKey: "achievableBlurb",
    dotClass: "bg-amber-400",
    badgeClass: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  "stretch-option": {
    titleKey: "stretch",
    blurbKey: "stretchBlurb",
    dotClass: "bg-sky-500",
    badgeClass: "bg-sky-50 text-sky-800 ring-sky-200",
  },
};

const eligibilityMeta: Record<
  MatchResult["eligibility"],
  { labelKey: string; className: string }
> = {
  eligible: {
    labelKey: "eligible",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  partial: {
    labelKey: "partiallyEligible",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  "not-yet": {
    labelKey: "notYetEligible",
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
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-200/70 dark:bg-zinc-700">
        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${value}%` }} />
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
  const t = useTranslations("Dashboard.careerMatcher");

  return (
    <article className="group flex flex-col rounded-3xl bg-muted/50 p-6 shadow-none ring-0 transition-all duration-300 hover:shadow-[0_12px_34px_rgba(0,0,0,0.16)] dark:hover:shadow-[0_12px_34px_rgba(0,0,0,0.6)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={ICON_TILE}>
            <div className={ICON_INNER}>
              <HugeiconsIcon icon={GlobalSearchIcon} className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <div className="min-w-0">
            <Link
              href={`/dashboard/career-matcher/${result.corridorId}`}
              className="block font-semibold leading-snug text-zinc-950 hover:text-emerald-700 hover:underline underline-offset-2 dark:text-zinc-50"
            >
              {result.jobTitle} &mdash; {result.country}
            </Link>
            <p className="mt-1 text-xs text-zinc-500">{result.category}</p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${eligibility.className}`}
        >
          {t(eligibility.labelKey)}
        </span>
      </div>

      <div className="mt-5">
        <div className="flex items-end justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{t("matchScore")}</span>
          <span className="text-2xl font-extrabold leading-none text-zinc-950 dark:text-zinc-50">
            {result.matchScore}%
          </span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200/70 dark:bg-zinc-700"
          role="progressbar"
          aria-label={t("matchScoreAria", { jobTitle: result.jobTitle })}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={result.matchScore}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600"
            style={{ width: `${result.matchScore}%` }}
          />
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{t("salary")}</dt>
          <dd className="mt-0.5 font-medium text-zinc-800 dark:text-zinc-100">{result.salaryLabel}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{t("migrationCost")}</dt>
          <dd className="mt-0.5 font-medium text-zinc-800 dark:text-zinc-100">{result.costLabel}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{t("timeline")}</dt>
          <dd className="mt-0.5 font-medium text-zinc-800 dark:text-zinc-100">{result.timelineLabel}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{t("demand")}</dt>
          <dd className="mt-0.5 flex items-center gap-1.5 font-medium capitalize text-zinc-800 dark:text-zinc-100">
            <span
              className={`h-1.5 w-1.5 rounded-full ${result.demandLevel === "high" ? "bg-emerald-500" : result.demandLevel === "medium" ? "bg-amber-400" : "bg-zinc-300"}`}
            />
            {result.demandLevel}
          </dd>
        </div>
      </dl>

      <p
        className={`mt-5 inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${result.confidence === "verified" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-orange-50 text-orange-700 ring-orange-200"}`}
      >
        {result.confidence === "verified" ? t("highConfidence") : t("estimated")}
      </p>

      {result.missingRequirements.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{t("missingRequirements")}</p>
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
        <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2.5 dark:border-sky-900/50 dark:bg-sky-950/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-300">{t("whatIf")}</p>
          <ul className="mt-1 space-y-1 text-xs leading-5 text-sky-900 dark:text-sky-100">
            {result.whatIf.map((scenario) => (
              <li key={scenario.action}>
                {t("scoreBecomes", { action: scenario.action, score: scenario.projectedScore })}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <details className="group/details mt-4 rounded-xl border border-zinc-200 open:bg-zinc-50/70 dark:border-zinc-800 dark:open:bg-zinc-900/40">
        <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-sm font-semibold text-zinc-700 hover:text-zinc-950 dark:text-zinc-200 dark:hover:text-zinc-50">
          {t("whyThis")}
          <span className="inline-block text-zinc-400 transition group-open/details:rotate-180">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </summary>
        <div className="space-y-3 border-t border-zinc-200 px-3 pb-3 pt-3 dark:border-zinc-800">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{t("explanation")}</p>
            <div className="mt-2 space-y-2">
              <SubscoreBar label={t("skillMatch")} value={result.subscores.skill} />
              <SubscoreBar label={t("language")} value={result.subscores.language} />
              <SubscoreBar label={t("experience")} value={result.subscores.experience} />
              <SubscoreBar label={t("budgetFit")} value={result.subscores.budget} />
              <SubscoreBar label={t("priorityAlignment")} value={result.subscores.priority} />
            </div>
            <p className="mt-2 text-[11px] leading-4 text-zinc-500">
              {t("weightedFormula")}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{t("explanationTitle")}</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-5 text-zinc-700 dark:text-zinc-300">
              {result.explanationBn.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </div>
      </details>

      <div className="mt-auto pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/skill-gap?job=${encodeURIComponent(result.jobTitle)}&country=${encodeURIComponent(result.country)}`}
            className="inline-flex h-9 items-center rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            {t("viewSkillGap")}
          </Link>
          <button
            type="button"
            disabled
            title={t("legalComingSoon")}
            className="inline-flex h-9 cursor-not-allowed items-center rounded-xl border border-zinc-200 px-3 text-xs font-semibold text-zinc-400 dark:border-zinc-700"
          >
            {t("legalProcess")}
          </button>
          <button
            type="button"
            disabled
            title={t("agencyComingSoon")}
            className="inline-flex h-9 cursor-not-allowed items-center rounded-xl border border-zinc-200 px-3 text-xs font-semibold text-zinc-400 dark:border-zinc-700"
          >
            {t("verifyAgency")}
          </button>
          <label className="ml-auto inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={comparable}
              disabled={!comparable && compareFull}
              onChange={onToggleCompare}
              className="h-3.5 w-3.5 rounded border-zinc-300 accent-emerald-600"
            />
            {t("compare")}
          </label>
        </div>
      </div>
    </article>
  );
}

export function CareerMatcher({ snapshot, essentialGaps }: CareerMatcherProps) {
  const t = useTranslations("Dashboard.careerMatcher");
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
      <div className="border-b border-zinc-200 pb-7 dark:border-zinc-800">
        <p className="text-sm font-medium text-emerald-700">{t("aiTagline")}</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-950 sm:text-3xl dark:text-zinc-50">
          {t("title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("subtitle")}
        </p>
      </div>

      <p className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs leading-5 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
        {t("scoresDisclaimer")}
      </p>

      {!snapshot ? (
        <div className="mt-6 rounded-2xl border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40">
          {t("notEnoughData")}
          <ul className="mt-2 list-disc pl-5">
            {essentialGaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
          <Link
            href="/dashboard/profile"
            className="mt-3 inline-flex font-semibold underline underline-offset-2"
          >
            {t("completeProfile")}
          </Link>
        </div>
      ) : null}

      {snapshot && essentialGaps.length > 0 ? (
        <div className="mt-6 rounded-2xl border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40">
          {t("missingInfo", { gaps: essentialGaps.join(", ") })}
          {" "}
          <Link href="/dashboard/profile" className="font-semibold underline underline-offset-2">
            {t("updateProfile")}
          </Link>
        </div>
      ) : null}

      {snapshot && allResults.length > 0 ? (
        <>
          <section aria-labelledby="priority-heading" className="mt-8 rounded-3xl bg-muted/50 p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="priority-heading" className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                {t("priorityWeighting")}
              </h2>
              <button
                type="button"
                onClick={() => setWeights(DEFAULT_WEIGHTS)}
                className="text-xs font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
              >
                {t("reset")}
              </button>
            </div>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              {t("sliderHint")}
            </p>
            <div className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {WEIGHT_FIELDS.map((field) => (
                <div key={field.key}>
                  <label
                    htmlFor={`weight-${field.key}`}
                    className="flex items-center justify-between text-sm font-medium text-zinc-800 dark:text-zinc-100"
                  >
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
              {t("filterAndSort")}
            </h2>
            <div>
              <label
                htmlFor="sort-key"
                className="block text-xs font-semibold uppercase tracking-wide text-zinc-400"
              >
                {t("sortBy")}
              </label>
              <Dropdown
                options={[
                  { value: "score", label: t("matchScore") },
                  { value: "salary", label: t("salaryHighFirst") },
                  { value: "cost", label: t("costLowFirst") },
                  { value: "timeline", label: t("fastestFirst") },
                  { value: "demand", label: t("demandLevelOption") },
                ]}
                value={sortKey}
                onValueChange={(v) => setSortKey(v as SortKey)}
                placeholder={t("sortBy")}
                title={t("sortBy")}
                className="mt-1"
              />
            </div>
            <div>
              <label
                htmlFor="region-filter"
                className="block text-xs font-semibold uppercase tracking-wide text-zinc-400"
              >
                {t("region")}
              </label>
              <Dropdown
                options={[
                  { value: "all", label: t("allRegions") },
                  ...REGION_OPTIONS.map((region) => ({ value: region, label: region })),
                ]}
                value={regionFilter}
                onValueChange={(v) => setRegionFilter(v)}
                placeholder={t("allRegions")}
                title={t("region")}
                className="mt-1"
              />
            </div>
            <div>
              <label
                htmlFor="category-filter"
                className="block text-xs font-semibold uppercase tracking-wide text-zinc-400"
              >
                {t("jobCategory")}
              </label>
              <Dropdown
                options={[
                  { value: "all", label: t("allCategories") },
                  ...categories.map((category) => ({ value: category, label: category })),
                ]}
                value={categoryFilter}
                onValueChange={(v) => setCategoryFilter(v)}
                placeholder={t("allCategories")}
                title={t("jobCategory")}
                className="mt-1"
              />
            </div>
            {compareIds.length > 0 ? (
              <button
                type="button"
                onClick={() => setCompareIds([])}
                className="ml-auto text-xs font-semibold text-zinc-500 underline underline-offset-2 hover:text-zinc-800"
              >
                {t("clearComparison", { count: compareIds.length })}
              </button>
            ) : null}
          </section>

          {compared.length >= 2 ? (
            <section
              aria-labelledby="compare-heading"
              className="mt-6 overflow-x-auto rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h2
                id="compare-heading"
                className="border-b border-zinc-200 px-5 py-3 font-semibold text-zinc-950 dark:border-zinc-800 dark:text-zinc-50"
              >
                {t("sideBySide")}
              </h2>
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/60">
                    <th className="px-5 py-2.5 font-semibold">{t("attribute")}</th>
                    {compared.map((item) => (
                      <th key={item.corridorId} className="px-5 py-2.5 font-semibold">
                        {item.jobTitle}, {item.country}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {[
                    { label: t("matchScore"), render: (item: MatchResult) => `${item.matchScore}%` },
                    { label: t("eligibility"), render: (item: MatchResult) => t(eligibilityMeta[item.eligibility].labelKey) },
                    { label: t("monthlySalary"), render: (item: MatchResult) => item.salaryLabel },
                    { label: t("migrationCost"), render: (item: MatchResult) => item.costLabel },
                    { label: t("timeline"), render: (item: MatchResult) => item.timelineLabel },
                    { label: t("demand"), render: (item: MatchResult) => item.demandLevel },
                    {
                      label: t("dataConfidence"),
                      render: (item: MatchResult) =>
                        item.confidence === "verified" ? t("verifiedSource") : t("estimated"),
                    },
                    {
                      label: t("topGap"),
                      render: (item: MatchResult) => item.missingRequirements[0] ?? t("none"),
                    },
                  ].map((row) => (
                    <tr key={row.label}>
                      <td className="px-5 py-2.5 font-medium text-zinc-500">{row.label}</td>
                      {compared.map((item) => (
                        <td
                          key={`${row.label}-${item.corridorId}`}
                          className="px-5 py-2.5 text-zinc-800 dark:text-zinc-100"
                        >
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
                      <h2
                        id={`${tier}-heading`}
                        className="flex items-center text-xl font-semibold text-zinc-950 dark:text-zinc-50"
                      >
                        {t(meta.titleKey)}
                        <span
                          className={`ml-2.5 rounded-full px-2 py-0.5 align-middle text-xs font-semibold ring-1 ring-inset ${meta.badgeClass}`}
                        >
                          {items.length}
                        </span>
                      </h2>
                      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t(meta.blurbKey)}</p>
                    </div>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2">
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
                <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  {t("noCorridors")}
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {t("clearFilter")}
                </p>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </>
  );
}
