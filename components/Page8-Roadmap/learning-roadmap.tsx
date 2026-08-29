"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Tick02Icon, UserIcon } from "@hugeicons/core-free-icons";

import type { LearningMapPriority, LearningMapResult } from "@/lib/learning-map";
import { LoadingLoader } from "@/components/Elements/loading-loader";

type ProfileSummary = {
  currentJob: string | null;
  education: string | null;
  yearsExperience: number | null;
  skills: string[];
  languages: string[];
  location: string;
};
type Props = { hasProfile: boolean; profile: ProfileSummary };

const ICON_TILE = "bg-muted dark:bg-muted/10 mb-0 size-fit rounded-xl p-px";
const ICON_INNER =
  "flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-[inset_0_-2px_0.5px_0px_rgba(0,0,0,0),inset_0px_2px_0_2px_rgba(255,255,255,1),0_0px_6px_0_rgba(0,0,0,0.07),0_2px_4px_0_rgba(0,0,0,0.05)] dark:bg-black/20 dark:shadow-[inset_0_-1px_0px_0px_rgba(0,0,0,0.1),inset_0px_1px_0px_0px_rgba(255,255,255,0.05),0_0px_2px_0_rgba(0,0,0,0.2),0_1px_4px_0_rgba(0,0,0,0.05)]";

