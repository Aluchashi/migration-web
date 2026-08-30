"use client";

import { useMemo, useState } from "react";

import { ScrollTimeline, type TimelineEvent } from "@/components/Elements/scroll-timeline";
import { Dropdown } from "@/components/Elements/dropdown";
import type { Confidence, CountryLegalInfo, ProcessStep } from "@/lib/legal-process";

type CorridorRef = { corridorId: string; country: string; jobTitle: string };

type LegalGuidanceProps = {
  steps: ProcessStep[];
  countries: CountryLegalInfo[];
  corridors: CorridorRef[];
  initialCorridorId: string;
  checklistProgress: Record<string, Record<string, Record<string, true>>>;
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
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

function SourceTag({ source, sourceUrl, date }: { source: string; sourceUrl: string; date: string }) {
  return (
    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
      Source:{" "}
      <a href={sourceUrl} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline dark:text-emerald-400">
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
    <div className="rounded-3xl border border-zinc-200 bg-muted/50 p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left"
        aria-expanded={open}
      >
        <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">{title}</h3>
        <span className="text-zinc-400 dark:text-zinc-500">{open ? "▲" : "▼"}</span>
      </button>
      {open ? <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">{children}</div> : null}
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
        <circle cx="18" cy="18" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="3" className="dark:stroke-zinc-700" />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (circumference * pct) / 100}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-lg font-bold text-zinc-950 dark:text-zinc-50">{pct}%</p>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
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
  checklistProgress,
}: LegalGuidanceProps) {
  const [selected, setSelected] = useState(initialCorridorId);
  const [done, setDone] = useState<Record<string, Record<string, Record<string, true>>>>(checklistProgress);
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const country = useMemo(
    () => countries.find((item) => item.corridorId === selected) ?? countries[0],
    [countries, selected],
  );

  const totalItems = useMemo(() => steps.reduce((sum, step) => sum + step.documents.length, 0), [steps]);
  const completedItems = useMemo(() => {
    const corridor = done[selected] ?? {};
    let count = 0;
    for (const step of steps) {
      const items = corridor[step.id] ?? {};
      for (let i = 0; i < step.documents.length; i += 1) {
        if (items[String(i)]) count += 1;
      }
    }
    return count;
  }, [done, selected, steps]);

  const events: TimelineEvent[] = useMemo(
    () =>
      steps.map((step, index) => ({
        id: step.id,
        year: `Phase ${index + 1}`,
        title: step.titleBn,
        subtitle: step.titleEn,
        description: step.description,
        checklistItems: step.documents.map((doc, i) => ({
          id: String(i),
          label: doc,
          completed: Boolean(done[selected]?.[step.id]?.[String(i)]),
        })),
      })),
    [steps, done, selected],
  );

  async function handleToggleItem(phaseId: string, itemId: string, completed: boolean) {
    const key = `${phaseId}::${itemId}`;
    setDone((prev) => {
      const corridor = { ...(prev[selected] ?? {}) };
      const phase = { ...(corridor[phaseId] ?? {}) };
      if (completed) phase[itemId] = true;
      else delete phase[itemId];
      corridor[phaseId] = phase;
      return { ...prev, [selected]: corridor };
    });
    setPendingKeys((prev) => new Set(prev).add(key));
    setError(null);

    try {
      const res = await fetch("/api/legal-guidance-progress/item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ countryId: selected, phaseId, itemId, completed }),
      });
      if (!res.ok) throw new Error("request failed");
    } catch {
      setDone((prev) => {
        const corridor = { ...(prev[selected] ?? {}) };
        const phase = { ...(corridor[phaseId] ?? {}) };
        if (completed) delete phase[itemId];
        else phase[itemId] = true;
        corridor[phaseId] = phase;
        return { ...prev, [selected]: corridor };
      });
      setError("সেভ করা যায়নি, আবার চেষ্টা করুন।");
    } finally {
      setPendingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }

  return (
    <>
      <div className="border-b border-zinc-200 pb-7 dark:border-zinc-800">
        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Official process, made clear</p>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-950 sm:text-3xl dark:text-zinc-50">Legal Migration Guidance</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Step-by-step government process for your selected destination. Tick off each checklist item as you go - your
          progress is saved and the timeline fills in as you scroll.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-zinc-200 bg-muted/50 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800 dark:bg-zinc-900/60">
        <div>
          <label htmlFor="country-select" className="mb-1 block text-sm font-medium text-zinc-800 dark:text-zinc-200">
            কোন দেশের জন্য প্রক্রিয়া দেখতে চান?
          </label>
          <Dropdown
            options={corridors.map((corridor) => ({
              value: corridor.corridorId,
              label: `${corridor.country} - ${corridor.jobTitle}`,
            }))}
            value={selected}
            onValueChange={(v) => setSelected(v)}
            placeholder="Select a corridor"
            title="Country & job corridor"
            className="max-w-sm"
          />
        </div>
        <CompletionRing completed={completedItems} total={totalItems} />
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </p>
      ) : null}

      <h2 className="mt-8 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
        Pre-Departure Process ({country.country})
      </h2>

      <div className="mt-4">
        <ScrollTimeline events={events} onToggleItem={handleToggleItem} pendingKeys={pendingKeys} />
      </div>

      {completedItems === totalItems && totalItems > 0 ? (
        <p className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          🎉 সব ধাপ সম্পন্ন! আপনি যাত্রার জন্য প্রস্তুত।
        </p>
      ) : null}

      <div className="mt-10 space-y-4">
        <SectionCard title="Recruiting Agency Verification" defaultOpen>
          <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <p>
              BAIRA লাইসেন্স যাচাই করুন:{" "}
              <a href={country.agency.bairaCheckUrl} target="_blank" rel="noreferrer" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
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
          <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Visa</p>
              <p>
                <span className="font-medium">{country.visa.type}</span> — {country.visa.validity}
              </p>
              {country.visa.note ? <p className="mt-1 text-zinc-500 dark:text-zinc-400">{country.visa.note}</p> : null}
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <ConfidencePill confidence={country.visa.confidence} />
                <SourceTag source={country.visa.source} sourceUrl={country.visa.sourceUrl} date={country.visa.lastVerifiedDate} />
              </div>
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Medical check-up</p>
              <p>{country.medical.requirement}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <ConfidencePill confidence={country.medical.confidence} />
                <SourceTag source={country.medical.source} sourceUrl={country.medical.sourceUrl} date={country.medical.lastVerifiedDate} />
              </div>
            </div>
            <div>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Embassy attestation</p>
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
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">Document checklist</p>
              <ul className="mt-1 list-inside list-disc text-zinc-700 dark:text-zinc-300">
                {country.documentChecklist.map((doc) => (
                  <li key={doc}>{doc}</li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Cost Transparency">
          <div className="space-y-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/60 dark:bg-emerald-950/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Government cap</p>
              <p className="mt-1 text-sm font-medium text-emerald-900 dark:text-emerald-200">{country.cost.governmentCapLabel}</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/60 dark:bg-red-950/40">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">⚠️ Warning</p>
              <p className="mt-1 text-sm text-red-800 dark:text-red-300">{country.cost.warningNote}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ConfidencePill confidence={country.cost.confidence} />
              <SourceTag source={country.cost.source} sourceUrl={country.cost.sourceUrl} date={country.cost.lastVerifiedDate} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Post-Arrival Safety">
          <div className="space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <p>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Embassy:</span> {country.postArrival.embassyContact}
            </p>
            <p>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Helpline:</span> {country.postArrival.helpline}
            </p>
            <p>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">Complaint:</span> {country.postArrival.complaintProcess}
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

      <p className="mt-8 text-xs text-zinc-400 dark:text-zinc-500">
        তথ্য কিউরেটেড ও সোর্স-ট্যাগ করা। কনফিডেন্স &quot;estimated&quot; হলে আনুমানিক — আপনার যাত্রার আগে সরকারি সাইট থকে যাচাই করুন।
      </p>
    </>
  );
}
