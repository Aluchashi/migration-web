"use client";

import { useState, type FormEvent } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShieldAlertIcon } from "@hugeicons/core-free-icons";
import { useTranslations } from "next-intl";

import type { ScamRiskInput, RiskLevel } from "@/lib/scam-risk";

const ICON_TILE = "bg-muted dark:bg-muted/10 mb-0 size-fit rounded-xl p-px";
const ICON_INNER =
  "flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-[inset_0_-2px_0.5px_0px_rgba(0,0,0,0),inset_0px_2px_0_2px_rgba(255,255,255,1),0_0px_6px_0_rgba(0,0,0,0.07),0_2px_4px_0_rgba(0,0,0,0.05)] dark:bg-black/20 dark:shadow-[inset_0_-1px_0px_0px_rgba(0,0,0,0.1),inset_0px_1px_0px_0px_rgba(255,255,255,0.05),0_0px_2px_0_rgba(0,0,0,0.2),0_1px_4px_0_rgba(0,0,0,0.05)]";

const riskLevelClass: Record<RiskLevel, string> = {
  LOW: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  MODERATE: "bg-amber-50 text-amber-800 ring-amber-200",
  ELEVATED: "bg-orange-50 text-orange-800 ring-orange-200",
  HIGH: "bg-red-50 text-red-800 ring-red-200",
  VERY_HIGH: "bg-red-50 text-red-800 ring-red-200",
};

