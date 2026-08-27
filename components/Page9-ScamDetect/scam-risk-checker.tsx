"use client";

import { useState, type FormEvent } from "react";

import type { ScamRiskInput, RiskLevel } from "@/lib/scam-risk";

type AlternativeAgencyRecommendation = {
  name: string;
  verified: boolean;
  verificationLabel: string;
  safetyNote: string;
  sourceName: string;
  sourceType: string | null;
  sourceUrl: string | null;
  reason: string;
};

type ScamRiskAssessmentResponse = {
  agency: {
    name: string;
    found: boolean;
    isVerified: boolean;
    verificationStatus: string;
    freshness: string;
    isCurrent: boolean;
    notes: string[];
    source: {
      name: string;
      type: string | null;
      url: string | null;
      reference: string | null;
      documentUrl: string | null;
      retrievedAt: string | null;
    } | null;
    licenseStatus: string | null;
  };
  risk: {
    score: number;
    level: RiskLevel;
    factors: Array<{ title: string; description: string; points: number; severity: string; code: string }>;
    informationGaps: string[];
    standardNote: string;
  };
  officialSource: {
    name: string;
    type: string | null;
    url: string | null;
    reference: string | null;
    documentUrl: string | null;
    retrievedAt: string | null;
    freshness: string;
  } | null;
  alternatives: AlternativeAgencyRecommendation[];
};

const selectionReasons = [
  { value: "lowCost", label: "Low cost" },
  { value: "highSalary", label: "High salary" },
  { value: "fastProcessing", label: "Fast processing" },
  { value: "goodReputation", label: "Good reputation" },
  { value: "recommendation", label: "Recommendation" },
  { value: "promisedJob", label: "Promised job" },
  { value: "easyVisaProcessing", label: "Easy visa processing" },
] as const;

const defaultValues: ScamRiskInput = {
  agencyName: "",
  destinationCountry: "",
  occupation: "",
  offeredSalaryMonthly: undefined,
  agencyCost: undefined,
  claimedProcessingDays: undefined,
  selectionReasons: [],
  paymentToPersonalAccount: false,
  urgentPaymentRequest: false,
  guaranteedJob: false,
  guaranteedVisa: false,
  agencyVerificationStatus: "unknown",
  licenseStatus: "unknown",
  writtenContract: "unknown",
  employerIdentity: "unknown",
  feeBreakdown: "unknown",
};

