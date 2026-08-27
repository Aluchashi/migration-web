import Link from "next/link";

import type { MatchResult } from "@/lib/career-scoring";
import type { MigrationCorridor } from "@/lib/migration-corridors";

type CorridorDetailProps = {
  corridor: MigrationCorridor;
  result: MatchResult | null;
  essentialGaps: string[];
};

const eligibilityMeta: Record<
  MatchResult["eligibility"],
  { label: string; className: string }
> = {
  eligible: { label: "Eligible", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  partial: { label: "Partially eligible", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  "not-yet": { label: "Not yet eligible", className: "bg-red-50 text-red-700 ring-red-200" },
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

export function CorridorDetail({ corridor, result, essentialGaps }: CorridorDetailProps) {
  const requirements = corridor.requirements;
  const eligibility = result ? eligibilityMeta[result.eligibility] : null;

  const requirementRows: Array<{ label: string; value: string }> = [
    { label: "Age range", value: `${requirements.minAge} - ${requirements.maxAge} years` },
    { label: "Minimum experience", value: `${requirements.minExperienceYears}+ years` },
    {
      label: "Minimum education",
      value: requirements.minEducationLevel ? requirements.minEducationLevel : "No formal requirement",
    },
    {
      label: "Required certifications",
      value: requirements.requiredCertifications.length ? requirements.requiredCertifications.join(", ") : "None specified",
    },
    {
      label: "Language",
      value: `${requirements.languageNames.join(" or ")} - ${requirements.languageLevel}`,
    },
    { label: "Medical", value: requirements.medicalRequirement },
  ];

  return (
    <>
      <Link
        href="/dashboard/career-matcher"
        className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
      >
        &larr; All matches
      </Link>

      <div className="mt-5 flex flex-col gap-3 border-b border-zinc-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Country &amp; job detail</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-950 sm:text-3xl">
            {corridor.jobTitle} &mdash; {corridor.country}
          </h1>
          <p className="mt-2 text-sm text-zinc-600">{corridor.category}</p>
        </div>
        {eligibility ? (
          <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${eligibility.className}`}>
            {eligibility.label}
          </span>
        ) : null}
      </div>

      {result ? (
        <>
          <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-600">Your match score</span>
              <span className="text-2xl font-bold text-zinc-950">{result.matchScore}%</span>
            </div>
            <div
              className="mt-2 h-2.5 overflow-hidden rounded-full bg-zinc-100"
              role="progressbar"
              aria-label="Match score"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={result.matchScore}
            >
              <div className="h-full rounded-full bg-emerald-600" style={{ width: `${result.matchScore}%` }} />
            </div>
            <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              <SubscoreBar label="Skill match" value={result.subscores.skill} />
              <SubscoreBar label="Language" value={result.subscores.language} />
              <SubscoreBar label="Experience" value={result.subscores.experience} />
              <SubscoreBar label="Budget fit" value={result.subscores.budget} />
              <SubscoreBar label="Priority alignment" value={result.subscores.priority} />
            </div>
            <p className="mt-3 text-[11px] leading-4 text-zinc-500">
              Weighted rule-based formula (skill + language + experience + budget + priority). No
              AI-generated scores - the same profile always produces the same result.
            </p>
          </div>

          <section aria-labelledby="checks-heading" className="mt-6">
            <h2 id="checks-heading" className="font-semibold text-zinc-950">
              Eligibility checks against your profile
            </h2>
            <ul className="mt-3 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white px-4 shadow-sm">
              {result.checks.map((check) => (
                <li key={check.key} className="flex items-start gap-3 py-4">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      check.passed
                        ? "bg-emerald-100 text-emerald-700"
                        : check.closeable
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {check.passed ? "✓" : check.closeable ? "!" : "✕"}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{check.label}</p>
                    <p className="mt-0.5 text-sm leading-6 text-zinc-600">{check.detailBn}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {result.missingRequirements.length > 0 ? (
            <section className="mt-6">
              <h2 className="font-semibold text-zinc-950">Missing requirements</h2>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {result.missingRequirements.map((item) => (
                  <span key={item} className="rounded-md bg-red-50 px-2 py-0.5 text-xs text-red-700">
                    {item}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {result.whatIf.length > 0 ? (
            <section className="mt-6 rounded-md border border-sky-100 bg-sky-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">What if?</p>
              <ul className="mt-1 space-y-1 text-xs leading-5 text-sky-900">
                {result.whatIf.map((scenario) => (
                  <li key={scenario.action}>
                    Complete <strong>{scenario.action}</strong> &rarr; score becomes{" "}
                    <strong>{scenario.projectedScore}%</strong>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="mt-6">
            <h2 className="font-semibold text-zinc-950">Why this match?</h2>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm leading-6 text-zinc-700">
              {result.explanationBn.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-zinc-950">Your personal match is not calculated yet</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Complete these in your profile to see your eligibility, score, and gaps for this corridor:
          </p>
          <ul className="mt-3 list-disc pl-5 text-sm text-zinc-700">
            {essentialGaps.map((gap) => (
              <li key={gap}>{gap}</li>
            ))}
          </ul>
          <Link
            href="/dashboard/profile"
            className="mt-4 inline-flex h-10 items-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Complete your profile
          </Link>
        </div>
      )}

      <section aria-labelledby="facts-heading" className="mt-8">
        <h2 id="facts-heading" className="font-semibold text-zinc-950">
          At a glance
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Monthly salary</p>
            <p className="mt-1 font-medium text-zinc-800">{corridor.monthlySalaryLabel}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Migration cost</p>
            <p className="mt-1 font-medium text-zinc-800">{corridor.migrationCostLabel}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Timeline</p>
            <p className="mt-1 font-medium text-zinc-800">{corridor.timelineLabel}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Demand</p>
            <p className="mt-1 font-medium capitalize text-zinc-800">{corridor.demandLevel}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="req-heading" className="mt-8">
        <h2 id="req-heading" className="font-semibold text-zinc-950">
          Official requirement dataset
        </h2>
        <dl className="mt-3 divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white px-4 shadow-sm">
          {requirementRows.map((row) => (
            <div key={row.label} className="flex flex-col gap-0.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <dt className="text-sm font-medium text-zinc-500">{row.label}</dt>
              <dd className="text-sm font-medium text-zinc-900 sm:text-right">{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-xs leading-5 text-zinc-500">{corridor.notes}</p>
      </section>

      <section aria-labelledby="source-heading" className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-5">
        <h2 id="source-heading" className="font-semibold text-zinc-950">
          Source &amp; verification
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-700">
          {corridor.confidence === "verified" ? (
            <span className="font-semibold text-emerald-700">Verified (official data)</span>
          ) : (
            <span className="font-semibold text-orange-700">Estimated (limited data)</span>
          )}{" "}
          - {corridor.confidenceNote ?? "Verify with the official source before paying any agent."}
        </p>
        <p className="mt-1 text-sm text-zinc-600">
          Source:{" "}
          <a
            href={corridor.sourceUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
          >
            {corridor.source}
          </a>
        </p>
        <p className="mt-1 text-xs text-zinc-500">Last verified: {corridor.lastVerifiedDate}</p>
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href={`/dashboard/skill-gap?job=${encodeURIComponent(corridor.jobTitle)}&country=${encodeURIComponent(corridor.country)}`}
          className="inline-flex h-10 items-center rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          View skill gap for this role
        </Link>
        <button
          type="button"
          disabled
          title="Legal migration guidance module is coming soon"
          className="inline-flex h-10 cursor-not-allowed items-center rounded-md border border-zinc-200 px-4 text-sm font-semibold text-zinc-400"
        >
          Legal process
        </button>
        <button
          type="button"
          disabled
          title="Agency verification module is coming soon"
          className="inline-flex h-10 cursor-not-allowed items-center rounded-md border border-zinc-200 px-4 text-sm font-semibold text-zinc-400"
        >
          Verify agency
        </button>
      </div>
    </>
  );
}