const riskLevelLabel: Record<RiskLevel, string> = {
  LOW: "levelLow",
  MODERATE: "levelModerate",
  ELEVATED: "levelElevated",
  HIGH: "levelHigh",
  VERY_HIGH: "levelVeryHigh",
};

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
  { value: "lowCost", label: "lowCost" },
  { value: "highSalary", label: "highSalary" },
  { value: "fastProcessing", label: "fastProcessing" },
  { value: "goodReputation", label: "goodReputation" },
  { value: "recommendation", label: "recommendation" },
  { value: "promisedJob", label: "promisedJob" },
  { value: "easyVisaProcessing", label: "easyVisa" },
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

  const t = useTranslations("Dashboard.scamCheck");

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
        throw new Error(data.error || t("error"));
      }

      setResult(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t("error"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={onSubmit}
        className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="agencyName" className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-100">
              {t("agencyName")}
            </label>
            <input
              id="agencyName"
              type="text"
              value={form.agencyName}
              onChange={(event) => handleChange("agencyName", event.target.value)}
              required
              maxLength={160}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder={t("agencyNamePlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="destinationCountry" className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-100">
              {t("destination")}
            </label>
            <input
              id="destinationCountry"
              type="text"
              value={form.destinationCountry}
              onChange={(event) => handleChange("destinationCountry", event.target.value)}
              required
              maxLength={100}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder={t("destinationPlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="occupation" className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-100">
              {t("occupation")}
            </label>
            <input
              id="occupation"
              type="text"
              value={form.occupation}
              onChange={(event) => handleChange("occupation", event.target.value)}
              required
              maxLength={160}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder={t("occupationPlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="offeredSalaryMonthly" className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-100">
              {t("salary")}
            </label>
            <input
              id="offeredSalaryMonthly"
              type="number"
              inputMode="numeric"
              min={0}
              value={form.offeredSalaryMonthly ?? ""}
              onChange={(event) => handleChange("offeredSalaryMonthly", event.target.value === "" ? undefined : Number(event.target.value))}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder="250000"
            />
          </div>

          <div>
            <label htmlFor="agencyCost" className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-100">
              {t("cost")}
            </label>
            <input
              id="agencyCost"
              type="number"
              inputMode="numeric"
              min={0}
              value={form.agencyCost ?? ""}
              onChange={(event) => handleChange("agencyCost", event.target.value === "" ? undefined : Number(event.target.value))}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder="500000"
            />
          </div>

          <div>
            <label htmlFor="claimedProcessingDays" className="mb-2 block text-sm font-medium text-zinc-800 dark:text-zinc-100">
              {t("days")}
            </label>
            <input
              id="claimedProcessingDays"
              type="number"
              inputMode="numeric"
              min={0}
              value={form.claimedProcessingDays ?? ""}
              onChange={(event) => handleChange("claimedProcessingDays", event.target.value === "" ? undefined : Number(event.target.value))}
              className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              placeholder="30"
            />
          </div>

          <div className="md:col-span-2">
            <p className="mb-3 text-sm font-medium text-zinc-800 dark:text-zinc-100">{t("whyThisAgency")}</p>
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
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300"
                        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200",
                    ].join(" ")}
                  >
                    {t(reason.label)}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={form.paymentToPersonalAccount}
              onChange={(event) => handleChange("paymentToPersonalAccount", event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 accent-emerald-600"
            />
            {t("personalAccount")}
          </label>

          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={form.urgentPaymentRequest}
              onChange={(event) => handleChange("urgentPaymentRequest", event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 accent-emerald-600"
            />
            {t("urgentPayment")}
          </label>

          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={form.guaranteedJob}
              onChange={(event) => handleChange("guaranteedJob", event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 accent-emerald-600"
            />
            {t("guaranteedJob")}
          </label>

          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={form.guaranteedVisa}
              onChange={(event) => handleChange("guaranteedVisa", event.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 accent-emerald-600"
            />
            {t("guaranteedVisa")}
          </label>
        </div>

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
            disabled={pending}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {pending ? t("checking") : t("checkRisk")}
          </button>
        </div>
      </form>

      {result ? (
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
            <div className="flex items-start gap-3">
              <div className={ICON_TILE}>
                <div className={ICON_INNER}>
                  <HugeiconsIcon icon={ShieldAlertIcon} className="h-5 w-5 text-red-500" />
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("riskAssessment")}</p>
                <h2 className="mt-1 text-xl font-semibold text-zinc-950 dark:text-zinc-50">{result.agency.name}</h2>
              </div>
            </div>
            <span
              className={`rounded-xl px-3 py-2 text-sm font-semibold ring-1 ring-inset ${riskLevelClass[result.risk.level]}`}
            >
              {t("riskScore", { value: String(result.risk.score) })}
            </span>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl bg-muted/50 p-5 dark:bg-zinc-900/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("riskLevel")}</p>
              <p className="mt-2 text-2xl font-bold text-zinc-950 dark:text-zinc-50">
                {t(riskLevelLabel[result.risk.level])}
              </p>
            </div>
            <div className="rounded-3xl bg-muted/50 p-5 dark:bg-zinc-900/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("verification")}</p>
              <p className="mt-2 text-lg font-semibold text-zinc-950 dark:text-zinc-50">{result.agency.verificationStatus}</p>
            </div>
            <div className="rounded-3xl bg-muted/50 p-5 dark:bg-zinc-900/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("license")}</p>
              <p className="mt-2 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                {result.agency.licenseStatus ?? t("unknown")}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40">
            {result.risk.standardNote}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">{t("riskFactors")}</h3>
              {result.risk.factors.length > 0 ? (
                <ul className="mt-3 space-y-3">
                  {result.risk.factors.map((factor) => (
                    <li
                      key={factor.code}
                      className="rounded-3xl border border-zinc-200 bg-muted/50 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{factor.title}</p>
                        <span className="rounded-full bg-zinc-200 px-2 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200">
                          {t("points", { value: String(factor.points) })}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{factor.description}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                  {t("noRisk")}
                </p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">{t("infoGaps")}</h3>
              {result.risk.informationGaps.length > 0 ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {result.risk.informationGaps.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{t("noGaps")}</p>
              )}
              <div className="mt-6 rounded-3xl border border-zinc-200 bg-muted/50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{t("agencyNote")}</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {result.agency.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {result.officialSource ? (
            <div className="mt-8 rounded-3xl border border-zinc-200 bg-muted/50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">{t("officialSource")}</h3>
              <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{result.officialSource.name}</p>
              {result.officialSource.url ? (
                <a
                  href={result.officialSource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-emerald-700 underline underline-offset-2"
                >
                  {t("openSource")}
                </a>
              ) : null}
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t("freshness")} {result.officialSource.freshness}</p>
            </div>
          ) : null}

          {result.alternatives.length > 0 ? (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">{t("alternatives")}</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {result.alternatives.map((agency) => (
                  <div
                    key={agency.name}
                    className="rounded-3xl border border-zinc-200 bg-muted/50 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="font-semibold text-zinc-950 dark:text-zinc-50">{agency.name}</h4>
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                        {agency.verificationLabel}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{agency.safetyNote}</p>
                    <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{agency.reason}</p>
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