export function ScamRiskChecker() {
  const [form, setForm] = useState<ScamRiskInput>(defaultValues);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScamRiskAssessmentResponse | null>(null);

  function handleChange<K extends keyof ScamRiskInput>(key: K, value: ScamRiskInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleReason(reason: ScamRiskInput["selectionReasons"][number]) {
    setForm((current) => {
      const exists = current.selectionReasons.includes(reason);
      const next = exists
        ? current.selectionReasons.filter((item) => item !== reason)
        : [...current.selectionReasons, reason];
      return { ...current, selectionReasons: next };
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch("/api/scam-risk/check", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as ScamRiskAssessmentResponse & { error?: string };
      if (!response.ok || !data.risk) {
        throw new Error(data.error || "Could not assess the agency risk.");
      }

      setResult(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not assess the agency risk.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="agencyName" className="mb-2 block text-sm font-medium text-zinc-800">Agency name</label>
            <input
              id="agencyName"
              type="text"
              value={form.agencyName}
              onChange={(event) => handleChange("agencyName", event.target.value)}
              required
              maxLength={160}
              className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="e.g. Verified Migration Services"
            />
          </div>

          <div>
            <label htmlFor="destinationCountry" className="mb-2 block text-sm font-medium text-zinc-800">Destination country</label>
            <input
              id="destinationCountry"
              type="text"
              value={form.destinationCountry}
              onChange={(event) => handleChange("destinationCountry", event.target.value)}
              required
              maxLength={100}
              className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="Germany"
            />
          </div>

          <div>
            <label htmlFor="occupation" className="mb-2 block text-sm font-medium text-zinc-800">Occupation</label>
            <input
              id="occupation"
              type="text"
              value={form.occupation}
              onChange={(event) => handleChange("occupation", event.target.value)}
              required
              maxLength={160}
              className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="Electrician"
            />
          </div>

          <div>
            <label htmlFor="offeredSalaryMonthly" className="mb-2 block text-sm font-medium text-zinc-800">Offered monthly salary</label>
            <input
              id="offeredSalaryMonthly"
              type="number"
              inputMode="numeric"
              min={0}
              value={form.offeredSalaryMonthly ?? ""}
              onChange={(event) => handleChange("offeredSalaryMonthly", event.target.value === "" ? undefined : Number(event.target.value))}
              className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="250000"
            />
          </div>

          <div>
            <label htmlFor="agencyCost" className="mb-2 block text-sm font-medium text-zinc-800">Agency cost</label>
            <input
              id="agencyCost"
              type="number"
              inputMode="numeric"
              min={0}
              value={form.agencyCost ?? ""}
              onChange={(event) => handleChange("agencyCost", event.target.value === "" ? undefined : Number(event.target.value))}
              className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="500000"
            />
          </div>

          <div>
            <label htmlFor="claimedProcessingDays" className="mb-2 block text-sm font-medium text-zinc-800">Claimed processing days</label>
            <input
              id="claimedProcessingDays"
              type="number"
              inputMode="numeric"
              min={0}
              value={form.claimedProcessingDays ?? ""}
              onChange={(event) => handleChange("claimedProcessingDays", event.target.value === "" ? undefined : Number(event.target.value))}
              className="h-11 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              placeholder="30"
            />
          </div>

          <div className="md:col-span-2">
            <p className="mb-3 text-sm font-medium text-zinc-800">Why this agency?</p>
            <div className="flex flex-wrap gap-2">
              {selectionReasons.map((reason) => {
                const selected = form.selectionReasons.includes(reason.value);
                return (
                  <button
                    key={reason.value}
                    type="button"
                    onClick={() => toggleReason(reason.value)}
                    className={[
                      "rounded-full border px-3 py-2 text-sm font-medium transition",
                      selected
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400",
                    ].join(" ")}
                  >
                    {reason.label}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={form.paymentToPersonalAccount}
              onChange={(event) => handleChange("paymentToPersonalAccount", event.target.checked)}
            />
            Payment to a personal account
          </label>

          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={form.urgentPaymentRequest}
              onChange={(event) => handleChange("urgentPaymentRequest", event.target.checked)}
            />
            Urgent payment request
          </label>

          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={form.guaranteedJob}
              onChange={(event) => handleChange("guaranteedJob", event.target.checked)}
            />
            Guaranteed job
          </label>

          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={form.guaranteedVisa}
              onChange={(event) => handleChange("guaranteedVisa", event.target.checked)}
            />
            Guaranteed visa
          </label>
        </div>

        {error ? (
          <p role="alert" className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-950 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {pending ? "Checking..." : "Check risk"}
          </button>
        </div>
      </form>

      {result ? (
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Risk assessment</p>
              <h2 className="mt-1 text-xl font-semibold text-zinc-950">{result.agency.name}</h2>
            </div>
            <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
              {result.risk.score}% risk indicator
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Risk level</p>
              <p className="mt-2 text-2xl font-bold text-zinc-950">{result.risk.level}</p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Verification</p>
              <p className="mt-2 text-lg font-semibold text-zinc-950">{result.agency.verificationStatus}</p>
            </div>
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">License status</p>
              <p className="mt-2 text-lg font-semibold text-zinc-950">{result.agency.licenseStatus ?? "unknown"}</p>
            </div>
          </div>

          <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {result.risk.standardNote}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-zinc-950">Risk factors</h3>
              {result.risk.factors.length > 0 ? (
                <ul className="mt-3 space-y-3">
                  {result.risk.factors.map((factor) => (
                    <li key={factor.code} className="rounded-md border border-zinc-200 bg-zinc-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-zinc-900">{factor.title}</p>
                        <span className="rounded-full bg-zinc-200 px-2 py-1 text-xs font-semibold text-zinc-700">{factor.points} pts</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-zinc-600">{factor.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-zinc-600">No clear risk indicators were identified from the current information.</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-zinc-950">Information gaps</h3>
              {result.risk.informationGaps.length > 0 ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-600">
                  {result.risk.informationGaps.map((item) => <li key={item}>{item}</li>)}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-zinc-600">No major information gaps were identified.</p>
              )}
              <div className="mt-6 rounded-md border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Agency note</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-600">
                  {result.agency.notes.map((note) => <li key={note}>{note}</li>)}
                </ul>
              </div>
            </div>
          </div>

          {result.officialSource ? (
            <div className="mt-8 rounded-md border border-zinc-200 bg-zinc-50 p-4">
              <h3 className="text-lg font-semibold text-zinc-950">Official verification source</h3>
              <p className="mt-2 text-sm text-zinc-700">{result.officialSource.name}</p>
              {result.officialSource.url ? (
                <a href={result.officialSource.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-medium text-emerald-700 underline underline-offset-2">
                  Open source link
                </a>
              ) : null}
              <p className="mt-2 text-sm text-zinc-600">Freshness: {result.officialSource.freshness}</p>
            </div>
          ) : null}

          {result.alternatives.length > 0 ? (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-zinc-950">Lower-risk alternatives</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {result.alternatives.map((agency) => (
                  <div key={agency.name} className="rounded-md border border-zinc-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-semibold text-zinc-950">{agency.name}</h4>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">{agency.verificationLabel}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-zinc-600">{agency.safetyNote}</p>
                    <p className="mt-3 text-sm text-zinc-600">{agency.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