const targets: Record<string, string[]> = {
  Construction: ["Mason", "Steel Fixer", "Carpenter", "Construction Worker"],
  Electrical: ["Electrician", "Electrical Technician", "Maintenance Electrician"],
  Plumbing: ["Plumber", "Pipe Fitter", "Maintenance Plumber"],
  Welding: ["Welder", "MIG Welder", "TIG Welder"],
  Driving: ["Light Vehicle Driver", "Heavy Vehicle Driver", "Delivery Driver"],
  Hospitality: ["Waiter", "Cook", "Housekeeper"],
  Caregiving: ["Caregiver", "Nursing Assistant", "Elderly Care Assistant"],
  Manufacturing: ["Machine Operator", "Production Worker", "Quality Inspector"],
  IT: ["IT Support Technician", "Web Developer", "Data Entry Operator"],
  Agriculture: ["Farm Worker", "Greenhouse Worker", "Agricultural Technician"],
};
const countries = ["Saudi Arabia", "UAE", "Qatar", "Oman", "Kuwait", "Malaysia", "Japan", "South Korea", "Germany"];
const priorityClass: Record<LearningMapPriority, string> = {
  high: "bg-red-50 text-red-700 ring-red-200",
  medium: "bg-amber-50 text-amber-700 ring-amber-200",
  low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

function ProfileDetails({ profile }: { profile: ProfileSummary }) {
  const items = [
    ["Current occupation", profile.currentJob],
    ["Education", profile.education],
    ["Experience", profile.yearsExperience === null ? null : `${profile.yearsExperience} years`],
    ["Languages", profile.languages.join(", ") || null],
    ["Current location", profile.location],
  ];

  return (
    <section className="mt-7 rounded-3xl bg-muted/50 p-6 shadow-none ring-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className={ICON_TILE}>
            <div className={ICON_INNER}>
              <HugeiconsIcon icon={UserIcon} className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Your saved profile</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              This learning map uses your existing career information.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/profile"
          className="text-sm font-semibold text-emerald-700 underline underline-offset-2 sm:mt-0"
        >
          Update profile
        </Link>
      </div>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</dt>
              <dd className="mt-1 text-sm text-zinc-800 dark:text-zinc-100">{value}</dd>
            </div>
          ))}
        <div className="sm:col-span-2 lg:col-span-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Current skills</dt>
          <dd className="mt-2 flex flex-wrap gap-2">
            {profile.skills.length ? (
              profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-sm text-zinc-500">No skills saved</span>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}

export function LearningMap({ hasProfile, profile }: Props) {
  const [country, setCountry] = useState("");
  const [job, setJob] = useState("");
  const [position, setPosition] = useState("");
  const [result, setResult] = useState<LearningMapResult | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function analyze(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!country || !job || !position) {
      setError("Choose a target country, job, and position.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/learning-map", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ country, job, position }),
      });
      const data = (await response.json()) as { learningMap?: LearningMapResult; error?: string };
      if (!response.ok || !data.learningMap) {
        throw new Error(data.error || "Could not create your learning map.");
      }
      setResult(data.learningMap);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not create your learning map.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <header className="border-b border-zinc-200 pb-7 dark:border-zinc-800">
        <p className="text-sm font-medium text-emerald-700">Personalized career planning</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-950 sm:text-3xl dark:text-zinc-50">
          Your Personalized Learning Map
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          See what you already have, what you need to learn, and the steps to become job-ready for your
          target career abroad.
        </p>
      </header>

      {!hasProfile ? (
        <div className="mt-7 rounded-2xl border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/40">
          Add your career details to your{" "}
          <Link href="/dashboard/profile" className="font-semibold underline underline-offset-2">
            profile
          </Link>{" "}
          before creating a learning map.
        </div>
      ) : (
        <>
          <ProfileDetails profile={profile} />

          <form
            onSubmit={analyze}
            className="mt-7 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">Choose your target career</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Select where and what you want to work toward.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              {[
                ["Target country", country, setCountry, countries],
                ["Target job", job, (value: string) => {
                  setJob(value);
                  setPosition("");
                }, Object.keys(targets)],
                ["Target position", position, setPosition, job ? targets[job] : []],
              ].map(([label, value, setter, options], index) => (
                <div key={String(label)}>
                  <label
                    htmlFor={`target-${index}`}
                    className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-100"
                  >
                    {String(label)}
                  </label>
                  <select
                    id={`target-${index}`}
                    value={String(value)}
                    disabled={index === 2 && !job}
                    onChange={(event) => (setter as (value: string) => void)(event.target.value)}
                    className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                  >
                    <option value="">Select {String(label).toLowerCase()}</option>
                    {(options as string[]).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {error ? (
              <p
                role="alert"
                className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40"
              >
                {error}{" "}
                <button type="submit" className="font-semibold underline">
                  Try again
                </button>
              </p>
            ) : null}

            <div className="mt-6 flex justify-end border-t border-zinc-200 pt-5 dark:border-zinc-800">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {pending ? "Analyzing your profile..." : "Analyze My Career Path"}
              </button>
            </div>
          </form>
        </>
      )}

      {pending ? (
        <div
          role="status"
          className="mt-7 flex flex-col items-center rounded-3xl bg-muted/50 p-6 text-center"
        >
          <p className="font-semibold text-zinc-950 dark:text-zinc-50">Analyzing your profile...</p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Matching your skills with your target job. Building your personalized learning path...
          </p>
          <div className="mt-5">
            <LoadingLoader />
          </div>
        </div>
      ) : null}

      {result ? <Results result={result} /> : null}
    </>
  );
}

function Results({ result }: { result: LearningMapResult }) {
  return (
    <div className="space-y-8 py-9">
      <section className="flex flex-col gap-4 rounded-3xl bg-muted/50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
            {result.target.country} · {result.target.job}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-zinc-950 dark:text-zinc-50">
            {result.target.position}: Your Personalized Career Path
          </h2>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-3xl font-semibold text-emerald-800 dark:text-emerald-300">
            {result.readinessScore}%
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Job readiness</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Skills You Already Have</h2>
          <div className="mt-4 grid gap-3">
            {result.existingSkills.map((skill) => (
              <article
                key={skill.name}
                className="flex items-start gap-3 rounded-3xl border border-emerald-200 bg-muted/50 p-5 shadow-sm dark:border-emerald-900/50"
              >
                <HugeiconsIcon icon={Tick02Icon} className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold text-zinc-950 dark:text-zinc-50">{skill.name}</p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{skill.reason}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Skills You Need to Develop</h2>
          <div className="mt-4 grid gap-3">
            {result.skillGaps.map((skill) => (
              <article
                key={skill.name}
                className="rounded-3xl border border-amber-200 bg-muted/50 p-5 shadow-sm dark:border-amber-900/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <HugeiconsIcon icon={ArrowRight01Icon} className="mt-0.5 size-5 shrink-0 text-amber-500" />
                    <p className="font-semibold text-zinc-950 dark:text-zinc-50">{skill.name}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${priorityClass[skill.priority]}`}
                  >
                    {skill.priority}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{skill.reason}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section>
        <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">Your Learning Map</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Follow these steps in order to build job readiness.
        </p>
        <div className="mt-5 max-w-3xl rounded-3xl bg-muted/50 p-6">
          <div className="flex items-center gap-3 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
              <HugeiconsIcon icon={Tick02Icon} className="size-4" />
            </span>
            Your current skills
          </div>
          {result.roadmap.map((step) => (
            <div
              key={step.step}
              className="relative ml-4 border-l-2 border-emerald-200 pb-5 pl-7 pt-5 last:border-transparent dark:border-emerald-900/60"
            >
              <span className="absolute -left-4 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white dark:bg-emerald-600">
                {step.step}
              </span>
              <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="font-semibold text-zinc-950 dark:text-zinc-50">{step.title}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${priorityClass[step.priority]}`}
                  >
                    {step.priority} priority
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{step.description}</p>
                {step.estimatedEffort ? (
                  <p className="mt-3 text-xs font-medium text-zinc-500">Estimated effort: {step.estimatedEffort}</p>
                ) : null}
              </article>
            </div>
          ))}
          <div className="flex items-center gap-3 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-white dark:bg-emerald-600">
              <HugeiconsIcon icon={Tick02Icon} className="size-4" />
            </span>
            Job ready
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">What You Should Do Next</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {[
            ["Your strengths", result.jobReadiness.strengths],
            ["Focus improvements", result.jobReadiness.improvements],
            ["Practical next actions", result.jobReadiness.recommendations],
          ].map(([heading, items]) => (
            <div key={String(heading)}>
              <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{heading}</h3>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {(items as string[]).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
