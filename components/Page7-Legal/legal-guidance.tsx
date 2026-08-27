"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { toggleLegalStep } from "@/app/actions/legal-progress";
import type { Confidence, CountryLegalInfo, ProcessStep } from "@/lib/legal-process";

type CorridorRef = { corridorId: string; country: string; jobTitle: string };

type LegalGuidanceProps = {
  steps: ProcessStep[];
  countries: CountryLegalInfo[];
  corridors: CorridorRef[];
  initialCorridorId: string;
  progressByCorridor: Record<string, string[]>;
};

const confidenceBadge: Record<Confidence, { label: string; className: string }> = {
  verified: {
    label: "✅ Officially Verified",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  estimated: {
    label: "⚠️ Industry-typical, Not Officially Confirmed",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
  },
};

function ConfidencePill({ confidence }: { confidence: Confidence }) {
  const meta = confidenceBadge[confidence];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function SourceTag({ source, sourceUrl, date }: { source: string; sourceUrl: string; date: string }) {
  return (
    <p className="text-[11px] text-zinc-400">
      Source:{" "}
      <a href={sourceUrl} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">
        {source}
      </a>{" "}
      · verified {date}
    </p>
  );
}

function SectionCard({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <h3 className="text-base font-semibold text-zinc-950">{title}</h3>
        <span className="text-zinc-400">{open ? "▲" : "▼"}</span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-zinc-100 px-5 py-4">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function CompletionRing({ completed, total }: { completed: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const radius = 15.9;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative flex h-24 w-24 items-center justify-center">
      <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90">
        <circle cx="18" cy="18" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <motion.circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (circumference * pct) / 100 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-lg font-bold text-zinc-950">{pct}%</p>
        <p className="text-[10px] text-zinc-500">
          {completed}/{total}
        </p>
      </div>
    </div>
  );
}

export function LegalGuidance({
  steps,
  countries,
  corridors,
  initialCorridorId,
  progressByCorridor,
}: LegalGuidanceProps) {
  const [selected, setSelected] = useState(initialCorridorId);
  const [done, setDone] = useState<Record<string, string[]>>(progressByCorridor);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingSteps, setPendingSteps] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const country = useMemo(
    () => countries.find((item) => item.corridorId === selected) ?? countries[0],
    [countries, selected],
  );
  const completedSet = useMemo(() => new Set(done[selected] ?? []), [done, selected]);
  const currentIndex = steps.findIndex((step) => !completedSet.has(step.id));

  async function handleToggle(stepId: string) {
    const willComplete = !completedSet.has(stepId);
    setDone((prev) => {
      const current = new Set(prev[selected] ?? []);
      if (willComplete) current.add(stepId);
      else current.delete(stepId);
      return { ...prev, [selected]: Array.from(current) };
    });
    setPendingSteps((prev) => new Set(prev).add(stepId));
    try {
      const result = await toggleLegalStep(selected, stepId, willComplete);
      if (result.error) throw new Error(result.error);
      setError(null);
    } catch {
      setDone((prev) => {
        const current = new Set(prev[selected] ?? []);
        if (willComplete) current.delete(stepId);
        else current.add(stepId);
        return { ...prev, [selected]: Array.from(current) };
      });
      setError("সেভ করা যায়নি, আবার চেষ্টা করুন।");
    } finally {
      setPendingSteps((prev) => {
        const next = new Set(prev);
        next.delete(stepId);
        return next;
      });
    }
  }

  return (
    <>
      <div className="border-b border-zinc-200 pb-7">
        <p className="text-sm font-medium text-emerald-700">Official process, made clear</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-950 sm:text-3xl">Legal Migration Guidance</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
          Step-by-step government process for your selected destination. Mark steps as you complete them - your
          progress is saved.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <label htmlFor="country-select" className="mb-1 block text-sm font-medium text-zinc-800">
            কোন দেশের জন্য প্রক্রিয়া দেখতে চান?
          </label>
          <select
            id="country-select"
            value={selected}
            onChange={(event) => {
              setSelected(event.target.value);
              setExpandedId(null);
            }}
            className="h-11 w-full max-w-sm rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-950 outline-none transition hover:border-zinc-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          >
            {corridors.map((corridor) => (
              <option key={corridor.corridorId} value={corridor.corridorId}>
                {corridor.country} — {corridor.jobTitle}
              </option>
            ))}
          </select>
        </div>
        <CompletionRing completed={completedSet.size} total={steps.length} />
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <h2 className="mt-8 text-lg font-semibold text-zinc-950">Pre-Departure Process ({country.country})</h2>

      <ol className="mt-4 space-y-0">
        {steps.map((step, index) => {
          const isCompleted = completedSet.has(step.id);
          const isCurrent = index === currentIndex;
          const isExpanded = expandedId === step.id;
          const isLast = index === steps.length - 1;
          const segmentFilled = isCompleted; // line below this node is filled if this step done

          return (
            <motion.li
              key={step.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
              className="relative flex gap-4"
            >
              <div className="flex flex-col items-center">
                <motion.div
                  whileHover={{ scale: 1.06 }}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-lg ${
                    isCompleted
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : isCurrent
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-zinc-300 bg-white text-zinc-400"
                  }`}
                >
                  {isCompleted ? (
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={3}>
                      <motion.path
                        d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                      />
                    </svg>
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </motion.div>
                {!isLast ? (
                  <div className={`w-0.5 flex-1 ${segmentFilled ? "bg-emerald-400" : "bg-zinc-200"}`} style={{ minHeight: 28 }} />
                ) : null}
              </div>

              <div className={`flex-1 pb-6 ${isCurrent ? "rounded-lg bg-emerald-50/60 p-3 ring-1 ring-emerald-200" : "p-3"}`}>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : step.id)}
                  className="flex w-full items-start justify-between gap-3 text-left"
                  aria-expanded={isExpanded}
                >
                  <div>
                    <p className="font-semibold text-zinc-950">
                      {step.titleBn}
                      <span className="ml-2 text-xs font-normal text-zinc-400">{step.titleEn}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">{step.estimatedDuration}</p>
                  </div>
                  <span className="text-zinc-400">{isExpanded ? "▲" : "▼"}</span>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-3 border-t border-zinc-100 pt-3">
                        <p className="text-sm leading-6 text-zinc-600">{step.description}</p>

                        {step.documents.length > 0 ? (
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Documents</p>
                            <ul className="mt-1 list-inside list-disc text-sm text-zinc-700">
                              {step.documents.map((doc) => (
                                <li key={doc}>{doc}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        <div className="flex flex-wrap items-center gap-3">
                          <a
                            href={step.officialLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-medium text-emerald-700 hover:underline"
                          >
                            Official link ↗
                          </a>
                          <ConfidencePill confidence={step.confidence} />
                        </div>
                        <SourceTag source={step.source} sourceUrl={step.sourceUrl} date={step.lastVerifiedDate} />

                        <button
                          type="button"
                          disabled={pendingSteps.has(step.id)}
                          onClick={() => handleToggle(step.id)}
                          className={`mt-1 inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-semibold text-white transition ${
                            isCompleted
                              ? "bg-zinc-500 hover:bg-zinc-600"
                              : "bg-emerald-600 hover:bg-emerald-700"
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        >
                          {pendingSteps.has(step.id)
                            ? "সেভ হচ্ছে..."
                            : isCompleted
                              ? "↺ পূর্বাবস্থায় ফিরিয়ে দিন"
                              : "✓ আমি সম্পন্ন করেছি"}
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.li>
          );
        })}
      </ol>

      {currentIndex === -1 ? (
        <p className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          🎉 সব ধাপ সম্পন্ন! আপনি যাত্রার জন্য প্রস্তুত।
        </p>
      ) : null}

      <div className="mt-10 space-y-4">
        <SectionCard title="Recruiting Agency Verification" defaultOpen>
          <div className="space-y-2 text-sm text-zinc-700">
            <p>
              BAIRA লাইসেন্স যাচাই করুন:{" "}
              <a href={country.agency.bairaCheckUrl} target="_blank" rel="noreferrer" className="font-medium text-emerald-700 hover:underline">
                BAIRA portal ↗
              </a>
            </p>
            <p>{country.agency.boeslNote}</p>
            <ConfidencePill confidence={country.agency.confidence} />
            <div className="pt-1">
              <SourceTag source={country.agency.source} sourceUrl={country.agency.sourceUrl} date={country.agency.lastVerifiedDate} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Country-Specific Requirements">
          <div className="space-y-4 text-sm text-zinc-700">
            <div>
              <p className="font-semibold text-zinc-900">Visa</p>
              <p>
                <span className="font-medium">{country.visa.type}</span> — {country.visa.validity}
              </p>
              {country.visa.note ? <p className="mt-1 text-zinc-500">{country.visa.note}</p> : null}
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <ConfidencePill confidence={country.visa.confidence} />
                <SourceTag source={country.visa.source} sourceUrl={country.visa.sourceUrl} date={country.visa.lastVerifiedDate} />
              </div>
            </div>
            <div>
              <p className="font-semibold text-zinc-900">Medical check-up</p>
              <p>{country.medical.requirement}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <ConfidencePill confidence={country.medical.confidence} />
                <SourceTag source={country.medical.source} sourceUrl={country.medical.sourceUrl} date={country.medical.lastVerifiedDate} />
              </div>
            </div>
            <div>
              <p className="font-semibold text-zinc-900">Embassy attestation</p>
              <p>
                {country.embassyAttestation.required ? "প্রয়োজন" : "সাধারণত লাগে না"} — {country.embassyAttestation.note}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <ConfidencePill confidence={country.embassyAttestation.confidence} />
                <SourceTag
                  source={country.embassyAttestation.source}
                  sourceUrl={country.embassyAttestation.sourceUrl}
                  date={country.embassyAttestation.lastVerifiedDate}
                />
              </div>
            </div>
            <div>
              <p className="font-semibold text-zinc-900">Document checklist</p>
              <ul className="mt-1 list-inside list-disc text-zinc-700">
                {country.documentChecklist.map((doc) => (
                  <li key={doc}>{doc}</li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Cost Transparency">
          <div className="space-y-3">
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Government cap</p>
              <p className="mt-1 text-sm font-medium text-emerald-900">{country.cost.governmentCapLabel}</p>
            </div>
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700">⚠️ Warning</p>
              <p className="mt-1 text-sm text-red-800">{country.cost.warningNote}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ConfidencePill confidence={country.cost.confidence} />
              <SourceTag source={country.cost.source} sourceUrl={country.cost.sourceUrl} date={country.cost.lastVerifiedDate} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Post-Arrival Safety">
          <div className="space-y-2 text-sm text-zinc-700">
            <p>
              <span className="font-semibold text-zinc-900">Embassy:</span> {country.postArrival.embassyContact}
            </p>
            <p>
              <span className="font-semibold text-zinc-900">Helpline:</span> {country.postArrival.helpline}
            </p>
            <p>
              <span className="font-semibold text-zinc-900">Complaint:</span> {country.postArrival.complaintProcess}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <ConfidencePill confidence={country.postArrival.confidence} />
              <SourceTag
                source={country.postArrival.source}
                sourceUrl={country.postArrival.sourceUrl}
                date={country.postArrival.lastVerifiedDate}
              />
            </div>
          </div>
        </SectionCard>
      </div>

      <p className="mt-8 text-xs text-zinc-400">
        তথ্য কিউরেটেড ও সোর্স-ট্যাগ করা। কনফিডেন্স &quot;estimated&quot; হলে আনুমানিক — আপনার যাত্রার আগে সরকারি সাইট থেকে যাচাই করুন।
      </p>
    </>
  );
}
